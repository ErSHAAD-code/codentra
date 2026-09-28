const EXT_TO_MONACO_LANG: Record<string, string> = {
  // Web & JS/TS
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  svg: 'xml',

  // Core Languages
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  cc: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  kt: 'kotlin',
  swift: 'swift',
  sql: 'sql',

  // Config & Markup
  md: 'markdown',
  markdown: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  xml: 'xml',
  sh: 'shell',
  bash: 'shell',
  dockerfile: 'dockerfile',
  graphql: 'graphql',
  env: 'ini',
};

export function getMonacoLanguage(filePath: string): string {
  if (!filePath) return 'plaintext';

  const fileName = filePath.split('/').pop()?.toLowerCase() || '';

  if (fileName === 'dockerfile') return 'dockerfile';
  if (fileName.startsWith('.env')) return 'ini';
  if (fileName === 'package.json' || fileName === 'tsconfig.json') return 'json';

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return EXT_TO_MONACO_LANG[ext] || 'plaintext';
}
