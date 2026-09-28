'use client';

import { CheckCheck, XCircle, FileCode2, Layers } from 'lucide-react';
import React, { useState } from 'react';

import { AgentChangeList } from './AgentChangeList';
import { AgentDiffViewer } from './AgentDiffViewer';
import { AgentFileChange } from './types';

interface AgentChangesPanelProps {
  changes: AgentFileChange[];
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onApplyToWorkspace: () => void;
}

export function AgentChangesPanel({
  changes,
  onAcceptChange,
  onRejectChange,
  onAcceptAll,
  onRejectAll,
  onApplyToWorkspace,
}: AgentChangesPanelProps) {
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(
    changes[0]?.id ?? null,
  );

  const selectedChange =
    changes.find((c) => c.id === selectedChangeId) || changes[0] || null;

  const acceptedCount = changes.filter((c) => c.decision === 'accepted').length;
  const pendingCount = changes.filter((c) => c.decision === null).length;

  if (changes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-[#121214] p-3 shadow-2xl">
      {/* Panel Title & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Proposed Workspace Changes ({changes.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRejectAll}
            className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject All
          </button>

          <button
            type="button"
            onClick={onAcceptAll}
            className="flex items-center gap-1 rounded-md gradient-brand px-3 py-1 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Accept All
          </button>
        </div>
      </div>

      {/* Changeset List */}
      <AgentChangeList
        changes={changes}
        selectedPath={selectedChange?.path ?? null}
        onSelectChange={(c) => setSelectedChangeId(c.id)}
      />

      {/* Diff Viewer for Selected File */}
      {selectedChange && (
        <div className="h-64">
          <AgentDiffViewer
            change={selectedChange}
            onAccept={onAcceptChange}
            onReject={onRejectChange}
          />
        </div>
      )}

      {/* Bottom Workspace Apply Button */}
      {acceptedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 mt-1">
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <FileCode2 className="h-4 w-4 text-emerald-400" />
            <span>
              {acceptedCount} of {changes.length} change(s) accepted. Ready to load into editor.
            </span>
          </div>

          <button
            type="button"
            onClick={onApplyToWorkspace}
            className="rounded-md gradient-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-glow transition-all hover:scale-105"
          >
            Apply Accepted Changes to Workspace
          </button>
        </div>
      )}
    </div>
  );
}
