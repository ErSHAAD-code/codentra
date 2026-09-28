import { CommandPalette } from '@/components/dashboard/command-palette';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
