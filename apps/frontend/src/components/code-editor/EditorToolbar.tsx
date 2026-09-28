'use client';

import {
  FolderGit2,
  RotateCcw,
  Save,
  Bot,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import React from 'react';

import { GithubBranch } from '../github-explorer/types';
import { BranchSelector } from './BranchSelector';
import { EditorTab } from './types';

interface EditorToolbarProps {
  owner: string;
  repo: string;
  branches: GithubBranch[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  activeTab: EditorTab | null;
  onRevertActiveTab: () => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  toggleAiPanel: () => void;
  aiPanelOpen: boolean;
  hasAnyUnsavedChanges: boolean;
  onSubmitContribution: () => void;
}

export function EditorToolbar({
  owner,
  repo,
  branches,
  selectedBranch,
  onSelectBranch,
  activeTab,
  onRevertActiveTab,
  toggleSidebar,
  sidebarOpen,
  toggleAiPanel,
  aiPanelOpen,
  hasAnyUnsavedChanges,
  onSubmitContribution,
}: EditorToolbarProps) {
  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-border/60 bg-[#121214] px-4 font-mono text-xs text-slate-300 select-none">
      {/* Left section: Sidebar toggle & Repository / Branch info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-white">
            {owner}/{repo}
          </span>
        </div>

        <span className="text-slate-600">/</span>

        <BranchSelector
          branches={branches}
          selectedBranch={selectedBranch}
          onSelectBranch={onSelectBranch}
          hasUnsavedChanges={hasAnyUnsavedChanges}
        />
      </div>

      {/* Center section: Active file & language badge */}
      {activeTab && (
        <div className="hidden md:flex items-center gap-2 truncate">
          <span className="text-slate-400 truncate max-w-sm">{activeTab.path}</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {activeTab.language}
          </span>
          {activeTab.isDirty && (
            <span className="rounded bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning">
              Unsaved
            </span>
          )}
        </div>
      )}

      {/* Right section: Editor actions & AI Assistant panel toggle */}
      <div className="flex items-center gap-2">
        {activeTab?.isDirty && (
          <button
            type="button"
            onClick={onRevertActiveTab}
            className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Discard changes for this file"
          >
            <RotateCcw className="h-3.5 w-3.5 text-warning" />
            <span>Revert</span>
          </button>
        )}

        <button
          type="button"
          disabled={!hasAnyUnsavedChanges}
          onClick={onSubmitContribution}
          className="flex items-center gap-1.5 rounded-md gradient-brand px-3 py-1 text-xs font-bold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
          title="Submit changes via Direct Commit or Pull Request"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Submit Contribution</span>
        </button>

        {/* Reserved slot for AI Assistant */}
        <button
          type="button"
          onClick={toggleAiPanel}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
            aiPanelOpen
              ? 'bg-primary text-white shadow-glow-sm'
              : 'border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          title="AI Code Assistant (Reserved Slot)"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Assistant</span>
        </button>
      </div>
    </div>
  );
}
