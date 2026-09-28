'use client';

import { Bug, FolderGit2, LayoutDashboard, MessageSquare, Search, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Command {
  label: string;
  icon: typeof Search;
  href: string;
}

const COMMANDS: Command[] = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Repositories', icon: FolderGit2, href: '/dashboard/repositories' },
  { label: 'Reviews', icon: Bug, href: '/dashboard/reviews' },
  { label: 'AI Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      navigate(filtered[activeIndex].href);
    }
  };

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-32"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search commands"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">Esc</kbd>
        </div>

        <ul role="listbox" className="max-h-80 overflow-y-auto py-2">
          {filtered.map((command, index) => (
            <li key={command.href} role="option" aria-selected={index === activeIndex}>
              <button
                onClick={() => navigate(command.href)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${
                  index === activeIndex ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
              >
                <command.icon size={16} />
                {command.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No results</li>}
        </ul>
      </div>
    </div>
  );
}
