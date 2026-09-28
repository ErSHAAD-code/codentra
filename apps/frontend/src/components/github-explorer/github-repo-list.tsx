'use client';

import { Search, Filter, FolderGit2, AlertCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { GithubRepoCard } from './github-repo-card';
import { GithubRepo } from './types';

interface GithubRepoListProps {
  repos: GithubRepo[];
  onSelectRepo: (repo: GithubRepo) => void;
  selectedRepoName?: string;
  loading?: boolean;
}

export function GithubRepoList({ repos, onSelectRepo, selectedRepoName, loading }: GithubRepoListProps) {
  const [filterText, setFilterText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => r.language && set.add(r.language));
    return Array.from(set).sort();
  }, [repos]);

  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesText =
          r.name.toLowerCase().includes(filterText.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(filterText.toLowerCase()));
        const matchesLang = selectedLanguage === 'ALL' || r.language === selectedLanguage;
        return matchesText && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [repos, filterText, selectedLanguage, sortBy]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl border border-border/40 bg-card/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Repositories ({repos.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search inside repos */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter repositories..."
              className="rounded-xl border border-border/60 bg-card/60 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Language filter */}
          {languages.length > 0 && (
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Repos Grid */}
      {filteredRepos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo) => (
            <GithubRepoCard
              key={repo.id}
              repo={repo}
              onSelectRepo={onSelectRepo}
              isSelected={selectedRepoName === repo.name}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center bg-card/20">
          <AlertCircle className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h4 className="font-semibold text-foreground">No repositories found</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {filterText || selectedLanguage !== 'ALL'
              ? 'Try adjusting your search or filter settings.'
              : 'This user has no public repositories available.'}
          </p>
        </div>
      )}
    </div>
  );
}
