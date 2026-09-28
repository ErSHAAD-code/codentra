import { Injectable, Logger } from '@nestjs/common';

import { GithubClient } from '@/modules/github/github-client';

export interface RepositoryTreeItem {
  path: string;
  type: 'tree' | 'blob';
  size?: number;
}

export interface FileContentResult {
  path: string;
  content: string;
  encoding: string;
  size: number;
}

export interface CodeSearchResult {
  path: string;
  matches: string[];
}

export interface DependencyInfo {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  framework?: string;
}

/**
 * Provides controlled, sandboxed tools that let the AI Agent read repository
 * data belonging to the authenticated user only.
 *
 * Security guarantees:
 *  - Every call requires userId — the GithubClient resolves that user's OAuth
 *    token from the database before hitting GitHub's API.
 *  - No server filesystem access. All data comes from the GitHub API.
 *  - File content is decoded + capped at MAX_FILE_BYTES to prevent token spam.
 *  - search_code performs a plain substring scan on the tree and file names,
 *    never on arbitrary server paths.
 */
@Injectable()
export class RepositoryToolsService {
  private readonly logger = new Logger(RepositoryToolsService.name);
  private static readonly MAX_FILE_BYTES = 20_000; // ~5k tokens cap per file

  constructor(private readonly github: GithubClient) {}

  /** List all file paths in the repository tree (safe — only path metadata). */
  async getRepositoryTree(
    userId: string,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<RepositoryTreeItem[]> {
    try {
      const data = (await this.github.getTree(userId, owner, repo, branch, true)) as any;
      const items: RepositoryTreeItem[] = (data?.tree ?? []).map((n: any) => ({
        path: n.path as string,
        type: n.type as 'tree' | 'blob',
        size: n.size as number | undefined,
      }));
      return items;
    } catch (err: any) {
      this.logger.warn(`getRepositoryTree failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Read a single file's decoded content.
   * Returns empty string on any error (permission / binary / too-large).
   */
  async readFile(
    userId: string,
    owner: string,
    repo: string,
    path: string,
    ref: string,
  ): Promise<string> {
    try {
      const data = (await this.github.getFileContent(userId, owner, repo, path, ref)) as any;
      if (!data?.content) return '';
      if (data.encoding === 'base64') {
        const raw = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
        return raw.slice(0, RepositoryToolsService.MAX_FILE_BYTES);
      }
      return String(data.content).slice(0, RepositoryToolsService.MAX_FILE_BYTES);
    } catch (err: any) {
      this.logger.warn(`readFile ${path} failed: ${err.message}`);
      return '';
    }
  }

  /**
   * Search file paths in a tree for a keyword.
   * Does NOT read file contents — path-level search only unless readMatches=true.
   */
  searchCode(tree: RepositoryTreeItem[], query: string): string[] {
    const q = query.toLowerCase();
    return tree
      .filter((item) => item.type === 'blob' && item.path.toLowerCase().includes(q))
      .map((item) => item.path)
      .slice(0, 20); // cap results
  }

  /**
   * Extract dependency info from a package.json string.
   * Safe — input is an already-fetched file string, not a filesystem read.
   */
  parseDependencies(packageJsonContent: string): DependencyInfo {
    try {
      const pkg = JSON.parse(packageJsonContent) as any;
      const deps = (pkg.dependencies ?? {}) as Record<string, string>;
      const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
      const allKeys = [...Object.keys(deps), ...Object.keys(devDeps)];

      let framework: string | undefined;
      if (allKeys.includes('next')) framework = 'Next.js';
      else if (allKeys.includes('react')) framework = 'React';
      else if (allKeys.includes('@nestjs/core')) framework = 'NestJS';
      else if (allKeys.includes('express')) framework = 'Express';
      else if (allKeys.includes('fastify')) framework = 'Fastify';
      else if (allKeys.includes('vue')) framework = 'Vue';
      else if (allKeys.includes('@angular/core')) framework = 'Angular';

      return { dependencies: deps, devDependencies: devDeps, framework };
    } catch {
      return { dependencies: {}, devDependencies: {} };
    }
  }
}
