export interface EditorTab {
  id: string;
  path: string;
  name: string;
  originalContent: string;
  currentContent: string;
  language: string;
  isDirty: boolean;
}

export type EditorTheme = 'vs-dark' | 'light' | 'hc-black';

export interface CursorPosition {
  line: number;
  column: number;
}
