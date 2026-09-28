'use client';

import { CheckCircle2, GitPullRequest, FileCheck, Layers, ArrowRight } from 'lucide-react';
import React from 'react';

interface AgentCompletionSummaryProps {
  filesAnalyzedCount: number;
  filesModifiedCount: number;
  filesCreatedCount: number;
  validationPassed: boolean;
  onOpenContributionModal?: () => void;
}

export function AgentCompletionSummary({
  filesAnalyzedCount,
  filesModifiedCount,
  filesCreatedCount,
  validationPassed,
  onOpenContributionModal,
}: AgentCompletionSummaryProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-[#121814] p-4 text-xs font-sans shadow-2xl backdrop-blur-md">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">TASK COMPLETE</h3>
            <p className="text-[10px] text-emerald-400/80 font-mono">Agent execution finished cleanly</p>
          </div>
        </div>

        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          Ready for GitHub
        </span>
      </div>

      {/* Metrics Checklist */}
      <div className="grid grid-cols-2 gap-2 text-slate-200 font-mono text-[11px]">
        <div className="flex items-center gap-2 rounded-xl bg-[#17221b] p-2 border border-emerald-500/20">
          <Layers className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>✓ {filesAnalyzedCount} files analyzed</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#17221b] p-2 border border-emerald-500/20">
          <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>✓ {filesModifiedCount} files modified</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#17221b] p-2 border border-emerald-500/20">
          <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>✓ {filesCreatedCount} files created</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#17221b] p-2 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{validationPassed ? '✓ Validation passed' : '⚠ Validation warnings'}</span>
        </div>
      </div>

      {/* Action CTA */}
      {onOpenContributionModal && (
        <div className="pt-2 border-t border-emerald-500/20 flex justify-end">
          <button
            type="button"
            onClick={onOpenContributionModal}
            className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow transition-all hover:scale-[1.02]"
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Submit Contribution to GitHub</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
