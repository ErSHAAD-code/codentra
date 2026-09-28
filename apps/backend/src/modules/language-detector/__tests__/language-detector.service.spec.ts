import { LanguageDetectorService } from '../language-detector.service';

describe('LanguageDetectorService', () => {
  const service = new LanguageDetectorService();

  describe('detectFromExtension', () => {
    it.each([
      ['main.py', 'PYTHON'],
      ['App.tsx', 'TYPESCRIPT'],
      ['index.js', 'JAVASCRIPT'],
      ['Main.java', 'JAVA'],
      ['lib.rs', 'RUST'],
      ['README.md', 'MARKDOWN'],
    ])('maps %s to %s', (path, expected) => {
      expect(service.detectFromExtension(path)).toBe(expected);
    });

    it('returns UNKNOWN for an unrecognized extension', () => {
      expect(service.detectFromExtension('data.xyz')).toBe('UNKNOWN');
    });

    it('returns UNKNOWN for a file with no extension', () => {
      expect(service.detectFromExtension('Dockerfile')).toBe('UNKNOWN');
    });
  });

  describe('summarize', () => {
    it('picks the language with the most lines as primary', () => {
      const result = service.summarize([
        { language: 'PYTHON', lineCount: 500 },
        { language: 'JAVASCRIPT', lineCount: 100 },
      ]);
      expect(result.primary).toBe('PYTHON');
      expect(result.secondary).toEqual(['JAVASCRIPT']);
    });

    it('excludes UNKNOWN from primary/secondary results', () => {
      const result = service.summarize([
        { language: 'UNKNOWN', lineCount: 1000 },
        { language: 'TYPESCRIPT', lineCount: 50 },
      ]);
      expect(result.primary).toBe('TYPESCRIPT');
    });

    it('returns UNKNOWN as primary when there are no recognized files', () => {
      const result = service.summarize([{ language: 'UNKNOWN', lineCount: 10 }]);
      expect(result.primary).toBe('UNKNOWN');
      expect(result.secondary).toEqual([]);
    });
  });

  describe('detectFrameworks', () => {
    it('detects Next.js from next.config.js presence', () => {
      const frameworks = service.detectFrameworks(['package.json', 'next.config.js']);
      expect(frameworks.map((f) => f.framework)).toContain('Next.js');
    });

    it('returns an empty array when no signal files are present', () => {
      expect(service.detectFrameworks(['README.md', 'LICENSE'])).toEqual([]);
    });
  });
});
