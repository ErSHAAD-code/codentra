'use client';

import { Check, X, ArrowRight, Code2 } from 'lucide-react';
import React from 'react';

interface DiffPreviewProps {
  originalCode: string;
  suggestedCode: string;
  onAccept: () => void;
  onReject: () => void;
  status?: 'pending' | 'applied' | 'rejected';
}

export function DiffPreview({ originalCode, suggestedCode, onAccept, onReject, status = 'pending' }: DiffPreviewProps) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-[#141416] text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
            Proposed Code Changes
          </span>
        </div>

        {status === 'applied' && (
          <span className="rounded bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
            Applied to Editor
          </span>
        )}
        {status === 'rejected' && (
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            Rejected
          </span>
        )}
      </div>

      {/* Code Comparison */}
      <div className="grid divide-y divide-border/40 md:grid-cols-2 md:divide-x md:divide-y-0 max-h-60 overflow-y-auto">
        {/* CURRENT CODE */}
        <div className="p-3 bg-red-950/20">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase text-red-400">
            <span>Current Code</span>
          </div>
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-red-200/80 font-mono">
            {originalCode || '// Empty or whole file'}
          </pre>
        </div>

        {/* PROPOSED CODE */}
        <div className="p-3 bg-emerald-950/20">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400">
            <span>Proposed Code</span>
          </div>
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-200 font-mono">
            {suggestedCode}
          </pre>
        </div>
      </div>

      {/* Action Footer */}
      {status === 'pending' && (
        <div className="flex items-center justify-end gap-2 border-t border-border/40 bg-[#1a1a1e] p-2">
          <button
            type="button"
            onClick={onReject}
            className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reject</span>
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="flex items-center gap-1 rounded-lg gradient-brand px-3.5 py-1 text-xs font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Accept Changes</span>
          </button>
        </div>
      )}
    </div>
  );
}
