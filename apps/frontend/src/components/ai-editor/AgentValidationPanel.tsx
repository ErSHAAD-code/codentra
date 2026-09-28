'use client';

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';

export interface ValidationLogEntry {
  line: string;
  type: 'stdout' | 'stderr' | 'info';
  timestamp: string;
}

export interface ValidationResultData {
  command: 'typecheck' | 'lint' | 'test' | 'build';
  success: boolean;
  exitCode: number;
  durationMs: number;
  summary: string;
  errorCount: number;
  warningCount: number;
  logs: ValidationLogEntry[];
  parsedErrors: Array<{
    file?: string;
    line?: number;
    column?: number;
    message: string;
    code?: string;
    severity: 'error' | 'warning';
  }>;
}

interface AgentValidationPanelProps {
  result: ValidationResultData;
  attemptNumber?: number;
  maxAttempts?: number;
  onFixWithAi?: (errors: any[]) => void;
}

export function AgentValidationPanel({
  result,
  attemptNumber = 1,
  maxAttempts = 3,
  onFixWithAi,
}: AgentValidationPanelProps) {
  const [showLogs, setShowLogs] = useState(false);

  const isSuccess = result.success;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-[#121214] p-3 text-xs font-mono shadow-xl">
      {/* Header Result Bar */}
      <div
        className={`flex items-center justify-between rounded-lg border p-2.5 ${
          isSuccess
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
            : 'border-red-500/40 bg-red-500/10 text-red-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-slate-200">
                Validation {result.command} — {isSuccess ? 'Passed' : 'Failed'}
              </span>
              <span className="rounded bg-slate-900/60 px-1.5 py-0.5 text-[9px] text-slate-400 font-normal">
                {result.durationMs}ms
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-sans mt-0.5">{result.summary}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            Attempt {attemptNumber}/{maxAttempts}
          </span>
          {showLogs ? (
            <button
              type="button"
              onClick={() => setShowLogs(false)}
              className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
            >
              <ChevronDown className="h-3 w-3" />
              Hide Logs
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogs(true)}
              className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
              Logs ({result.logs.length})
            </button>
          )}
        </div>
      </div>

      {/* Parsed Errors List */}
      {!isSuccess && result.parsedErrors.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 p-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-red-400 border-b border-red-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Detected Errors ({result.errorCount})
            </span>
            {onFixWithAi && (
              <button
                type="button"
                onClick={() => onFixWithAi(result.parsedErrors)}
                className="rounded gradient-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-glow-sm hover:scale-105 transition-all"
              >
                Propose Fix with AI
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto">
            {result.parsedErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-red-200">
                <span className="font-bold text-red-400 shrink-0">[{err.code ?? 'ERROR'}]</span>
                <span className="truncate">
                  {err.file ? `${err.file}:${err.line ?? 0}` : ''} — {err.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs Drawer */}
      {showLogs && (
        <div className="rounded-lg border border-border/40 bg-[#0d0d0f] p-3 space-y-1 max-h-48 overflow-y-auto font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold border-b border-border/40 pb-1 mb-1">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>Sanitized Execution Terminal Logs</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
          </div>

          {result.logs.map((log, i) => (
            <div
              key={i}
              className={`leading-relaxed ${
                log.type === 'stderr'
                  ? 'text-red-400'
                  : log.type === 'info'
                  ? 'text-sky-400'
                  : 'text-slate-300'
              }`}
            >
              {log.line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
