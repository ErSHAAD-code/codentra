import { Injectable } from '@nestjs/common';
import { SupportedLanguage } from '@prisma/client';

export interface ParsedFunction {
  name: string;
  lineStart: number;
}

export interface ParsedClass {
  name: string;
  lineStart: number;
}

export interface ParseResult {
  imports: string[];
  functions: ParsedFunction[];
  classes: ParsedClass[];
  lineCount: number;
}

/**
 * Regex-based extraction per language. This is a deliberate scope choice:
 * a full AST parser (tree-sitter) gives more accurate results but is a
 * much bigger dependency surface. This service is the single seam where
 * that upgrade plugs in later — callers only depend on ParseResult, not
 * on how it's produced.
 */
@Injectable()
export class ParserService {
  parse(content: string, language: SupportedLanguage): ParseResult {
    const lineCount = content.split('\n').length;

    switch (language) {
      case 'JAVASCRIPT':
      case 'TYPESCRIPT':
        return { ...this.parseJsLike(content), lineCount };
      case 'PYTHON':
        return { ...this.parsePython(content), lineCount };
      default:
        return { imports: [], functions: [], classes: [], lineCount };
    }
  }

  private parseJsLike(content: string) {
    const imports = [...content.matchAll(/^import .*?from ['"](.+?)['"]/gm)]
      .map((m) => m[1])
      .filter((v): v is string => v !== undefined);
    const functions = [
      ...content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g),
      ...content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g),
    ]
      .filter((m) => m[1] !== undefined)
      .map((m) => ({ name: m[1] as string, lineStart: this.lineOf(content, m.index ?? 0) }));
    const classes = [...content.matchAll(/(?:export\s+)?class\s+(\w+)/g)]
      .filter((m) => m[1] !== undefined)
      .map((m) => ({ name: m[1] as string, lineStart: this.lineOf(content, m.index ?? 0) }));

    return { imports, functions, classes };
  }

  private parsePython(content: string) {
    const imports = [
      ...content.matchAll(/^import (\S+)/gm),
      ...content.matchAll(/^from (\S+) import/gm),
    ]
      .map((m) => m[1])
      .filter((v): v is string => v !== undefined);
    const functions = [...content.matchAll(/^def (\w+)\(/gm)]
      .filter((m) => m[1] !== undefined)
      .map((m) => ({ name: m[1] as string, lineStart: this.lineOf(content, m.index ?? 0) }));
    const classes = [...content.matchAll(/^class (\w+)/gm)]
      .filter((m) => m[1] !== undefined)
      .map((m) => ({ name: m[1] as string, lineStart: this.lineOf(content, m.index ?? 0) }));

    return { imports, functions, classes };
  }

  private lineOf(content: string, index: number): number {
    return content.slice(0, index).split('\n').length;
  }
}
