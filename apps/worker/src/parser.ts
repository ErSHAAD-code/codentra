export function parseFile(content: string, language: string) {
  const lineCount = content.split('\n').length;
  let imports: string[] = [];
  let functions: { name: string }[] = [];
  let classes: { name: string }[] = [];

  if (language === 'JAVASCRIPT' || language === 'TYPESCRIPT') {
    imports = [...content.matchAll(/^import .*?from ['"](.+?)['"]/gm)].map((m) => m[1]);
    functions = [
      ...[...content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g)].map((m) => ({ name: m[1] })),
      ...[...content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g)].map((m) => ({ name: m[1] })),
    ];
    classes = [...content.matchAll(/(?:export\s+)?class\s+(\w+)/g)].map((m) => ({ name: m[1] }));
  } else if (language === 'PYTHON') {
    imports = [
      ...[...content.matchAll(/^import (\S+)/gm)].map((m) => m[1]),
      ...[...content.matchAll(/^from (\S+) import/gm)].map((m) => m[1]),
    ];
    functions = [...content.matchAll(/^def (\w+)\(/gm)].map((m) => ({ name: m[1] }));
    classes = [...content.matchAll(/^class (\w+)/gm)].map((m) => ({ name: m[1] }));
  }

  return { imports, functions, classes, lineCount };
}
