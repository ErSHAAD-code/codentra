'use client';

import {
  Compass,
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FolderGit2,
  Code2,
  Layers,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, Suspense } from 'react';

import { EditorLayout } from '@/components/code-editor/EditorLayout';
import { GithubBranchSelector } from '@/components/github-explorer/github-branch-selector';
import { GithubFileTree } from '@/components/github-explorer/github-file-tree';
import { GithubRepoList } from '@/components/github-explorer/github-repo-list';
import { GithubUserCard } from '@/components/github-explorer/github-user-card';
import { GithubUserSearch } from '@/components/github-explorer/github-user-search';
import {
  GithubUser,
  GithubRepo,
  GithubBranch,
  GithubTreeNode,
} from '@/components/github-explorer/types';
import { apiJsonSafe } from '@/lib/api';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState<string>(searchParams.get('user') || '');
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'editor'>('tree');

  const [userProfile, setUserProfile] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [tree, setTree] = useState<GithubTreeNode[]>([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch GitHub User Profile & Repos
  const loadUser = useCallback(async (userToLoad: string) => {
    if (!userToLoad) return;
    setError(null);
    setLoadingUser(true);
    setLoadingRepos(true);
    setSelectedRepo(null);
    setBranches([]);
    setTree([]);

    const [profileRes, reposRes] = await Promise.all([
      apiJsonSafe<GithubUser>(`/github/users/${encodeURIComponent(userToLoad)}`),
      apiJsonSafe<GithubRepo[]>(`/github/users/${encodeURIComponent(userToLoad)}/repos?per_page=100&sort=updated`),
    ]);

    if (profileRes.error) {
      setError(profileRes.error);
      setUserProfile(null);
      setRepos([]);
    } else {
      setUserProfile(profileRes.data);
      setRepos(reposRes.data || []);
      if (reposRes.error) {
        setError(reposRes.error);
      }
    }

    setLoadingUser(false);
    setLoadingRepos(false);
  }, []);

  // Fetch Branches when Repo is selected
  const loadRepoBranches = useCallback(async (repo: GithubRepo) => {
    setError(null);
    setLoadingBranches(true);
    setBranches([]);
    setTree([]);

    const res = await apiJsonSafe<GithubBranch[]>(
      `/github/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/branches`,
    );

    if (res.error) {
      setError(res.error);
    } else {
      const branchData = res.data || [];
      setBranches(branchData);
      const activeBranch = repo.default_branch || (branchData.length > 0 ? branchData[0]!.name : 'main');
      setSelectedBranch(activeBranch);
    }

    setLoadingBranches(false);
  }, []);

  // Fetch File Tree when Branch is selected
  const loadTree = useCallback(async (repo: GithubRepo, branchName: string) => {
    if (!branchName) return;
    setError(null);
    setLoadingTree(true);

    const res = await apiJsonSafe<{ tree?: GithubTreeNode[] }>(
      `/github/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/tree?branch=${encodeURIComponent(
        branchName,
      )}&recursive=true`,
    );

    if (res.error) {
      setError(res.error);
      setTree([]);
    } else {
      setTree(res.data?.tree || []);
    }

    setLoadingTree(false);
  }, []);

  // Initial load from URL search params
  useEffect(() => {
    const urlUser = searchParams.get('user');
    if (urlUser && urlUser !== username) {
      setUsername(urlUser);
      loadUser(urlUser);
    }
  }, [searchParams, loadUser]);

  // Handle Search Submission
  const handleSearchUser = (newUsername: string) => {
    setUsername(newUsername);
    router.push(`/explore?user=${encodeURIComponent(newUsername)}`);
    loadUser(newUsername);
  };

  // Handle Repo Selection
  const handleSelectRepo = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setViewMode('tree');
    loadRepoBranches(repo);
  };

  // Handle Branch Selection
  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    if (selectedRepo) {
      loadTree(selectedRepo, branchName);
    }
  };

  // Effect to load tree when branch is set
  useEffect(() => {
    if (selectedRepo && selectedBranch) {
      loadTree(selectedRepo, selectedBranch);
    }
  }, [selectedRepo, selectedBranch, loadTree]);

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl gradient-brand shadow-glow-sm">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              GitHub Explorer & IDE
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Search GitHub users, explore public repositories, inspect branches, and edit code live in Monaco Editor.
          </p>
        </div>

        {/* Search input bar */}
        <GithubUserSearch onSelectUser={handleSearchUser} initialUsername={username} />
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-danger/30 bg-danger/10 p-4 text-danger text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      {loadingUser ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-semibold">Loading GitHub user profile...</p>
        </div>
      ) : userProfile ? (
        <div className="space-y-6">
          {/* User Profile Card (only show if not inside full editor view or collapsible) */}
          {viewMode === 'tree' && <GithubUserCard user={userProfile} />}

          {/* Repository View */}
          {selectedRepo ? (
            <div className="space-y-6">
              {/* Header Bar with View Mode Switcher */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMode === 'editor') setViewMode('tree');
                      else setSelectedRepo(null);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-bold text-foreground">
                        {userProfile.login} / {selectedRepo.name}
                      </h2>
                    </div>
                    {selectedRepo.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-lg mt-0.5">
                        {selectedRepo.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle: Tree View vs Code Editor */}
                  <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('tree')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        viewMode === 'tree'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Tree View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('editor')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        viewMode === 'editor'
                          ? 'bg-primary text-white shadow-glow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Code Editor</span>
                    </button>
                  </div>

                  {viewMode === 'tree' && (
                    <>
                      <GithubBranchSelector
                        branches={branches}
                        selectedBranch={selectedBranch}
                        onSelectBranch={handleSelectBranch}
                        defaultBranch={selectedRepo.default_branch}
                        loading={loadingBranches}
                      />

                      <button
                        type="button"
                        onClick={() => selectedBranch && loadTree(selectedRepo, selectedBranch)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
                        title="Refresh Tree"
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingTree ? 'animate-spin' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* View Component: Tree View or Code Editor */}
              {viewMode === 'editor' ? (
                <EditorLayout
                  owner={selectedRepo.owner.login}
                  repo={selectedRepo.name}
                  branches={branches}
                  initialBranch={selectedBranch}
                  tree={tree}
                  onBranchChange={handleSelectBranch}
                  loadingTree={loadingTree}
                />
              ) : (
                <GithubFileTree
                  tree={tree}
                  owner={selectedRepo.owner.login}
                  repo={selectedRepo.name}
                  branch={selectedBranch}
                  loading={loadingTree}
                />
              )}
            </div>
          ) : (
            /* List Repositories */
            <GithubRepoList
              repos={repos}
              onSelectRepo={handleSelectRepo}
              loading={loadingRepos}
            />
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 py-20 px-6 text-center bg-card/30 backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-glow-sm">
            <Compass className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Explore & Edit GitHub Repositories Live</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Type any GitHub username in the search bar above to inspect public profiles, repository file trees, branches, and edit source code in Monaco Editor.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
