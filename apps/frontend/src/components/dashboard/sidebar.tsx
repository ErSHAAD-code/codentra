'use client';

import { Bug, Compass, FolderGit2, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { LionLogo } from '@/components/ui/lion-logo';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Git User Repo', href: '/explore', icon: Compass },
  { label: 'Repositories', href: '/dashboard/repositories', icon: FolderGit2 },
  { label: 'Reviews', href: '/dashboard/reviews', icon: Bug },
  { label: "Codentra's world", href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm md:flex">
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-border/50 px-5">
        <LionLogo size={30} />
        <span className="font-bold gradient-brand-text text-lg">Codentra</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(252_90%_68%/0.2)]'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <item.icon
                size={17}
                className={cn(
                  'transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-primary' : '',
                )}
              />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom upgrade nudge */}
      <div className="m-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-semibold text-foreground">Upgrade to Pro</p>
        <p className="mt-1 text-xs text-muted-foreground">Unlock unlimited projects & AI chat.</p>
        <Link
          href="#pricing"
          className="mt-3 flex items-center justify-center rounded-lg gradient-brand py-1.5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow transition-shadow duration-300"
        >
          View plans
        </Link>
      </div>
    </aside>

    {/* Mobile Bottom Navigation for PWA/Android/iOS */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border/50 bg-card/85 p-2 backdrop-blur-xl md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          // Shorten label for mobile
          let mobileLabel = item.label;
          if (mobileLabel === "Codentra's world") mobileLabel = "Chat";
          if (mobileLabel === "Repositories") mobileLabel = "Repos";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex w-16 flex-col items-center gap-1 rounded-lg p-1.5 transition-all',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <item.icon size={20} className={cn('transition-transform duration-200', active ? 'scale-110' : '')} />
              <span className="text-[10px] font-medium tracking-tight">{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
