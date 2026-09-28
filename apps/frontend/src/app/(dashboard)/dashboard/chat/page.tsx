'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, 
  Bot, 
  Copy, 
  Edit3, 
  FileText, 
  MessageSquare, 
  MoreHorizontal, 
  Paperclip, 
  Pin, 
  Plus, 
  Send, 
  Share, 
  Sparkles, 
  Trash2, 
  User as UserIcon,
  HardDrive
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { apiFetch, apiJson } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Repository {
  id: string;
  name: string;
  status: string;
}

interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

export default function ChatPage() {
  const [repositories, setRepositories] = useState<Repository[] | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  
  // UI States for new features
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close attachment menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node)) {
        setAttachmentMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load repositories on mount
  const loadRepositories = async () => {
    const repos = await apiJson<Repository[]>('/repositories/mine');
    setRepositories(repos);
    if (repos.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repos[0]!.id);
    }
  };

  // Load chat history when a repo is selected
  const loadChats = async (repoId: string) => {
    const history = await apiJson<Chat[]>(`/repositories/${repoId}/chats`);
    setChats(history);
  };

  // Load messages when a chat is selected
  const loadMessages = async (repoId: string, id: string) => {
    const msgs = await apiJson<Message[]>(`/repositories/${repoId}/chats/${id}/messages`);
    setMessages(msgs);
  };

  useEffect(() => {
    loadRepositories().catch(() => setRepositories([]));
  }, []);

  useEffect(() => {
    if (selectedRepoId) {
      loadChats(selectedRepoId);
      setChatId(null);
      setMessages([]);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  const handleQuickStart = async () => {
    setCreatingRepo(true);
    try {
      await apiJson('/repositories/quick-start', { method: 'POST' });
      await loadRepositories();
    } finally {
      setCreatingRepo(false);
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
  };

  const handleSelectChat = (id: string) => {
    if (!selectedRepoId) return;
    setChatId(id);
    loadMessages(selectedRepoId, id);
  };

  const handleDeleteChat = async (id: string) => {
    if (!selectedRepoId) return;
    await apiFetch(`/repositories/${selectedRepoId}/chats/${id}`, { method: 'DELETE' });
    if (chatId === id) {
      setChatId(null);
      setMessages([]);
    }
    loadChats(selectedRepoId);
    setActiveChatMenu(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => prev + (prev ? '\n' : '') + `[Attached File: ${file.name}] `);
      setAttachmentMenuOpen(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleEditMessage = (content: string) => {
    setInput(content);
    // Focus the textarea if possible
    const textarea = document.getElementById('chat-input');
    if (textarea) textarea.focus();
  };

  const ensureChat = async (repositoryId: string): Promise<string> => {
    if (chatId) return chatId;
    const chat = await apiJson<{ id: string }>(`/repositories/${repositoryId}/chats`, { method: 'POST' });
    setChatId(chat.id);
    loadChats(repositoryId);
    return chat.id;
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedRepoId || streaming) return;
    const content = input;
    setInput('');
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'USER', content }]);

    const activeChatId = await ensureChat(selectedRepoId);
    setStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'ASSISTANT', content: '' }]);

    try {
      const response = await apiFetch(`/repositories/${selectedRepoId}/chats/${activeChatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;
          const parsed = JSON.parse(payload) as { text?: string; error?: string };
          
          if (parsed.error) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: `⚠️ ${parsed.error}` } : m)),
            );
            continue;
          }
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + (parsed.text ?? '') } : m)),
          );
        }
      }
    } finally {
      setStreaming(false);
    }
  };

  if (repositories !== null && repositories.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          icon={Sparkles}
          title="No repositories yet"
          description="Create a test repository to try Codentra's world immediately, or upload a real one from the Repositories page."
          actionLabel={creatingRepo ? 'Creating...' : 'Create test repository'}
          onAction={handleQuickStart}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-border/50 bg-background/50 shadow-sm backdrop-blur-sm">
      
      {/* LEFT SIDEBAR - CHAT HISTORY */}
      <div className="w-64 border-r border-border/50 bg-card/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border/40">
          <Button onClick={handleNewChat} variant="outline" className="w-full justify-start gap-2 bg-background/50 hover:bg-background border-border/50 shadow-sm transition-all hover:border-primary/50">
            <Plus size={16} /> New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1" onMouseLeave={() => setActiveChatMenu(null)}>
          <p className="px-2 pb-2 pt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recents</p>
          {chats.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground/60 italic">No previous chats</p>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id} 
                className="relative group"
                onMouseLeave={() => activeChatMenu === chat.id && setActiveChatMenu(null)}
              >
                <button
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 truncate pr-8",
                    chatId === chat.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-foreground/80 hover:bg-card/40 hover:text-foreground"
                  )}
                >
                  <MessageSquare size={14} className={chatId === chat.id ? "text-primary" : "text-muted-foreground"} />
                  <span className="truncate">Chat {new Date(chat.createdAt).toLocaleDateString()}</span>
                </button>
                
                {/* 3 dots menu button (only visible on hover or if active) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChatMenu(activeChatMenu === chat.id ? null : chat.id);
                  }}
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-background transition-opacity",
                    activeChatMenu === chat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <MoreHorizontal size={14} className="text-muted-foreground hover:text-foreground" />
                </button>

                {/* Sidebar Chat Options Dropdown */}
                <AnimatePresence>
                  {activeChatMenu === chat.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-9 w-40 z-50 rounded-lg border border-border/50 bg-[#1e1e1e] shadow-xl p-1 overflow-hidden"
                    >
                      <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-sm flex items-center gap-2 text-gray-200 transition-colors">
                        <Share size={13} /> Share
                      </button>
                      <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-sm flex items-center gap-2 text-gray-200 transition-colors">
                        <Edit3 size={13} /> Rename
                      </button>
                      <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-sm flex items-center gap-2 text-gray-200 transition-colors">
                        <Pin size={13} /> Pin chat
                      </button>
                      <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-sm flex items-center gap-2 text-gray-200 transition-colors">
                        <Archive size={13} /> Archive
                      </button>
                      <div className="h-px bg-border/40 my-1 mx-2" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-destructive/20 hover:text-red-400 rounded-sm flex items-center gap-2 text-red-500 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {repositories && repositories.length > 0 && (
          <div className="p-4 border-t border-border/40 bg-card/30">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Repository Context</label>
            <select
              className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
              value={selectedRepoId ?? ''}
              onChange={(e) => setSelectedRepoId(e.target.value)}
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background/30">
        <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl gradient-brand shadow-glow flex items-center justify-center mb-6">
                <Sparkles className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-2 tracking-tight">Welcome to Codentra's world</h2>
              <p className="text-sm text-muted-foreground mb-10 max-w-md">
                I am your elite AI architect. Attach files, ask questions, or have me find bugs within your selected repository.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline" className="h-auto py-4 justify-start bg-card/30 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group" onClick={() => setInput('Find any potential bugs or security vulnerabilities in this repository.')}>
                  <Sparkles className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> 
                  <div className="text-left"><p className="font-semibold text-foreground">Find bugs</p><p className="text-muted-foreground text-[10px]">Analyze code for issues</p></div>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start bg-card/30 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group" onClick={() => setInput('Explain the overall architecture and data flow.')}>
                  <FileText className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> 
                  <div className="text-left"><p className="font-semibold text-foreground">Architecture</p><p className="text-muted-foreground text-[10px]">Explain the system flow</p></div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto w-full pb-6">
              {messages.map((message) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id} 
                  className={cn("flex gap-4 group", message.role === 'USER' ? "justify-end" : "justify-start")}
                >
                  {message.role === 'ASSISTANT' && (
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 mt-1 shadow-glow-sm">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    message.role === 'USER' ? "items-end" : "items-start w-full"
                  )}>
                    <div className={cn(
                      "px-5 py-4 text-sm rounded-2xl leading-relaxed shadow-sm",
                      message.role === 'USER' 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-[#1e1e1e] border border-border/30 text-foreground rounded-tl-sm backdrop-blur-sm w-full"
                    )}>
                      {message.role === 'USER' ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="markdown-prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="mt-2 mb-4 rounded-lg overflow-hidden border border-border/30 shadow-md">
                                    <div className="bg-[#121212] px-4 py-2 text-xs text-muted-foreground flex items-center justify-between border-b border-border/30 font-medium font-mono">
                                      {match[1]}
                                      <button 
                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                      >
                                        <Copy size={12} /> <span className="text-[10px]">Copy code</span>
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      {...props}
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ margin: 0, borderRadius: 0, padding: '1rem', background: '#0a0a0a' }}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code {...props} className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[13px] font-mono">
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                              h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 text-white">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-4 text-white">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 text-white">{children}</h3>,
                              a: ({ href, children }) => <a href={href} className="text-primary hover:underline">{children}</a>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                            }}
                          >
                            {message.content || (streaming && message.role === 'ASSISTANT' ? '...' : '')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Message Actions (Copy / Edit) Below Message */}
                    <div className={cn(
                      "flex gap-1 bg-transparent px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      message.role === 'USER' ? "justify-end" : "justify-start"
                    )}>
                      <button 
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="p-1 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5"
                        title="Copy message"
                      >
                        <Copy size={12} />
                        {copiedMessageId === message.id && <span className="text-[10px] font-medium pr-1">Copied</span>}
                      </button>
                      {message.role === 'USER' && (
                        <button 
                          onClick={() => handleEditMessage(message.content)}
                          className="p-1 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-colors"
                          title="Edit message"
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'USER' && (
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-border flex items-center justify-center flex-shrink-0 mt-1">
                      <UserIcon size={16} className="text-secondary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
              {/* Extra padding at bottom so actions don't get cut off */}
              <div className="h-4" /> 
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-background/50 border-t border-border/50 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-card/40 border border-border/60 rounded-2xl p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            
            {/* Attachments Dropdown Menu (Gemini Style) */}
            <div className="relative" ref={attachmentRef}>
              <button 
                onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                title="Attach files"
              >
                <Plus size={20} />
              </button>
              
              <AnimatePresence>
                {attachmentMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-12 left-0 w-56 z-50 rounded-xl border border-border/50 bg-[#1e1e1e] shadow-xl p-2 overflow-hidden flex flex-col gap-1"
                  >
                    <div className="px-2 py-1.5 flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Add Context</span>
                      <button onClick={() => setAttachmentMenuOpen(false)} className="text-muted-foreground hover:text-white">✕</button>
                    </div>
                    
                    {/* Hidden File Input */}
                    <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                    
                    <button 
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 rounded-lg flex items-center gap-3 text-gray-200 transition-colors"
                    >
                      <Paperclip size={16} /> Upload files
                    </button>
                    <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 rounded-lg flex items-center gap-3 text-gray-200 transition-colors">
                      <HardDrive size={16} /> Add from Drive
                    </button>
                    <div className="h-px bg-border/40 my-1 mx-2" />
                    <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded-lg flex items-center justify-between text-gray-400 transition-colors group">
                      <span>More uploads</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask Codentra's world anything..."
              disabled={streaming}
              className="flex-1 resize-none bg-transparent pt-2.5 pb-2.5 px-2 text-sm outline-none disabled:opacity-50 min-h-[44px] max-h-40"
              rows={1}
            />
            
            <Button 
              onClick={sendMessage} 
              disabled={streaming || !input.trim()} 
              size="icon" 
              className="mb-1 w-10 h-10 rounded-xl flex-shrink-0 gradient-brand shadow-glow-sm"
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            Codentra's world can make mistakes. Always verify code before deploying to production.
          </p>
        </div>
      </div>
    </div>
  );
}
