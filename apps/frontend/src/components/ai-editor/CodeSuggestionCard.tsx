'use client';

import { Check, Copy, Code } from 'lucide-react';
import React, { useState } from 'react';

interface CodeSuggestionCardProps {
  code: string;
  language?: string;
}

export function CodeSuggestionCard({ code, language = 'typescript' }: CodeSuggestionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border/60 bg-[#121214]">
      <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-3 py-1.5 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Code className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase font-semibold text-primary">{language}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-slate-200 bg-[#0d0d0f]">
        <pre>{code}</pre>
      </div>
    </div>
  );
}
