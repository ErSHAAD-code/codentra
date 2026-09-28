'use client';

import { Check, CheckCircle2, ListChecks, Play, X } from 'lucide-react';
import React, { useState } from 'react';

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  targetFiles?: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface AgentPlanData {
  task: string;
  summary: string;
  architectureOverview?: string;
  steps: PlanStep[];
  /** Phase 2 — tools the agent actually called */
  toolsUsed?: string[];
  /** Phase 2 — files the agent read/inspected */
  filesInspected?: string[];
}

interface AgentPlanProps {
  plan: AgentPlanData;
  onApprove: () => void;
  onCancel: () => void;
}

export function AgentPlan({ plan, onApprove, onCancel }: AgentPlanProps) {
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    onApprove();
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-[#16161a] p-3.5 shadow-lg text-xs font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
        <ListChecks className="h-4 w-4 text-primary shrink-0" />
        <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
          Implementation Plan
        </span>
      </div>

      {/* Task Summary */}
      <div className="rounded-lg bg-[#111113] p-2.5 border border-border/30">
        <p className="font-semibold text-slate-200 text-xs mb-1">Task: "{plan.task}"</p>
        <p className="text-slate-400 text-[11px] leading-relaxed">{plan.summary}</p>
        {plan.architectureOverview && (
          <p className="mt-2 text-[10px] text-slate-500 italic border-t border-border/20 pt-1.5">
            Architecture Impact: {plan.architectureOverview}
          </p>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-2 mt-1">
        <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
          Execution Steps ({plan.steps.length})
        </span>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {plan.steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="rounded-lg border border-border/40 bg-[#1a1a1e] p-2.5 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-200 text-xs">{step.title}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                {step.description}
              </p>
              {step.targetFiles && step.targetFiles.length > 0 && (
                <div className="pl-6 pt-1 flex flex-wrap gap-1">
                  {step.targetFiles.map((file) => (
                    <span
                      key={file}
                      className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-end gap-2">
        {approved ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs py-1">
            <Check className="h-4 w-4" />
            <span>Plan Approved</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 font-bold text-white shadow-glow-sm hover:shadow-glow transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Approve Plan</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
