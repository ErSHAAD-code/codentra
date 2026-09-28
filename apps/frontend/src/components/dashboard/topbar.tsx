'use client';

import { Bell, LogOut, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function Topbar() {
  const { data: session } = useSession();

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/30 px-6 backdrop-blur-sm">
      {/* Search */}
      <button
        onClick={openCommandPalette}
        className="flex w-72 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
      >
        <Search size={15} />
        <span>Search anything…</span>
        <kbd className="ml-auto rounded-md border border-border/60 bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground"
        >
          <Bell size={17} />
          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border/60" />

        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? 'User'}
              className="h-8 w-8 rounded-full border border-border/60 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white shadow-glow-sm">
              {session?.user?.name?.charAt(0) ?? 'U'}
            </div>
          )}
          <span className="hidden text-sm font-medium sm:block">{session?.user?.name ?? 'User'}</span>
        </div>

        {/* Sign out */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Sign out"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-danger"
        >
          <LogOut size={15} />
        </Button>
      </div>
    </header>
  );
}
