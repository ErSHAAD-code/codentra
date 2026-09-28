'use client';

import { Sparkles, User as UserIcon } from 'lucide-react';
import React from 'react';

import { DiffPreview } from './DiffPreview';
import { AiChatMessage } from './types';

interface AiMessageProps {
  message: AiChatMessage;
  onAcceptDiff: (messageId: string, code: string) => void;
  onRejectDiff: (messageId: string) => void;
}

export function AiMessage({ message, onAcceptDiff, onRejectDiff }: AiMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl gradient-brand text-white shadow-glow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl p-3.5 ${
          isUser
            ? 'bg-primary text-white rounded-br-none shadow-glow-sm'
            : 'border border-border/60 bg-card/80 text-foreground rounded-bl-none backdrop-blur-md'
        }`}
      >
        <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{message.text}</div>

        {/* Embedded Diff Preview if AI suggested code modifications */}
        {message.hasDiffProposal && message.suggestedCode && (
          <DiffPreview
            originalCode={message.originalCode || ''}
            suggestedCode={message.suggestedCode}
            status={message.status}
            onAccept={() => onAcceptDiff(message.id, message.suggestedCode!)}
            onReject={() => onRejectDiff(message.id)}
          />
        )}

        <div className={`mt-1.5 text-[10px] ${isUser ? 'text-white/70' : 'text-muted-foreground'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/50">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
