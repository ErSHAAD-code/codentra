'use client';

import { Send, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { AiMessage } from './AiMessage';
import { AiChatMessage } from './types';

interface AiChatProps {
  messages: AiChatMessage[];
  onSendMessage: (text: string) => void;
  onAcceptDiff: (messageId: string, code: string) => void;
  onRejectDiff: (messageId: string) => void;
  loading?: boolean;
}

export function AiChat({ messages, onSendMessage, onAcceptDiff, onRejectDiff, loading }: AiChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p className="text-xs font-semibold">Ask Codentra AI anything about your code</p>
            <p className="mt-1 text-[11px] text-muted-foreground/70 max-w-xs">
              Use quick actions above or type custom instructions below.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <AiMessage
              key={msg.id}
              message={msg}
              onAcceptDiff={onAcceptDiff}
              onRejectDiff={onRejectDiff}
            />
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 p-3 text-xs text-primary font-medium animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Codentra AI is analyzing code...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/40 bg-card/60 backdrop-blur-md">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI or request code changes..."
            disabled={loading}
            className="w-full rounded-xl border border-border/60 bg-card/90 py-2.5 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 rounded-lg gradient-brand p-1.5 text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
