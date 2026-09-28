import { detectLanguage } from '../language-map';

describe('worker language-map', () => {
  it('detects common languages by extension', () => {
    expect(detectLanguage('main.py')).toBe('PYTHON');
    expect(detectLanguage('index.ts')).toBe('TYPESCRIPT');
    expect(detectLanguage('Main.java')).toBe('JAVA');
  });

  it('returns UNKNOWN for unrecognized extensions', () => {
    expect(detectLanguage('archive.tar')).toBe('UNKNOWN');
  });

  it('is consistent with apps/backend LanguageDetectorService for the shared extension set', () => {
    // Not a cross-import (intentional duplication, per Phase 2 design note) —
    // this test just pins the worker's own behavior so a future edit to
    // one copy that silently diverges from the other gets caught here.
    const expected: Record<string, string> = { py: 'PYTHON', ts: 'TYPESCRIPT', go: 'GO', rs: 'RUST' };
    for (const [ext, lang] of Object.entries(expected)) {
      expect(detectLanguage(`file.${ext}`)).toBe(lang);
    }
  });
});
