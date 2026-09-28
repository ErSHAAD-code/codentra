'use client';

import { Sparkles, FileCode } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { AiAssistantPanel } from '@/components/ai-editor/AiAssistantPanel';
import { apiJson } from '@/lib/api';
import { GithubBranch, GithubTreeNode, GithubFileContent } from '../github-explorer/types';
import { CodeEditor, CodeEditorHandle } from './CodeEditor';
import { ChangesPanel } from './ChangesPanel';
import { ContributionDialog } from './ContributionDialog';
import { EditorReviewModal, ReviewResult } from './EditorReviewModal';
import { EditorTabs } from './EditorTabs';
import { EditorToolbar } from './EditorToolbar';
import { FileExplorer } from './FileExplorer';
import { getMonacoLanguage } from './language-helper';
import { ProblemsPanel, ProblemMarker } from './ProblemsPanel';
import { EditorTab, CursorPosition } from './types';

interface EditorLayoutProps {
  owner: string;
  repo: string;
  branches: GithubBranch[];
  initialBranch: string;
  tree: GithubTreeNode[];
  initialFilePath?: string;
  onBranchChange: (branch: string) => void;
  loadingTree?: boolean;
}

export function EditorLayout({
  owner,
  repo,
  branches,
  initialBranch,
  tree,
  initialFilePath,
  onBranchChange,
  loadingTree,
}: EditorLayoutProps) {
  const editorRef = useRef<CodeEditorHandle>(null);

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [selectedCode, setSelectedCode] = useState('');
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ line: 1, column: 1 });
  const [problems, setProblems] = useState<ProblemMarker[]>([]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [reviewingCode, setReviewingCode] = useState(false);
  const [analyzingErrors, setAnalyzingErrors] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) || null, [tabs, activeTabId]);
  const dirtyTabs = useMemo(() => tabs.filter((t) => t.isDirty), [tabs]);
  const hasAnyUnsavedChanges = useMemo(() => dirtyTabs.length > 0, [dirtyTabs]);

  const handleContributionSuccess = () => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        originalContent: tab.currentContent,
        isDirty: false,
      })),
    );
  };

  // Prevent accidental tab/browser closure when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyUnsavedChanges]);

  // Open file in editor tabs
  const handleOpenFile = useCallback(
    async (path: string) => {
      const existing = tabs.find((t) => t.path === path);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      try {
        const data = await apiJson<GithubFileContent>(
          `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents?path=${encodeURIComponent(
            path,
          )}&ref=${encodeURIComponent(selectedBranch)}`,
        );

        let textContent = '';
        if (data.content && data.encoding === 'base64') {
          textContent = atob(data.content.replace(/\n/g, ''));
        } else if (typeof data.content === 'string') {
          textContent = data.content;
        }

        const name = path.split('/').pop() || path;
        const language = getMonacoLanguage(path);
        const newTabId = `${selectedBranch}:${path}`;

        const newTab: EditorTab = {
          id: newTabId,
          path,
          name,
          originalContent: textContent,
          currentContent: textContent,
          language,
          isDirty: false,
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTabId);
      } catch (err) {
        console.error('Failed to load file content:', err);
      }
    },
    [owner, repo, selectedBranch, tabs],
  );

  // Initial file auto-open if passed
  useEffect(() => {
    if (initialFilePath && tabs.length === 0) {
      handleOpenFile(initialFilePath);
    }
  }, [initialFilePath, tabs.length, handleOpenFile]);

  // Update tab content on edit
  const handleCodeChange = (newCode: string) => {
    if (!activeTabId) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          const isDirty = newCode !== tab.originalContent;
          return { ...tab, currentContent: newCode, isDirty };
        }
        return tab;
      }),
    );
  };

  // Apply code change from AI assistant or review fix (Accept proposal)
  const handleApplyAiCodeChange = (newCode: string) => {
    if (!activeTabId) return;
    handleCodeChange(newCode);
  };

  // Phase 3 — Apply multi-file accepted agent changeset to Monaco workspace
  const handleApplyAgentChangeset = (changes: import('../ai-editor/types').AgentFileChange[]) => {
    setTabs((prevTabs) => {
      let updatedTabs = [...prevTabs];

      changes.forEach((change) => {
        const tabId = `${selectedBranch}:${change.path}`;
        const existingTab = updatedTabs.find((t) => t.path === change.path || t.id === tabId);

        if (change.operation === 'DELETE') {
          updatedTabs = updatedTabs.filter((t) => t.id !== existingTab?.id);
        } else if (change.operation === 'CREATE' || change.operation === 'MODIFY') {
          if (existingTab) {
            updatedTabs = updatedTabs.map((t) =>
              t.id === existingTab.id
                ? { ...t, currentContent: change.proposedContent, isDirty: change.proposedContent !== t.originalContent }
                : t,
            );
          } else {
            const name = change.path.split('/').pop() || change.path;
            const language = getMonacoLanguage(change.path);
            updatedTabs.push({
              id: tabId,
              path: change.path,
              name,
              originalContent: change.originalContent || '',
              currentContent: change.proposedContent,
              language,
              isDirty: true,
            });
          }
        }
      });

      return updatedTabs;
    });
  };

  // Close tab
  const handleCloseTab = (idToClose: string) => {
    const tabToClose = tabs.find((t) => t.id === idToClose);
    if (tabToClose?.isDirty) {
      const confirmClose = window.confirm(
        `File "${tabToClose.name}" has unsaved changes. Are you sure you want to close it?`,
      );
      if (!confirmClose) return;
    }

    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== idToClose);
      if (activeTabId === idToClose) {
        const remainingIndex = prev.findIndex((t) => t.id === idToClose);
        const nextActive = filtered[remainingIndex] || filtered[remainingIndex - 1] || null;
        setActiveTabId(nextActive ? nextActive.id : null);
      }
      return filtered;
    });
  };

  // Revert active tab edits
  const handleRevertActiveTab = () => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, currentContent: t.originalContent, isDirty: false } : t)),
    );
  };

  // Handle branch switch
  const handleSelectBranch = (newBranch: string) => {
    setSelectedBranch(newBranch);
    setTabs([]);
    setActiveTabId(null);
    onBranchChange(newBranch);
  };

  // Navigate to line in Monaco
  const handleNavigateToLine = (line: number, col = 1) => {
    if (editorRef.current) {
      editorRef.current.revealLine(line, col);
    }
  };

  // Trigger AI Error Analysis
  const handleAnalyzeErrorsWithAi = async () => {
    if (!activeTab) return;
    setAnalyzingErrors(true);

    try {
      const errorMsgs = problems.map((p) => `Line ${p.startLineNumber}: ${p.message}`);
      const res = await apiJson<ReviewResult>('/ai/editor-analyze-errors', {
        method: 'POST',
        body: JSON.stringify({
          filePath: activeTab.path,
          fileContent: activeTab.currentContent,
          errorMessages: errorMsgs,
        }),
      });

      setReviewResult(res);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('Failed to analyze errors with AI:', err);
    } finally {
      setAnalyzingErrors(false);
    }
  };

  // Trigger AI Code Review
  const handleRunCodeReview = async () => {
    if (!activeTab) return;
    setReviewingCode(true);

    try {
      const res = await apiJson<ReviewResult>('/ai/editor-review', {
        method: 'POST',
        body: JSON.stringify({
          filePath: activeTab.path,
          fileContent: activeTab.currentContent,
          repoOwner: owner,
          repoName: repo,
        }),
      });

      setReviewResult(res);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('Failed to run AI code review:', err);
    } finally {
      setReviewingCode(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-[#121214] shadow-2xl">
      {/* Top Toolbar */}
      <EditorToolbar
        owner={owner}
        repo={repo}
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
        activeTab={activeTab}
        onRevertActiveTab={handleRevertActiveTab}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
        sidebarOpen={sidebarOpen}
        toggleAiPanel={() => setAiPanelOpen((a) => !a)}
        aiPanelOpen={aiPanelOpen}
        hasAnyUnsavedChanges={hasAnyUnsavedChanges}
        onSubmitContribution={() => setContributionDialogOpen(true)}
      />

      {/* Main IDE Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 h-full">
            <FileExplorer
              tree={tree}
              onOpenFile={handleOpenFile}
              activePath={activeTab?.path}
              tabs={tabs}
              loading={loadingTree}
            />
          </div>
        )}

        {/* Center: Tabs, Monaco Editor, Problems & Changes Panels */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#1e1e1e]">
          <EditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
          />

          <div className="relative flex-1 overflow-hidden">
            {activeTab ? (
              <CodeEditor
                ref={editorRef}
                value={activeTab.currentContent}
                onChange={handleCodeChange}
                language={activeTab.language}
                onCursorChange={setCursorPos}
                onSelectionChange={setSelectedCode}
                onMarkersChange={setProblems}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#1e1e1e]">
                <FileCode className="h-16 w-16 text-slate-700 mb-4" />
                <h3 className="text-base font-semibold text-slate-300">No file open in editor</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Select a file from the file explorer sidebar on the left to start editing code.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Problems Panel */}
          {activeTab && (
            <ProblemsPanel
              problems={problems}
              onNavigateToLine={handleNavigateToLine}
              onAnalyzeErrorsWithAi={handleAnalyzeErrorsWithAi}
              onRunCodeReview={handleRunCodeReview}
              analyzingErrors={analyzingErrors}
              reviewingCode={reviewingCode}
              activeFilePath={activeTab.path}
            />
          )}

          {/* Bottom Unsaved Changes Panel */}
          {dirtyTabs.length > 0 && (
            <ChangesPanel
              dirtyTabs={dirtyTabs}
              onSelectTab={setActiveTabId}
              onSubmitContribution={() => setContributionDialogOpen(true)}
            />
          )}

          {/* Bottom Status Bar */}
          <div className="flex h-6 w-full items-center justify-between border-t border-border/40 bg-[#18181b] px-4 font-mono text-[11px] text-slate-400 select-none">
            <div className="flex items-center gap-4">
              {activeTab && (
                <>
                  <span>
                    Ln {cursorPos.line}, Col {cursorPos.column}
                  </span>
                  <span>UTF-8</span>
                  <span>{activeTab.currentContent.split('\n').length} lines</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {activeTab && <span className="uppercase text-primary font-semibold">{activeTab.language}</span>}
              <span>Monaco IDE</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: AI Assistant Panel */}
        {aiPanelOpen && (
          <AiAssistantPanel
            onClose={() => setAiPanelOpen(false)}
            filePath={activeTab?.path}
            fileContent={activeTab?.currentContent}
            selectedCode={selectedCode}
            repoOwner={owner}
            repoName={repo}
            branch={selectedBranch}
            onApplyCodeChange={handleApplyAiCodeChange}
            onApplyChangeset={handleApplyAgentChangeset}
            onOpenContributionModal={() => setContributionDialogOpen(true)}
          />
        )}
      </div>

      {/* AI Code Review Modal */}
      <EditorReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewResult={reviewResult}
        currentFileContent={activeTab?.currentContent || ''}
        onApplyFix={(findingId, fixCode) => handleApplyAiCodeChange(fixCode)}
        onNavigateToLine={handleNavigateToLine}
      />

      {/* GitHub Contribution Confirmation Modal */}
      <ContributionDialog
        isOpen={contributionDialogOpen}
        onClose={() => setContributionDialogOpen(false)}
        owner={owner}
        repo={repo}
        branch={selectedBranch}
        dirtyTabs={dirtyTabs}
        onContributionSuccess={handleContributionSuccess}
      />
    </div>
  );
}
