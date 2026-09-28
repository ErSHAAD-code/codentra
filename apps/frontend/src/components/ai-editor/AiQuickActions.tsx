'use client';

import {
  HelpCircle,
  AlertTriangle,
  Wrench,
  Zap,
  Eye,
  TestTube,
  Code2,
} from 'lucide-react';
import React from 'react';

import { QuickActionType } from './types';

interface AiQuickActionsProps {
  onSelectAction: (action: QuickActionType) => void;
  hasSelection?: boolean;
  disabled?: boolean;
}

export function AiQuickActions({ onSelectAction, hasSelection, disabled }: AiQuickActionsProps) {
  const actions: { type: QuickActionType; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'EXPLAIN', label: 'Explain Code', icon: HelpCircle, color: 'text-blue-400' },
    { type: 'FIND_ERRORS', label: 'Find Errors', icon: AlertTriangle, color: 'text-warning' },
    { type: 'FIX', label: 'Fix Code', icon: Wrench, color: 'text-emerald-400' },
    { type: 'OPTIMIZE', label: 'Optimize', icon: Zap, color: 'text-purple-400' },
    { type: 'REVIEW', label: 'Review Code', icon: Eye, color: 'text-cyan-400' },
    { type: 'GENERATE_TESTS', label: 'Generate Tests', icon: TestTube, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-2 border-b border-border/40 pb-3 mb-3 select-none">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>Quick AI Actions</span>
        {hasSelection && (
          <span className="flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary lowercase">
            <Code2 className="h-3 w-3" /> selection active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.type}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAction(act.type)}
              className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-2.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              <Icon className={`h-3.5 w-3.5 ${act.color} shrink-0`} />
              <span className="truncate">{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
