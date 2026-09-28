export const EXTENSION_MAP: Record<string, string> = {
  py: 'PYTHON', java: 'JAVA', js: 'JAVASCRIPT', jsx: 'JAVASCRIPT', ts: 'TYPESCRIPT', tsx: 'TYPESCRIPT',
  c: 'C', h: 'C', cpp: 'CPP', cc: 'CPP', hpp: 'CPP', go: 'GO', rs: 'RUST', php: 'PHP',
  kt: 'KOTLIN', swift: 'SWIFT', html: 'HTML', css: 'CSS', sql: 'SQL', json: 'JSON',
  yml: 'YAML', yaml: 'YAML', md: 'MARKDOWN',
};

export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return (ext && EXTENSION_MAP[ext]) || 'UNKNOWN';
}
