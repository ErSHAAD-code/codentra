'use client';

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCode,
  Loader2,
  Search,
  FolderTree,
  Package,
  Code2,
  AlertTriangle,
  XCircle,
  FileText,
  FilePlus,
  Trash2,
  Check,
  FlaskConical,
} from 'lucide-react';
import React, { useState } from 'react';

import { AgentFileChange } from './types';
import { ValidationResultData } from './AgentValidationPanel';

export type ActivityEventType =
  | 'tool_call'
  | 'tool_result'
  | 'thinking'
  | 'plan_ready'
  | 'error'
  | 'cancelled'
  | 'run_started'
  | 'change_proposed'
  | 'changeset_ready'
  | 'validation_started'
  | 'validation_completed';

export type AgentToolName =
  | 'get_repository_tree'
  | 'read_file'
  | 'search_code'
  | 'get_dependencies'
  | 'get_current_file'
  | 'get_selected_code'
  | 'get_problems'
  | 'propose_file_change'
  | 'propose_new_file'
  | 'propose_delete_file'
  | 'run_typecheck'
  | 'run_lint'
  | 'run_tests'
  | 'run_build';

export interface AgentActivityEvent {
  type: ActivityEventType;
  tool?: AgentToolName;
  args?: Record<string, string>;
  result?: string;
  message?: string;
  runId?: string;
  change?: AgentFileChange;
  changesetId?: string;
  totalChanges?: number;
  validationResult?: ValidationResultData;
}

interface AgentActivityFeedProps {
  events: AgentActivityEvent[];
  isCancelled: boolean;
  onCancel: () => void;
  isRunning: boolean;
}

const TOOL_ICONS: Record<AgentToolName, React.ElementType> = {
  get_repository_tree: FolderTree,
  read_file: FileCode,
  search_code: Search,
  get_dependencies: Package,
  get_current_file: Code2,
  get_selected_code: Code2,
  get_problems: AlertTriangle,
  propose_file_change: FileText,
  propose_new_file: FilePlus,
  propose_delete_file: Trash2,
  run_typecheck: FlaskConical,
  run_lint: FlaskConical,
  run_tests: FlaskConical,
  run_build: FlaskConical,
};

const TOOL_LABELS: Record<AgentToolName, string> = {
  get_repository_tree: 'Scanning repository tree',
  read_file: 'Reading file',
  search_code: 'Searching codebase',
  get_dependencies: 'Inspecting dependencies',
  get_current_file: 'Reading current file',
  get_selected_code: 'Reading selected code',
  get_problems: 'Checking diagnostics',
  propose_file_change: 'Proposing changes to file',
  propose_new_file: 'Creating new file',
  propose_delete_file: 'Proposing file deletion',
  run_typecheck: 'Running TypeScript validation...',
  run_lint: 'Running ESLint validation...',
  run_tests: 'Running test validation...',
  run_build: 'Running build validation...',
};

function ToolEventRow({ event }: { event: AgentActivityEvent }) {
  const [expanded, setExpanded] = useState(false);

  if (event.type === 'thinking') {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-[11px] italic pl-1">
        <Loader2 className="h-3 w-3 animate-spin text-primary/50 shrink-0" />
        <span>{event.message ?? 'Reasoning...'}</span>
      </div>
    );
  }

  if (event.type === 'change_proposed' && event.change) {
    const c = event.change;
    return (
      <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
        {c.operation === 'MODIFY' && <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
        {c.operation === 'CREATE' && <FilePlus className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
        {c.operation === 'DELETE' && <Trash2 className="h-3.5 w-3.5 text-red-400 shrink-0" />}
        <span className="font-bold">{c.operation}</span>
        <span className="truncate">{c.path}</span>
      </div>
    );
  }

  if (event.type === 'validation_started' && event.tool) {
    const label = TOOL_LABELS[event.tool] ?? 'Running validation...';
    return (
      <div className="flex items-center gap-2 text-[11px] font-mono text-sky-300 bg-sky-500/10 p-1.5 rounded border border-sky-500/20">
        <FlaskConical className="h-3.5 w-3.5 animate-spin text-sky-400 shrink-0" />
        <span>🧪 {label}</span>
      </div>
    );
  }

  if (event.type === 'validation_completed' && event.validationResult) {
    const v = event.validationResult;
    return (
      <div
        className={`flex items-center justify-between text-[11px] font-mono p-1.5 rounded border ${
          v.success
            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
            : 'text-red-300 bg-red-500/10 border-red-500/20'
        }`}
      >
        <div className="flex items-center gap-2">
          {v.success ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          )}
          <span>
            {v.success
              ? `✓ ${v.command.toUpperCase()} completed successfully`
              : `🐛 ${v.errorCount} error(s) found in ${v.command.toUpperCase()}`}
          </span>
        </div>
      </div>
    );
  }

  if (event.type === 'run_started') return null;

  if (event.type === 'tool_call' && event.tool) {
    const Icon = TOOL_ICONS[event.tool] ?? Code2;
    const label = TOOL_LABELS[event.tool] ?? event.tool;
    const detail = event.args?.['path'] ?? event.args?.['query'] ?? '';
    return (
      <div className="flex items-start gap-2 text-[11px]">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0 mt-0.5" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <Icon className="h-3 w-3 text-primary/70 shrink-0" />
          <span className="text-slate-300">{label}</span>
          {detail && (
            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{detail}</span>
          )}
        </div>
      </div>
    );
  }

  if (event.type === 'tool_result' && event.tool) {
    const Icon = TOOL_ICONS[event.tool] ?? Code2;
    const label = TOOL_LABELS[event.tool] ?? event.tool;
    const resultPreview = event.result ?? '';
    const lines = resultPreview.split('\n').filter(Boolean);
    const hasFiles = lines.length > 1;

    return (
      <div className="flex flex-col gap-0.5 text-[11px]">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 hover:text-white transition-colors text-left"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <Icon className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-300">{label}</span>
          {hasFiles && <span className="text-slate-500">({lines.length})</span>}
          {hasFiles && (
            expanded
              ? <ChevronDown className="h-3 w-3 text-slate-500 ml-auto" />
              : <ChevronRight className="h-3 w-3 text-slate-500 ml-auto" />
          )}
        </button>

        {expanded && lines.length > 0 && (
          <div className="ml-6 mt-1 space-y-0.5 max-h-32 overflow-y-auto pr-1">
            {lines.slice(0, 20).map((line, i) => (
              <div key={i} className="font-mono text-[10px] text-slate-500 truncate">{line}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (event.type === 'error') {
    return (
      <div className="flex items-center gap-2 text-[11px] text-red-400">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{event.message ?? 'Agent error'}</span>
      </div>
    );
  }

  if (event.type === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
        <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span>Agent cancelled</span>
      </div>
    );
  }

  return null;
}

export function AgentActivityFeed({ events, isCancelled, onCancel, isRunning }: AgentActivityFeedProps) {
  const visibleEvents = events.filter((e) => e.type !== 'run_started' && e.type !== 'plan_ready');

  return (
    <div className="rounded-xl border border-primary/30 bg-[#16161a] shadow-md overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {isRunning && !isCancelled
            ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
            : <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          }
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            {isRunning && !isCancelled ? 'Agent Analysis & Validation Active' : 'Analysis Complete'}
          </span>
        </div>

        {isRunning && !isCancelled && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      <div className="space-y-2.5 p-3.5 max-h-64 overflow-y-auto">
        {visibleEvents.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">Starting agent...</div>
        ) : (
          visibleEvents.map((event, i) => <ToolEventRow key={i} event={event} />)
        )}
      </div>
    </div>
  );
}

export interface ActivityStep {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export function AgentActivity({ steps }: { steps: ActivityStep[] }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-[#16161a] p-3.5 shadow-md">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
          Agent Analysis Active
        </span>
      </div>
      <div className="mt-3 space-y-2 font-mono text-xs">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2.5">
            {step.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
            {step.status === 'in_progress' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />}
            {step.status === 'pending' && <div className="h-3.5 w-3.5 rounded-full border border-slate-700 shrink-0" />}
            <span className={step.status === 'completed' ? 'text-slate-300' : step.status === 'in_progress' ? 'font-medium text-primary' : 'text-slate-500'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
