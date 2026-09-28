import { ParserService } from '../parser.service';

describe('ParserService', () => {
  const parser = new ParserService();

  describe('JavaScript/TypeScript', () => {
    it('extracts named function declarations', () => {
      const result = parser.parse('export function calculateTotal(items) {\n  return items.length;\n}', 'JAVASCRIPT');
      expect(result.functions.map((f) => f.name)).toContain('calculateTotal');
    });

    it('extracts arrow function consts', () => {
      const result = parser.parse('const handleClick = () => {\n  doSomething();\n};', 'TYPESCRIPT');
      expect(result.functions.map((f) => f.name)).toContain('handleClick');
    });

    it('extracts class declarations', () => {
      const result = parser.parse('export class UserService {\n  find() {}\n}', 'TYPESCRIPT');
      expect(result.classes.map((c) => c.name)).toContain('UserService');
    });

    it('extracts import sources', () => {
      const result = parser.parse("import { useState } from 'react';\nimport Foo from './foo';", 'TYPESCRIPT');
      expect(result.imports).toEqual(['react', './foo']);
    });

    it('counts lines correctly', () => {
      const result = parser.parse('line1\nline2\nline3', 'JAVASCRIPT');
      expect(result.lineCount).toBe(3);
    });
  });

  describe('Python', () => {
    it('extracts function definitions', () => {
      const result = parser.parse('def calculate_total(items):\n    return len(items)', 'PYTHON');
      expect(result.functions.map((f) => f.name)).toContain('calculate_total');
    });

    it('extracts class definitions', () => {
      const result = parser.parse('class UserService:\n    def find(self):\n        pass', 'PYTHON');
      expect(result.classes.map((c) => c.name)).toContain('UserService');
    });

    it('extracts both import styles', () => {
      const result = parser.parse('import os\nfrom typing import Optional', 'PYTHON');
      expect(result.imports).toEqual(['os', 'typing']);
    });
  });

  describe('unsupported languages', () => {
    it('returns empty structured results without throwing', () => {
      const result = parser.parse('SELECT * FROM users;', 'SQL');
      expect(result).toEqual({ imports: [], functions: [], classes: [], lineCount: 1 });
    });
  });

  describe('edge cases', () => {
    it('handles empty file content', () => {
      const result = parser.parse('', 'JAVASCRIPT');
      expect(result.functions).toEqual([]);
      expect(result.lineCount).toBe(1); // ''.split('\n') is [''], one "line"
    });
  });
});
