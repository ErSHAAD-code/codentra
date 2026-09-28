'use client';

import { Bell, Check, Github, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiJson } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    apiJson<Notification[]>('/notifications')
      .then(setNotifications)
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id: string) => {
    await apiJson(`/notifications/${id}/read`, { method: 'PATCH' });
    loadNotifications();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, connections, and notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name ?? 'User'} className="h-14 w-14 rounded-full" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/20" />
          )}
          <div>
            <p className="font-medium">{session?.user?.name ?? 'Loading...'}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected accounts</CardTitle>
          <CardDescription>Accounts linked for sign-in and repository access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <Github size={20} />
              <span className="text-sm">GitHub</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-success">
              <Check size={14} /> Connected
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between rounded-md border border-border p-3 ${!n.readAt ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-2">
                <Bell size={14} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                </div>
              </div>
              {!n.readAt && (
                <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut size={16} /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
