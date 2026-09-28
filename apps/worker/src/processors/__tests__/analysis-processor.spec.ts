import { parseFindings } from '../analysis-processor';

describe('parseFindings', () => {
  it('parses a well-formed findings response', () => {
    const raw = JSON.stringify({
      findings: [{ category: 'BUG', severity: 'HIGH', lineStart: 10, lineEnd: 12, title: 'Null check missing', description: 'x', suggestedFix: 'y' }],
    });
    expect(parseFindings(raw)).toHaveLength(1);
    expect(parseFindings(raw)[0]?.title).toBe('Null check missing');
  });

  it('handles a response wrapped in markdown code fences', () => {
    const raw = '```json\n{"findings": [{"category": "SECURITY", "severity": "CRITICAL", "lineStart": null, "lineEnd": null, "title": "SQLi", "description": "x", "suggestedFix": "y"}]}\n```';
    expect(parseFindings(raw)).toHaveLength(1);
  });

  it('returns an empty array for an explicit empty findings response', () => {
    expect(parseFindings('{"findings": []}')).toEqual([]);
  });

  it('degrades to an empty array on malformed JSON rather than throwing', () => {
    expect(() => parseFindings('not valid json at all')).not.toThrow();
    expect(parseFindings('not valid json at all')).toEqual([]);
  });

  it('degrades to an empty array when findings is missing entirely', () => {
    expect(parseFindings('{"other": "shape"}')).toEqual([]);
  });

  it('degrades to an empty array when findings is not an array', () => {
    expect(parseFindings('{"findings": "oops"}')).toEqual([]);
  });
});
