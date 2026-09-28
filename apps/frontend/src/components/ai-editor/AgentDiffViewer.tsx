'use client';

import { Check, X, Code2, AlertTriangle, FilePlus, FileText, Trash2 } from 'lucide-react';
import React from 'react';

import { AgentFileChange } from './types';

interface AgentDiffViewerProps {
  change: AgentFileChange;
  onAccept: (changeId: string) => void;
  onReject: (changeId: string) => void;
}

export function AgentDiffViewer({ change, onAccept, onReject }: AgentDiffViewerProps) {
  const isDelete = change.operation === 'DELETE';
  const isCreate = change.operation === 'CREATE';
  const isModify = change.operation === 'MODIFY';

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border/60 bg-[#141416] text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isModify && <FileText className="h-4 w-4 text-amber-400" />}
          {isCreate && <FilePlus className="h-4 w-4 text-emerald-400" />}
          {isDelete && <Trash2 className="h-4 w-4 text-red-400" />}
          <span className="font-bold text-slate-200">{change.path}</span>
          <span className="text-[10px] text-slate-500 italic">({change.reason})</span>
        </div>

        <div className="flex items-center gap-2">
          {change.decision === 'accepted' && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Accepted
            </span>
          )}
          {change.decision === 'rejected' && (
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
              Rejected
            </span>
          )}
          {change.decision === null && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onReject(change.id)}
                className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>

              <button
                type="button"
                onClick={() => onAccept(change.id)}
                className="flex items-center gap-1 rounded-md gradient-brand px-3 py-1 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Warning Notice */}
      {isDelete && (
        <div className="flex items-center gap-2 bg-red-500/10 border-b border-red-500/20 p-3 text-red-300 text-xs">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>
            <strong>Warning:</strong> This operation proposes to DELETE this file from your editor workspace.
          </span>
        </div>
      )}

      {/* Code Comparison side-by-side or full view */}
      <div className="grid flex-1 divide-y divide-border/40 md:grid-cols-2 md:divide-x md:divide-y-0 overflow-y-auto min-h-0">
        {/* ORIGINAL CONTENT */}
        {!isCreate && (
          <div className="p-3 bg-red-950/20 overflow-x-auto">
            <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
              <span>Original File</span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-red-200/80 font-mono">
              {change.originalContent || '// Empty'}
            </pre>
          </div>
        )}

        {/* PROPOSED CONTENT */}
        {!isDelete && (
          <div className={`p-3 bg-emerald-950/20 overflow-x-auto ${isCreate ? 'col-span-2' : ''}`}>
            <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span>Proposed Changes</span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-200 font-mono">
              {change.proposedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
