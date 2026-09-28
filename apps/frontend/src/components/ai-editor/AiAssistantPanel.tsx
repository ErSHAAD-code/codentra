'use client';

import { Sparkles, X, Bot, Trash2 } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';

import { apiJson } from '@/lib/api';
import { AgentMode } from './AgentMode';
import { AiChat } from './AiChat';
import { AiQuickActions } from './AiQuickActions';
import { ModelSelector } from './ModelSelector';
import { AiChatMessage, QuickActionType, AgentFileChange, ModelInfo } from './types';

interface AiAssistantPanelProps {
  onClose: () => void;
  filePath?: string;
  fileContent?: string;
  selectedCode?: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  onApplyCodeChange: (newCode: string) => void;
  onApplyChangeset?: (changes: AgentFileChange[]) => void;
  onOpenContributionModal?: () => void;
}

export function AiAssistantPanel({
  onClose,
  filePath,
  fileContent,
  selectedCode,
  repoOwner,
  repoName,
  branch,
  onApplyCodeChange,
  onApplyChangeset,
  onOpenContributionModal,
}: AiAssistantPanelProps) {
  const [mode, setMode] = useState<'chat' | 'agent'>('chat');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('openrouter/auto');

  // Fetch available AI models from backend
  useEffect(() => {
    let mounted = true;
    apiJson<ModelInfo[]>('/ai/agent/models')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setModels(data);
          const firstAvailable = data.find((m) => m.isConfigured)?.id || data[0]?.id || 'openrouter/auto';
          setSelectedModelId(firstAvailable);
        }
      })
      .catch(() => {
        // Fallback default model if fetch fails
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleExecutePrompt = useCallback(
    async (action: string, userPrompt?: string) => {
      const userMsgText = userPrompt || `Execute action: ${action}`;
      const userMsgId = `user-${Date.now()}`;

      const userMsg: AiChatMessage = {
        id: userMsgId,
        role: 'user',
        text: userMsgText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const response = await apiJson<{
          replyText: string;
          suggestedCode?: string;
          originalCode?: string;
          hasDiffProposal: boolean;
        }>('/ai/editor-prompt', {
          method: 'POST',
          body: JSON.stringify({
            action,
            userPrompt: userMsgText,
            filePath,
            fileContent,
            selectedCode,
            repoOwner,
            repoName,
            branch,
            modelId: selectedModelId,
          }),
        });

        const assistantMsg: AiChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.replyText,
          timestamp: new Date(),
          suggestedCode: response.suggestedCode,
          originalCode: response.originalCode || selectedCode || fileContent,
          hasDiffProposal: response.hasDiffProposal,
          status: 'pending',
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `⚠️ Error executing action: ${err?.message || 'Unknown error'}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [filePath, fileContent, selectedCode, repoOwner, repoName, branch, selectedModelId],
  );

  const handleQuickAction = (action: QuickActionType) => {
    handleExecutePrompt(action);
  };

  const handleSendMessage = (text: string) => {
    handleExecutePrompt('CUSTOM', text);
  };

  const handleAcceptDiff = (messageId: string, codeToApply: string) => {
    onApplyCodeChange(codeToApply);
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'applied' } : msg)),
    );
  };

  const handleRejectDiff = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'rejected' } : msg)),
    );
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-full w-96 shrink-0 flex-col border-l border-border/60 bg-[#161618] shadow-2xl">
      {/* Header */}
      <div className="flex flex-col border-b border-border/60 bg-[#1a1a1d] px-3.5 py-2.5 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg gradient-brand p-1.5 shadow-glow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Codentra Copilot</span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary uppercase font-mono">
                  Phase 5
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Multi-Model AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {mode === 'chat' && messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Provider Model:
          </span>
          <ModelSelector
            models={models}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
          />
        </div>

        {/* Mode Selector [ Chat ] [ Agent ] */}
        <div className="flex border-t border-border/30 pt-2 bg-[#1a1a1d]">
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex-1 rounded-md py-1 text-center font-bold text-xs transition-all ${
              mode === 'chat'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chat Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('agent')}
            className={`flex-1 rounded-md py-1 text-center font-bold text-xs transition-all ${
              mode === 'agent'
                ? 'gradient-brand text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent Mode
          </button>
        </div>
      </div>

      {/* Main Container */}
      {mode === 'chat' ? (
        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <AiQuickActions
            onSelectAction={handleQuickAction}
            hasSelection={Boolean(selectedCode && selectedCode.trim().length > 0)}
            disabled={loading}
          />

          <AiChat
            messages={messages}
            onSendMessage={handleSendMessage}
            onAcceptDiff={handleAcceptDiff}
            onRejectDiff={handleRejectDiff}
            loading={loading}
          />
        </div>
      ) : (
        <AgentMode
          filePath={filePath}
          fileContent={fileContent}
          selectedCode={selectedCode}
          repoOwner={repoOwner}
          repoName={repoName}
          branch={branch}
          onApplyChangesToWorkspace={onApplyChangeset}
          onOpenContributionModal={onOpenContributionModal}
        />
      )}
    </div>
  );
}
