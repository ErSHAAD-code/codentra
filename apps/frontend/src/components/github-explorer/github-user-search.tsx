'use client';

import { Search, Loader2, X, User as UserIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { apiJson } from '@/lib/api';
import { GithubSearchResultItem } from './types';

interface GithubUserSearchProps {
  onSelectUser: (username: string) => void;
  initialUsername?: string;
}

export function GithubUserSearch({ onSelectUser, initialUsername = '' }: GithubUserSearchProps) {
  const [query, setQuery] = useState(initialUsername);
  const [results, setResults] = useState<GithubSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiJson<{ items: GithubSearchResultItem[] }>(
          `/github/users/search?q=${encodeURIComponent(query.trim())}&per_page=6`,
        );
        setResults(data.items || []);
        setOpen(true);
      } catch (err) {
        console.error('Failed to search GitHub users:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      onSelectUser(query.trim());
    }
  };

  const handleSelect = (username: string) => {
    setQuery(username);
    setOpen(false);
    onSelectUser(username);
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search GitHub username (e.g., torvalds, vercel, gaearon)..."
            className="w-full rounded-2xl border border-border/60 bg-card/80 py-3.5 pl-12 pr-24 text-sm font-medium text-foreground placeholder:text-muted-foreground backdrop-blur-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
              className="absolute right-20 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Suggested GitHub Users
          </div>
          <div className="space-y-1">
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.login)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="h-7 w-7 rounded-full border border-border/50 object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <span className="font-semibold">{user.login}</span>
                <span className="ml-auto text-xs text-muted-foreground">View profile &rarr;</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
