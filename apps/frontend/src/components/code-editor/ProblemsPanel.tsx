'use client';

import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Code2,
} from 'lucide-react';
import React, { useState } from 'react';

export interface ProblemMarker {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber?: number;
  endColumn?: number;
  source?: string;
}

interface ProblemsPanelProps {
  problems: ProblemMarker[];
  onNavigateToLine: (line: number, column: number) => void;
  onAnalyzeErrorsWithAi: () => void;
  onRunCodeReview: () => void;
  analyzingErrors?: boolean;
  reviewingCode?: boolean;
  activeFilePath?: string;
}

export function ProblemsPanel({
  problems,
  onNavigateToLine,
  onAnalyzeErrorsWithAi,
  onRunCodeReview,
  analyzingErrors,
  reviewingCode,
  activeFilePath,
}: ProblemsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  const filteredProblems = problems.filter((p) => {
    if (filter === 'error') return p.severity === 'error';
    if (filter === 'warning') return p.severity === 'warning';
    return true;
  });

  return (
    <div className="flex w-full flex-col border-t border-border/60 bg-[#141416] text-xs font-mono text-slate-300 select-none">
      {/* Panel Header */}
      <div className="flex h-9 items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-200 hover:text-white"
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>Problems ({problems.length})</span>
          </button>

          {/* Counts */}
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All: {problems.length}
            </button>
            <button
              type="button"
              onClick={() => setFilter('error')}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                filter === 'error' ? 'bg-red-950/80 text-red-400 font-semibold' : 'text-red-400/70 hover:text-red-400'
              }`}
            >
              <AlertCircle className="h-3 w-3" />
              Errors: {errorCount}
            </button>
            <button
              type="button"
              onClick={() => setFilter('warning')}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                filter === 'warning' ? 'bg-amber-950/80 text-amber-400 font-semibold' : 'text-amber-400/70 hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Warnings: {warningCount}
            </button>
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2">
          {problems.length > 0 && (
            <button
              type="button"
              disabled={analyzingErrors}
              onClick={onAnalyzeErrorsWithAi}
              className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <Sparkles className={`h-3 w-3 ${analyzingErrors ? 'animate-spin' : ''}`} />
              <span>Analyze Errors with AI</span>
            </button>
          )}

          <button
            type="button"
            disabled={reviewingCode || !activeFilePath}
            onClick={onRunCodeReview}
            className="flex items-center gap-1.5 rounded-md gradient-brand px-3 py-1 text-[11px] font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-50"
          >
            <Code2 className={`h-3 w-3 ${reviewingCode ? 'animate-spin' : ''}`} />
            <span>AI Code Review</span>
          </button>
        </div>
      </div>

      {/* Panel List Content */}
      {!collapsed && (
        <div className="max-h-48 overflow-y-auto divide-y divide-border/20 p-1">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onNavigateToLine(prob.startLineNumber, prob.startColumn)}
                className="flex items-center justify-between rounded-md px-3 py-1.5 transition-colors hover:bg-slate-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {prob.severity === 'error' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  ) : prob.severity === 'warning' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  )}

                  <span className="text-slate-200 truncate">{prob.message}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                  {prob.source && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">{prob.source}</span>}
                  <span>
                    Ln {prob.startLineNumber}, Col {prob.startColumn}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              No diagnostic problems detected in this file. Run AI Code Review for comprehensive analysis.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
