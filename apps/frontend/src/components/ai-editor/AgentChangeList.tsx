'use client';

import { FilePlus, FileText, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import React from 'react';

import { AgentFileChange } from './types';

interface AgentChangeListProps {
  changes: AgentFileChange[];
  selectedPath: string | null;
  onSelectChange: (change: AgentFileChange) => void;
}

export function AgentChangeList({ changes, selectedPath, onSelectChange }: AgentChangeListProps) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-60 p-1">
      {changes.map((change) => {
        const isSelected = selectedPath === change.path;
        const isModify = change.operation === 'MODIFY';
        const isCreate = change.operation === 'CREATE';
        const isDelete = change.operation === 'DELETE';

        return (
          <button
            key={change.id}
            type="button"
            onClick={() => onSelectChange(change)}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-mono transition-all text-left ${
              isSelected
                ? 'border-primary/60 bg-primary/10 text-white shadow-glow-sm'
                : 'border-border/40 bg-[#16161a] text-slate-300 hover:border-border/80 hover:bg-[#1a1a20]'
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              {isModify && (
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px]">M</span>
                </span>
              )}
              {isCreate && (
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <FilePlus className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px]">+</span>
                </span>
              )}
              {isDelete && (
                <span className="flex items-center gap-1 font-bold text-red-400">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px]">D</span>
                </span>
              )}

              <span className="truncate">{change.path}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {change.decision === 'accepted' && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {change.decision === 'rejected' && (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              {change.decision === null && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">
                  Pending
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
