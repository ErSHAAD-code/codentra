'use client';

import { GitBranch, Check, ChevronDown } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { GithubBranch } from '../github-explorer/types';

interface BranchSelectorProps {
  branches: GithubBranch[];
  selectedBranch: string;
  onSelectBranch: (branchName: string) => void;
  defaultBranch?: string;
  hasUnsavedChanges?: boolean;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onSelectBranch,
  defaultBranch,
  hasUnsavedChanges,
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
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

  const handleBranchClick = (branchName: string) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes in your open files. Switching branches will discard local edits. Continue?',
      );
      if (!confirmSwitch) return;
    }
    onSelectBranch(branchName);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-slate-200 transition-colors hover:bg-slate-800"
      >
        <GitBranch className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[120px] truncate">{selectedBranch || defaultBranch || 'main'}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-56 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Switch Branch ({branches.length})
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5 font-mono text-xs">
            {branches.map((branch) => {
              const isSelected = branch.name === selectedBranch;
              return (
                <button
                  key={branch.name}
                  type="button"
                  onClick={() => handleBranchClick(branch.name)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                    isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{branch.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
