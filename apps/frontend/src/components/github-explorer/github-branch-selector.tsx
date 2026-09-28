'use client';

import { GitBranch, Check, ChevronDown, Search } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { GithubBranch } from './types';

interface GithubBranchSelectorProps {
  branches: GithubBranch[];
  selectedBranch: string;
  onSelectBranch: (branchName: string) => void;
  defaultBranch?: string;
  loading?: boolean;
}

export function GithubBranchSelector({
  branches,
  selectedBranch,
  onSelectBranch,
  defaultBranch,
  loading,
}: GithubBranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading || branches.length === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-card disabled:opacity-50"
      >
        <GitBranch className="h-4 w-4 text-primary" />
        <span className="max-w-[140px] truncate">{selectedBranch || defaultBranch || 'Select branch'}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-64 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="p-1.5">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Find a branch..."
                className="w-full rounded-lg border border-border/60 bg-muted/30 py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
              Branches ({branches.length})
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filteredBranches.map((branch) => {
              const isSelected = branch.name === selectedBranch;
              const isDefault = branch.name === defaultBranch;
              return (
                <button
                  key={branch.name}
                  type="button"
                  onClick={() => {
                    onSelectBranch(branch.name);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <span className="truncate max-w-[170px]">{branch.name}</span>
                  <div className="flex items-center gap-1">
                    {isDefault && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        default
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}

            {filteredBranches.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">No branches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
