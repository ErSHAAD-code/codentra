import { Github } from 'lucide-react';

import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign in to Codentra</CardTitle>
          <CardDescription>Connect your GitHub account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: '/dashboard' });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <Github size={18} /> Continue with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
