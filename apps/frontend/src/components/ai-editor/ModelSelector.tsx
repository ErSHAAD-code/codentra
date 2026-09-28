'use client';

import { ChevronDown, Cpu, Check, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import { ModelInfo } from './types';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ models, selectedModelId, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="relative font-mono text-xs select-none">
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-[#18181c] px-3 py-1.5 text-slate-200 hover:border-primary/60 hover:bg-[#1f1f26] transition-all shadow-sm"
      >
        <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-bold truncate max-w-[130px]">
          {selectedModel?.name || 'Select Model'}
        </span>

        {selectedModel?.badge && (
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
            {selectedModel.badge}
          </span>
        )}

        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border/80 bg-[#141417] p-1.5 shadow-2xl backdrop-blur-md space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-border/40">
            Available Configured AI Models
          </div>

          {models.length === 0 ? (
            <div className="p-3 text-center text-[11px] text-slate-500 italic">
              No models available.
            </div>
          ) : (
            models.map((model) => {
              const isSelected = model.id === selectedModelId;
              const isAvailable = model.isConfigured;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    if (isAvailable) {
                      onSelectModel(model.id);
                      setOpen(false);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`flex w-full items-start justify-between rounded-lg p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border border-primary/50 bg-primary/10 text-white shadow-glow-sm'
                      : isAvailable
                      ? 'hover:bg-[#1d1d24] text-slate-300'
                      : 'opacity-40 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{model.name}</span>
                      {model.badge && (
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300">
                          {model.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Provider: {model.provider}</span>
                      {model.capabilities.supportsAgentMode && (
                        <span className="text-emerald-400">Agent Capable</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-2 mt-0.5">
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                    {!isAvailable && (
                      <span className="flex items-center gap-1 text-[9px] text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        No API Key
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
