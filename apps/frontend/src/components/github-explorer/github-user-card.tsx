'use client';

import { ExternalLink, FolderGit2, MapPin, Users, Building, Globe, Twitter } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';
import { GithubUser } from './types';

interface GithubUserCardProps {
  user: GithubUser;
}

export function GithubUserCard({ user }: GithubUserCardProps) {
  return (
    <Card className="overflow-hidden p-6 border-border/60 bg-card/60 backdrop-blur-md">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-20 w-20 shrink-0 rounded-2xl border-2 border-primary/20 object-cover shadow-glow-sm"
            />
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {user.name || user.login}
              </h2>
              <span className="text-sm font-medium text-muted-foreground">@{user.login}</span>
            </div>

            {user.bio && <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{user.bio}</p>}

            {/* Meta details */}
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{user.location}</span>
                </div>
              )}

              {user.company && (
                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  <span>{user.company}</span>
                </div>
              )}

              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate max-w-[180px]">{user.blog}</span>
                </a>
              )}

              {user.twitter_username && (
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <Twitter className="h-3.5 w-3.5 text-primary" />
                  <span>@{user.twitter_username}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action & Stats Badges */}
        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            GitHub Profile
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <FolderGit2 className="h-4 w-4" />
              <span>{user.public_repos} Repositories</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{user.followers} Followers</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
