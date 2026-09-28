'use client';

import { Star, GitFork, Lock, Globe, ArrowRight, Code } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GithubRepo } from './types';

interface GithubRepoCardProps {
  repo: GithubRepo;
  onSelectRepo: (repo: GithubRepo) => void;
  isSelected?: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  PHP: '#4F5D95',
  Ruby: '#701516',
};

export function GithubRepoCard({ repo, onSelectRepo, isSelected }: GithubRepoCardProps) {
  const formattedDate = new Date(repo.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className={`group relative flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-glow-sm'
          : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card/90'
      }`}
    >
      <div className="space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-base tracking-tight group-hover:text-primary transition-colors">
              {repo.name}
            </h3>
            {repo.private ? (
              <Badge variant="warning" className="gap-1">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
          {repo.description || 'No description provided for this repository.'}
        </p>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {repo.language && (
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#94a3b8' }}
              />
              <span>{repo.language}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-warning fill-warning/20" />
            <span>{repo.stargazers_count}</span>
          </div>

          <div className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            <span>{repo.forks_count}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectRepo(repo)}
          className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow-sm transition-all group-hover:shadow-glow"
        >
          <span>Explore Files</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </Card>
  );
}
