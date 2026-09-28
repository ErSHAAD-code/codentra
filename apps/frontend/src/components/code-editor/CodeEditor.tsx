'use client';

import Editor, { OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

import { ProblemMarker } from './ProblemsPanel';
import { CursorPosition } from './types';

export interface CodeEditorHandle {
  revealLine: (lineNumber: number, column?: number) => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  onCursorChange?: (pos: CursorPosition) => void;
  onSelectionChange?: (selectedText: string) => void;
  onMarkersChange?: (markers: ProblemMarker[]) => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    value,
    onChange,
    language,
    theme = 'vs-dark',
    readOnly = false,
    onCursorChange,
    onSelectionChange,
    onMarkersChange,
  },
  ref,
) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    revealLine: (lineNumber: number, column = 1) => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.setPosition({ lineNumber, column });
        editorRef.current.focus();
      }
    },
  }));

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Track text selection
    editor.onDidChangeCursorSelection(() => {
      if (onSelectionChange && editorRef.current) {
        const selection = editorRef.current.getSelection();
        const selectedText = editorRef.current.getModel()?.getValueInRange(selection) || '';
        onSelectionChange(selectedText);
      }
    });

    // Track diagnostic markers
    monaco.editor.onDidChangeMarkers(() => {
      if (onMarkersChange && editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const rawMarkers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
          const mapped: ProblemMarker[] = rawMarkers.map((m: any, idx: number) => ({
            id: `marker-${idx}-${m.startLineNumber}`,
            severity: m.severity === 8 ? 'error' : m.severity === 4 ? 'warning' : 'info',
            message: m.message,
            startLineNumber: m.startLineNumber,
            startColumn: m.startColumn,
            endLineNumber: m.endLineNumber,
            endColumn: m.endColumn,
            source: m.owner || 'monaco',
          }));
          onMarkersChange(mapped);
        }
      }
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorMount}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e] text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-xs font-mono">Initializing Monaco Editor...</span>
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
});
