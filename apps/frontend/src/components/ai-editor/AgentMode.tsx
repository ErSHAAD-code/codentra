'use client';

import { Bot, Sparkles, RefreshCw, StopCircle, FlaskConical, GitPullRequest } from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react';

import { apiJson } from '@/lib/api';

import { AgentActivityFeed, AgentActivityEvent } from './AgentActivity';
import { AgentChangesPanel } from './AgentChangesPanel';
import { AgentCompletionSummary } from './AgentCompletionSummary';
import { AgentPlan, AgentPlanData } from './AgentPlan';
import { AgentValidationPanel, ValidationResultData } from './AgentValidationPanel';
import { AgentFileChange } from './types';

const AGENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface AgentModeProps {
  filePath?: string;
  fileContent?: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  selectedCode?: string;
  onApplyChangesToWorkspace?: (changes: AgentFileChange[]) => void;
  onOpenContributionModal?: () => void;
}

const SUGGESTED_AGENT_TASKS = [
  'Improve this entire ML project and make the code production ready',
  'Add authentication and user session management',
  'Find and fix all TypeScript & linting errors',
  'Optimize codebase performance and memory usage',
];

export function AgentMode({
  filePath,
  fileContent,
  repoOwner,
  repoName,
  branch,
  selectedCode,
  onApplyChangesToWorkspace,
  onOpenContributionModal,
}: AgentModeProps) {
  const [taskPrompt, setTaskPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [events, setEvents] = useState<AgentActivityEvent[]>([]);
  const [planData, setPlanData] = useState<AgentPlanData | null>(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [changes, setChanges] = useState<AgentFileChange[]>([]);
  const [changesetId, setChangesetId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResultData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const appendEvent = useCallback((evt: AgentActivityEvent) => {
    setEvents((prev) => [...prev, evt]);
  }, []);

  const handleRun = async (customPrompt?: string) => {
    const task = customPrompt ?? taskPrompt;
    if (!task.trim() || isRunning) return;

    setError(null);
    setPlanData(null);
    setPlanApproved(false);
    setChanges([]);
    setChangesetId(null);
    setValidationResult(null);
    setEvents([]);
    setIsCancelled(false);
    setRunId(null);
    setIsRunning(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(`${AGENT_API_URL}/ai/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: abort.signal,
        body: JSON.stringify({
          task,
          repoOwner,
          repoName,
          branch,
          filePath,
          fileContent: fileContent?.slice(0, 4000),
          selectedCode,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);
          if (!payload) continue;

          try {
            const evt = JSON.parse(payload) as AgentActivityEvent;
            appendEvent(evt);

            if (evt.type === 'run_started' && evt.runId) {
              setRunId(evt.runId);
            }

            if (evt.type === 'change_proposed' && evt.change) {
              setChanges((prev) => {
                const idx = prev.findIndex((c) => c.path === evt.change!.path);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = evt.change!;
                  return updated;
                }
                return [...prev, evt.change!];
              });
              if (evt.changesetId) setChangesetId(evt.changesetId);
            }

            if (evt.type === 'validation_completed' && evt.validationResult) {
              setValidationResult(evt.validationResult);
            }

            if (evt.type === 'plan_ready' && (evt as any).plan) {
              setPlanData((evt as any).plan as AgentPlanData);
              if ((evt as any).plan.changesetId) {
                setChangesetId((evt as any).plan.changesetId);
              }
            }

            if (evt.type === 'plan_ready' || evt.type === 'error' || evt.type === 'cancelled') {
              if (evt.type === 'error') setError(evt.message ?? 'Agent error');
              if (evt.type === 'cancelled') setIsCancelled(true);
              break;
            }
          } catch {
            // Ignore partial SSE parse errors
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err?.message ?? 'Failed to connect to agent');
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const handleManualValidation = async (command: 'typecheck' | 'lint' | 'test' | 'build') => {
    setIsValidating(true);
    try {
      const res = await apiJson<ValidationResultData>('/ai/agent/validate', {
        method: 'POST',
        body: JSON.stringify({
          command,
          files: changes.map((c) => c.path),
        }),
      });
      setValidationResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = async () => {
    abortRef.current?.abort();
    setIsCancelled(true);

    if (runId) {
      try {
        await fetch(`${AGENT_API_URL}/ai/agent/run/${runId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {
        // Best-effort
      }
    }

    appendEvent({ type: 'cancelled', message: 'Cancelled by user.' });
    setIsRunning(false);
  };

  const handleAcceptChange = async (changeId: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === changeId ? { ...c, decision: 'accepted' } : c)),
    );
    if (changesetId) {
      try {
        await apiJson(`/ai/agent/changeset/${changesetId}/decision`, {
          method: 'PATCH',
          body: JSON.stringify({ changeId, decision: 'accepted' }),
        });
      } catch {
        // Best-effort
      }
    }
  };

  const handleRejectChange = async (changeId: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === changeId ? { ...c, decision: 'rejected' } : c)),
    );
    if (changesetId) {
      try {
        await apiJson(`/ai/agent/changeset/${changesetId}/decision`, {
          method: 'PATCH',
          body: JSON.stringify({ changeId, decision: 'rejected' }),
        });
      } catch {
        // Best-effort
      }
    }
  };

  const handleAcceptAll = async () => {
    setChanges((prev) => prev.map((c) => ({ ...c, decision: 'accepted' })));
    if (changesetId) {
      try {
        await apiJson(`/ai/agent/changeset/${changesetId}/accept-all`, {
          method: 'POST',
        });
      } catch {
        // Best-effort
      }
    }
  };

  const handleRejectAll = async () => {
    setChanges((prev) => prev.map((c) => ({ ...c, decision: 'rejected' })));
    if (changesetId) {
      try {
        await apiJson(`/ai/agent/changeset/${changesetId}/reject-all`, {
          method: 'POST',
        });
      } catch {
        // Best-effort
      }
    }
  };

  const handleApplyToWorkspace = () => {
    const accepted = changes.filter((c) => c.decision === 'accepted');
    if (onApplyChangesToWorkspace && accepted.length > 0) {
      onApplyChangesToWorkspace(accepted);
    }
  };

  const handleNewTask = () => {
    setPlanData(null);
    setPlanApproved(false);
    setChanges([]);
    setChangesetId(null);
    setValidationResult(null);
    setEvents([]);
    setError(null);
    setIsCancelled(false);
    setTaskPrompt('');
  };

  const modifiedCount = changes.filter((c) => c.operation === 'MODIFY').length;
  const createdCount = changes.filter((c) => c.operation === 'CREATE').length;
  const analyzedCount = planData?.filesInspected?.length || events.length || 4;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-3 gap-3">
      {/* Banner */}
      <div className="rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 to-purple-500/10 p-3">
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <Bot className="h-4 w-4" />
          <span>Codentra Autonomous Agent</span>
          {repoOwner && repoName && (
            <span className="ml-auto font-mono text-[10px] text-slate-400 font-normal truncate max-w-[100px]">
              {repoOwner}/{repoName}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
          Autonomous multi-step coding pipeline: inspect codebase, propose plans, prepare multi-file changesets, validate, and fix errors automatically.
        </p>
      </div>

      {/* Suggested Tasks */}
      {!planData && !isRunning && events.length === 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Agent Tasks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_AGENT_TASKS.map((task) => (
              <button
                key={task}
                type="button"
                onClick={() => {
                  setTaskPrompt(task);
                  handleRun(task);
                }}
                className="rounded-lg border border-border/50 bg-[#1c1c20] px-2.5 py-1 text-[11px] text-slate-300 hover:border-primary/50 hover:bg-primary/10 hover:text-white transition-all text-left"
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task Input */}
      {!isRunning && !planData && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-[#16161a] p-3">
          <label className="text-[11px] font-semibold text-slate-300">Ask Agent to modify project...</label>
          <textarea
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="e.g., Improve this entire ML project and make the code production ready..."
            disabled={isRunning}
            rows={2}
            className="w-full resize-none rounded-lg border border-border/60 bg-[#101012] px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => handleRun()}
            disabled={isRunning || !taskPrompt.trim()}
            className="flex items-center justify-center gap-1.5 rounded-lg gradient-brand py-2 text-xs font-bold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Run Agent Pipeline</span>
          </button>
        </div>
      )}

      {/* Manual Validation Bar */}
      {!isRunning && (
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-[#141418] p-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-sky-400" />
            Validation Tools:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isValidating}
              onClick={() => handleManualValidation('typecheck')}
              className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Typecheck
            </button>
            <button
              type="button"
              disabled={isValidating}
              onClick={() => handleManualValidation('lint')}
              className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Lint
            </button>
            <button
              type="button"
              disabled={isValidating}
              onClick={() => handleManualValidation('test')}
              className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Test
            </button>
          </div>
        </div>
      )}

      {/* Running indicator */}
      {isRunning && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 min-w-0">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
            <span className="truncate font-semibold">Agent Working... Task: "{taskPrompt}"</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="ml-2 flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
          >
            <StopCircle className="h-3.5 w-3.5" />
            Stop Agent
          </button>
        </div>
      )}

      {/* Live Agent Activity Feed */}
      {(isRunning || events.length > 0) && (
        <AgentActivityFeed
          events={events}
          isRunning={isRunning}
          isCancelled={isCancelled}
          onCancel={handleCancel}
        />
      )}

      {/* Step 3: Structured Plan Approval */}
      {planData && (
        <AgentPlan
          plan={planData}
          onApprove={() => setPlanApproved(true)}
          onCancel={handleNewTask}
        />
      )}

      {/* Step 5: Proposed Multi-File Changes Panel */}
      {changes.length > 0 && (
        <AgentChangesPanel
          changes={changes}
          onAcceptChange={handleAcceptChange}
          onRejectChange={handleRejectChange}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onApplyToWorkspace={handleApplyToWorkspace}
        />
      )}

      {/* Step 6 & 7: Validation Results */}
      {validationResult && (
        <AgentValidationPanel
          result={validationResult}
          onFixWithAi={(errors) => {
            const fixTask = `Fix validation errors in codebase: ${errors.map((e) => e.message).join('; ')}`;
            setTaskPrompt(fixTask);
            handleRun(fixTask);
          }}
        />
      )}

      {/* Step 8: Final Completion Summary */}
      {!isRunning && planData && (changes.length > 0 || validationResult) && (
        <AgentCompletionSummary
          filesAnalyzedCount={analyzedCount}
          filesModifiedCount={modifiedCount}
          filesCreatedCount={createdCount}
          validationPassed={validationResult ? validationResult.success : true}
          onOpenContributionModal={onOpenContributionModal}
        />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          ⚠️ {error}
        </div>
      )}

      {planData && (
        <button
          type="button"
          onClick={handleNewTask}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-2 text-center py-1"
        >
          ← Start another agent task
        </button>
      )}
    </div>
  );
}
