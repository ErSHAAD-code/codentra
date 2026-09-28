import { slugify } from '../slugify';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('My Cool Project')).toBe('my-cool-project');
  });

  it('strips special characters', () => {
    expect(slugify('Codentra! v2.0 (beta)')).toBe('codentra-v2-0-beta');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('too   many    spaces')).toBe('too-many-spaces');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --leading and trailing--  ')).toBe('leading-and-trailing');
  });

  it('handles an already-clean slug unchanged', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
  });

  it('handles empty string without throwing', () => {
    expect(slugify('')).toBe('');
  });
});
