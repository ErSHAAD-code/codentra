import { Injectable } from '@nestjs/common';
import { SupportedLanguage } from '@prisma/client';

const EXTENSION_MAP: Record<string, SupportedLanguage> = {
  py: 'PYTHON',
  java: 'JAVA',
  js: 'JAVASCRIPT',
  jsx: 'JAVASCRIPT',
  ts: 'TYPESCRIPT',
  tsx: 'TYPESCRIPT',
  c: 'C',
  h: 'C',
  cpp: 'CPP',
  cc: 'CPP',
  hpp: 'CPP',
  go: 'GO',
  rs: 'RUST',
  php: 'PHP',
  kt: 'KOTLIN',
  swift: 'SWIFT',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
  json: 'JSON',
  yml: 'YAML',
  yaml: 'YAML',
  md: 'MARKDOWN',
};

// Config file -> framework/build-tool signal. First match wins per repo scan.
const FRAMEWORK_SIGNALS: Record<string, { framework: string; buildTool?: string; packageManager?: string }> = {
  'requirements.txt': { framework: 'Python', packageManager: 'pip' },
  'pyproject.toml': { framework: 'Python', packageManager: 'poetry' },
  'package.json': { framework: 'Node.js', packageManager: 'npm/pnpm/yarn' },
  'next.config.js': { framework: 'Next.js' },
  'pom.xml': { framework: 'Java', buildTool: 'Maven' },
  'build.gradle': { framework: 'Java/Kotlin', buildTool: 'Gradle' },
  'go.mod': { framework: 'Go', packageManager: 'go modules' },
  'Cargo.toml': { framework: 'Rust', packageManager: 'cargo' },
  'composer.json': { framework: 'PHP', packageManager: 'composer' },
};

@Injectable()
export class LanguageDetectorService {
  detectFromExtension(filePath: string): SupportedLanguage {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (!extension) return 'UNKNOWN';
    return EXTENSION_MAP[extension] ?? 'UNKNOWN';
  }

  /** Returns the highest-line-count language as "primary", rest as "secondary". */
  summarize(fileStats: Array<{ language: SupportedLanguage; lineCount: number }>) {
    const totals = new Map<SupportedLanguage, number>();
    for (const file of fileStats) {
      totals.set(file.language, (totals.get(file.language) ?? 0) + file.lineCount);
    }
    const sorted = [...totals.entries()]
      .filter(([lang]) => lang !== 'UNKNOWN')
      .sort((a, b) => b[1] - a[1]);

    return {
      primary: sorted[0]?.[0] ?? 'UNKNOWN',
      secondary: sorted.slice(1).map(([lang]) => lang),
    };
  }

  detectFrameworks(rootFileNames: string[]): Array<{ framework: string; buildTool?: string; packageManager?: string }> {
    return rootFileNames
      .map((name) => FRAMEWORK_SIGNALS[name])
      .filter((signal): signal is (typeof FRAMEWORK_SIGNALS)[string] => signal !== undefined);
  }
}
