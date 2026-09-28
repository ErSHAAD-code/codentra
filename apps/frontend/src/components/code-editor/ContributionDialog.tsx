'use client';

import {
  X,
  GitPullRequest,
  GitCommit,
  GitFork,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { DiffPreview } from '../ai-editor/DiffPreview';
import { apiJson } from '@/lib/api';
import { EditorTab } from './types';

interface PermissionResult {
  owner: string;
  repo: string;
  branch: string;
  authenticatedUser: string;
  hasWriteAccess: boolean;
  isBranchProtected: boolean;
  suggestedWorkflow: 'DIRECT_COMMIT' | 'NEW_BRANCH_PR' | 'FORK_PR';
}

interface SubmissionResult {
  success: boolean;
  workflow: 'DIRECT_COMMIT' | 'FORK_PR';
  commitUrl?: string;
  prUrl?: string;
  prNumber?: number;
  forkRepo?: string;
  branchName?: string;
  message: string;
}

interface ContributionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  branch: string;
  dirtyTabs: EditorTab[];
  onContributionSuccess?: () => void;
}

export function ContributionDialog({
  isOpen,
  onClose,
  owner,
  repo,
  branch,
  dirtyTabs,
  onContributionSuccess,
}: ContributionDialogProps) {
  const [permission, setPermission] = useState<PermissionResult | null>(null);
  const [loadingPerm, setLoadingPerm] = useState(false);

  const [commitMessage, setCommitMessage] = useState('Update code via Codentra IDE');
  const [prTitle, setPrTitle] = useState(`Contribution: Changes to ${dirtyTabs[0]?.name || 'repository'}`);
  const [prBody, setPrBody] = useState('Submitted automatically via Codentra Browser IDE AI Assistant.');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch permission check on open
  useEffect(() => {
    if (isOpen) {
      setLoadingPerm(true);
      setError(null);
      setResult(null);

      apiJson<PermissionResult>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/permissions?branch=${encodeURIComponent(
          branch,
        )}`,
      )
        .then((data) => setPermission(data))
        .catch((err) => {
          console.error('Permission check failed:', err);
          setError(err?.message || 'Failed to verify GitHub permissions');
        })
        .finally(() => setLoadingPerm(false));
    }
  }, [isOpen, owner, repo, branch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim() || dirtyTabs.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const changes = dirtyTabs.map((tab) => ({
        path: tab.path,
        content: tab.currentContent,
      }));

      const res = await apiJson<SubmissionResult>('/github/contribution/submit', {
        method: 'POST',
        body: JSON.stringify({
          owner,
          repo,
          baseBranch: branch,
          commitMessage,
          prTitle,
          prBody,
          changes,
        }),
      });

      setResult(res);
      if (onContributionSuccess) {
        onContributionSuccess();
      }
    } catch (err: any) {
      console.error('Contribution submission error:', err);
      setError(err?.message || 'Failed to submit contribution to GitHub');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-[#121214] text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow-sm">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Submit GitHub Contribution</h2>
              <p className="text-xs text-slate-400 font-mono">
                {owner}/{repo} ({branch})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
          {/* Permission Status Banner */}
          {loadingPerm ? (
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 p-4 text-slate-400 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Verifying GitHub permissions and branch protection rules...</span>
            </div>
          ) : permission ? (
            <div
              className={`rounded-xl border p-4 ${
                permission.hasWriteAccess && !permission.isBranchProtected
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {permission.hasWriteAccess && !permission.isBranchProtected ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <GitFork className="h-4 w-4 text-amber-400" />
                  )}
                  <span>
                    {permission.hasWriteAccess && !permission.isBranchProtected
                      ? 'Direct Commit Allowed'
                      : 'Fork & Pull Request Workflow'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-normal">
                  User: <span className="text-slate-200 font-semibold">{permission.authenticatedUser}</span>
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-300 font-sans">
                {permission.hasWriteAccess && !permission.isBranchProtected
                  ? `You have write permissions for ${owner}/${repo}. Your changes will be committed directly to branch '${branch}'.`
                  : `You do not have direct write access to ${owner}/${repo}. Codentra will automatically fork the repo, create a patch branch, push your commits, and create a Pull Request.`}
              </p>
            </div>
          ) : null}

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Result View */}
          {result ? (
            <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-emerald-200 text-center font-sans">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Contribution Submitted!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">{result.message}</p>

              <div className="pt-4 flex justify-center gap-3">
                {result.prUrl && (
                  <a
                    href={result.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow"
                  >
                    <span>View Pull Request #{result.prNumber}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Changed Files Summary */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Files Changed ({dirtyTabs.length})
                </label>
                <div className="space-y-2">
                  {dirtyTabs.map((tab) => (
                    <div key={tab.id} className="rounded-xl border border-border/40 bg-card/40 p-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-3.5 w-3.5 text-primary" />
                          <span>{tab.path}</span>
                        </div>
                        <span className="text-[10px] text-amber-400 uppercase">Modified</span>
                      </div>

                      <DiffPreview
                        originalCode={tab.originalContent}
                        suggestedCode={tab.currentContent}
                        status="pending"
                        onAccept={() => {}}
                        onReject={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Commit Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Commit Message
                </label>
                <input
                  type="text"
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Summarize code changes..."
                  className="w-full rounded-xl border border-border/60 bg-card/80 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
              </div>

              {/* PR Details if Fork PR Workflow */}
              {permission && !permission.hasWriteAccess && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Pull Request Title
                    </label>
                    <input
                      type="text"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      placeholder="PR Title..."
                      className="w-full rounded-xl border border-border/60 bg-card/80 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Pull Request Description
                    </label>
                    <textarea
                      rows={2}
                      value={prBody}
                      onChange={(e) => setPrBody(e.target.value)}
                      placeholder="Describe your changes for the maintainers..."
                      className="w-full rounded-xl border border-border/60 bg-card/80 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || dirtyTabs.length === 0}
                  className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2 text-xs font-bold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="h-4 w-4" />
                      <span>
                        {permission?.hasWriteAccess && !permission?.isBranchProtected
                          ? 'Commit directly to branch'
                          : 'Submit Pull Request'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
