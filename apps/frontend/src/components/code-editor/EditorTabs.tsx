'use client';

import { X, FileCode, FileText, FileJson, File } from 'lucide-react';
import React from 'react';

import { EditorTab } from './types';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function EditorTabs({ tabs, activeTabId, onSelectTab, onCloseTab }: EditorTabsProps) {
  if (tabs.length === 0) return null;

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.json')) return <FileJson className="h-3.5 w-3.5 text-warning shrink-0" />;
    if (filename.match(/\.(ts|tsx|js|jsx|py|rs|go|java|cpp|c|php)$/i))
      return <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />;
    if (filename.match(/\.(md|txt)$/i)) return <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    return <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  };

  return (
    <div className="flex h-10 w-full items-center overflow-x-auto border-b border-border/60 bg-[#18181b] px-2 text-xs select-none">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex h-8 items-center gap-2 rounded-t-lg border-t-2 px-3 py-1 font-mono transition-colors cursor-pointer ${
                isActive
                  ? 'border-primary bg-[#1e1e1e] text-slate-100 font-semibold'
                  : 'border-transparent bg-[#18181b] text-slate-400 hover:bg-[#27272a] hover:text-slate-200'
              }`}
            >
              {getFileIcon(tab.name)}
              <span className="truncate max-w-[140px]">{tab.name}</span>

              {/* Unsaved indicator dot or close button */}
              <div className="flex items-center ml-1">
                {tab.isDirty && (
                  <span
                    className="h-2 w-2 rounded-full bg-warning transition-transform group-hover:scale-0"
                    title="Unsaved changes"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white ${
                    tab.isDirty ? 'group-hover:inline-flex hidden' : 'inline-flex'
                  }`}
                  title="Close tab"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
