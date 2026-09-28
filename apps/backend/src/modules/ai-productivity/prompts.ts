export const PROMPTS = {
  readme: (repoSummary: string, techStack: string) => ({
    system: 'You write professional, GitHub-ready README.md files. Output only markdown, no commentary.',
    user: `Generate a complete README.md for this repository.\n\nSummary: ${repoSummary}\nTech stack: ${techStack}\n\nInclude: project summary, features, tech stack, installation, running locally, folder structure, and license section.`,
  }),

  testGenerator: (filePath: string, content: string, framework: string) => ({
    system: `You write ${framework} unit tests. Output only code, no commentary or markdown fences.`,
    user: `Write unit tests for this file, covering normal cases, edge cases, and failure cases.\n\nFile: ${filePath}\n\n${content}`,
  }),

  codeExplainer: (filePath: string, content: string) => ({
    system: 'You explain code clearly and concisely for a developer unfamiliar with it.',
    user: `Explain this file's purpose, control flow, and any notable complexity or dependencies.\n\nFile: ${filePath}\n\n${content}`,
  }),

  architectureExplainer: (summary: string, folderStructure: string) => ({
    system: 'You explain software architecture clearly, for a developer new to the codebase.',
    user: `Explain this repository's architecture: system overview, module relationships, and folder organization.\n\nSummary: ${summary}\nFolders: ${folderStructure}`,
  }),

  sqlExplainer: (query: string) => ({
    system: 'You explain SQL queries: what they do, execution flow, and optimization opportunities (indexes, joins).',
    user: `Explain this query:\n\n${query}`,
  }),

  algorithmExplainer: (code: string) => ({
    system: 'You explain algorithms: time/space complexity, and suggest alternatives where relevant.',
    user: `Explain this algorithm's time and space complexity, and suggest any more efficient alternative.\n\n${code}`,
  }),

  debuggingAssistant: (code: string, errorContext?: string) => ({
    system: 'You find bugs, explain their root cause, and provide a corrected version of the code.',
    user: `Find the bug in this code${errorContext ? ` (context: ${errorContext})` : ''}. Explain the root cause and provide the fix.\n\n${code}`,
  }),

  refactoringEngine: (filePath: string, content: string) => ({
    system: 'You suggest concrete refactoring improvements: naming, simplification, design patterns, reusability.',
    user: `Suggest refactoring improvements for this file. Be specific, with before/after code where helpful.\n\nFile: ${filePath}\n\n${content}`,
  }),

  commitMessageGenerator: (diff: string) => ({
    system: 'You write Conventional Commits messages (e.g. feat(auth): ..., fix(api): ...). Output only the commit message.',
    user: `Write a commit message for this diff:\n\n${diff}`,
  }),

  diagramGenerator: (summary: string, architecture: string) => ({
    system: 'You generate Mermaid diagrams. Output only a mermaid code block, no other text.',
    user: `Generate a Mermaid architecture diagram (flowchart) for this repository.\n\nSummary: ${summary}\nArchitecture: ${architecture}`,
  }),
};
