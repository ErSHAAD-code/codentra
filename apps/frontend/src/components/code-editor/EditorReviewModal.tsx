'use client';

import {
  X,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Zap,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Check,
} from 'lucide-react';
import React, { useState } from 'react';

import { DiffPreview } from '../ai-editor/DiffPreview';

export interface ReviewFinding {
  id: string;
  category: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY' | 'MAINTAINABILITY';
  severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
  lineStart: number | null;
  lineEnd: number | null;
  title: string;
  description: string;
  rootCause?: string;
  suggestedFix?: string;
  status?: 'pending' | 'applied' | 'rejected';
}

export interface ReviewResult {
  filePath: string;
  summary: string;
  findings: ReviewFinding[];
}

interface EditorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewResult: ReviewResult | null;
  currentFileContent: string;
  onApplyFix: (findingId: string, fixCode: string) => void;
  onNavigateToLine?: (line: number) => void;
}

export function EditorReviewModal({
  isOpen,
  onClose,
  reviewResult,
  currentFileContent,
  onApplyFix,
  onNavigateToLine,
}: EditorReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY'>('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [previewFixFindingId, setPreviewFixFindingId] = useState<string | null>(null);
  const [findingStatuses, setFindingStatuses] = useState<Record<string, 'pending' | 'applied' | 'rejected'>>({});

  if (!isOpen || !reviewResult) return null;

  const filteredFindings = reviewResult.findings.filter((f) => {
    if (activeTab === 'ALL') return true;
    return f.category === activeTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BUG':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
      case 'SECURITY':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
      case 'PERFORMANCE':
        return <Zap className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <FileCode className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="rounded bg-red-950/80 px-2 py-0.5 text-[10px] font-bold text-red-400">CRITICAL</span>;
      case 'WARNING':
        return <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400">WARNING</span>;
      default:
        return <span className="rounded bg-blue-950/80 px-2 py-0.5 text-[10px] font-bold text-blue-400">SUGGESTION</span>;
    }
  };

  const handleAcceptFindingFix = (id: string, fix: string) => {
    onApplyFix(id, fix);
    setFindingStatuses((prev) => ({ ...prev, [id]: 'applied' }));
  };

  const handleRejectFindingFix = (id: string) => {
    setFindingStatuses((prev) => ({ ...prev, [id]: 'rejected' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-[#121214] text-foreground shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">AI Code Review Findings</h2>
              <p className="text-xs text-slate-400 truncate max-w-md">{reviewResult.filePath}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="border-b border-border/40 bg-card/40 px-6 py-3 text-xs text-slate-300 font-mono">
          <span className="font-semibold text-primary">Summary: </span>
          {reviewResult.summary}
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-border/40 bg-[#18181b] px-6 text-xs font-mono select-none">
          {(['ALL', 'BUG', 'SECURITY', 'PERFORMANCE', 'QUALITY'] as const).map((cat) => {
            const count =
              cat === 'ALL'
                ? reviewResult.findings.length
                : reviewResult.findings.filter((f) => f.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 font-semibold transition-colors ${
                  activeTab === cat
                    ? 'border-primary text-primary bg-[#121214]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Findings List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {filteredFindings.length > 0 ? (
            filteredFindings.map((finding) => {
              const status = findingStatuses[finding.id] || 'pending';
              const isExpanded = expandedFindingId === finding.id;
              const isPreviewingFix = previewFixFindingId === finding.id;

              return (
                <div
                  key={finding.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(finding.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100">{finding.title}</h3>
                          {getSeverityBadge(finding.severity)}
                          {finding.lineStart && (
                            <button
                              type="button"
                              onClick={() => onNavigateToLine && onNavigateToLine(finding.lineStart!)}
                              className="text-[11px] text-primary hover:underline"
                            >
                              Line {finding.lineStart}
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">{finding.description}</p>
                      </div>
                    </div>

                    {status === 'applied' && (
                      <span className="rounded bg-success/20 px-2.5 py-1 text-[10px] font-bold text-success shrink-0">
                        Applied
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-muted"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-primary" />
                      <span>{isExpanded ? 'Hide Explanation' : 'Explain'}</span>
                    </button>

                    {finding.suggestedFix && (
                      <button
                        type="button"
                        onClick={() => setPreviewFixFindingId(isPreviewingFix ? null : finding.id)}
                        className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isPreviewingFix ? 'Hide Fix Preview' : 'Preview Fix'}</span>
                      </button>
                    )}

                    {finding.suggestedFix && status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptFindingFix(finding.id, finding.suggestedFix!)}
                        className="flex items-center gap-1 rounded-md gradient-brand px-3 py-1 text-xs font-semibold text-white shadow-glow-sm"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Apply Fix</span>
                      </button>
                    )}
                  </div>

                  {/* Expanded Root Cause */}
                  {isExpanded && finding.rootCause && (
                    <div className="mt-3 rounded-lg border border-border/40 bg-slate-900/90 p-3 text-xs font-sans text-slate-300 leading-relaxed">
                      <span className="font-bold text-primary block mb-1">Root Cause Analysis:</span>
                      {finding.rootCause}
                    </div>
                  )}

                  {/* Preview Fix Diff */}
                  {isPreviewingFix && finding.suggestedFix && (
                    <DiffPreview
                      originalCode={currentFileContent}
                      suggestedCode={finding.suggestedFix}
                      status={status}
                      onAccept={() => handleAcceptFindingFix(finding.id, finding.suggestedFix!)}
                      onReject={() => handleRejectFindingFix(finding.id)}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">No findings in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
}
