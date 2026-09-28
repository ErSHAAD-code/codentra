'use client';

import { FileEdit, GitCommit, GitPullRequest, ArrowRight, Eye, Check } from 'lucide-react';
import React from 'react';

import { EditorTab } from './types';

interface ChangesPanelProps {
  dirtyTabs: EditorTab[];
  onSelectTab: (tabId: string) => void;
  onSubmitContribution: () => void;
  hasWriteAccess?: boolean;
}

export function ChangesPanel({ dirtyTabs, onSelectTab, onSubmitContribution, hasWriteAccess }: ChangesPanelProps) {
  return (
    <div className="flex w-full flex-col border-t border-border/60 bg-[#141416] p-3 text-xs font-mono text-slate-300 select-none">
      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <FileEdit className="h-4 w-4 text-primary" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Unsaved Changes ({dirtyTabs.length})
          </span>
        </div>

        <button
          type="button"
          disabled={dirtyTabs.length === 0}
          onClick={onSubmitContribution}
          className="flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 text-xs font-bold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-40"
        >
          <GitPullRequest className="h-3.5 w-3.5" />
          <span>Submit Contribution</span>
        </button>
      </div>

      {dirtyTabs.length > 0 ? (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {dirtyTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex items-center justify-between rounded-md bg-card/40 px-3 py-1.5 transition-colors hover:bg-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="font-semibold text-slate-200">{tab.name}</span>
                <span className="text-[11px] text-slate-500 truncate">({tab.path})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  MODIFIED
                </span>
                <Eye className="h-3.5 w-3.5 text-slate-400 hover:text-primary" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-slate-500">
          No files have been modified yet. Edit code in Monaco to track changes.
        </div>
      )}
    </div>
  );
}
