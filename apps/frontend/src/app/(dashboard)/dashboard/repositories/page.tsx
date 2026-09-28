'use client';

import { motion } from 'framer-motion';
import { FolderGit2, Upload, GitBranch, Terminal, Shield, FileArchive, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch, apiJson } from '@/lib/api';
import { GithubImport } from '@/components/dashboard/github-import';

interface Repository {
  id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED';
  type: string;
  updatedAt: string;
}

const STATUS_VARIANT: Record<Repository['status'], 'default' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  READY: 'success',
  FAILED: 'danger',
  ARCHIVED: 'default',
};

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRepositories = async () => {
    try {
      const repos = await apiJson<Repository[]>('/repositories/mine');
      setRepositories(repos);
      return repos;
    } catch (e) {
      console.error(e);
      setRepositories([]);
      return [];
    }
  };

  useEffect(() => {
    loadRepositories();

    // Poll while any repo is still PENDING/PROCESSING
    pollRef.current = setInterval(() => {
      setRepositories((current) => {
        const hasActive = current?.some((r) => r.status === 'PENDING' || r.status === 'PROCESSING');
        if (hasActive) loadRepositories().catch(() => {});
        return current;
      });
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelected = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const repo = await apiJson<Repository>('/repositories/new', {
        method: 'POST',
        body: JSON.stringify({ name: file.name.replace(/\.zip$/i, '') }),
      });

      const formData = new FormData();
      formData.append('file', file);

      await apiFetch(`/repositories/${repo.id}/uploads?kind=zip`, {
        method: 'POST',
        body: formData,
      });

      await loadRepositories();
    } catch (err: any) {
      console.warn('Upload failed:', err.message);
      // Graceful error handling instead of unhandled rejection
      setError(err.message || 'Failed to connect to the API. Make sure the backend server is running.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Repositories</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Import your code to start an AI review. We support direct GitHub integration and manual ZIP uploads.
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-lg bg-danger/15 border border-danger/30 p-4 text-sm text-danger-foreground flex items-center gap-3 shadow-glow-sm"
        >
          <Shield className="text-danger flex-shrink-0" size={18} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        
        {/* Main Column - Import and Repositories */}
        <div className="space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GithubImport />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderGit2 size={18} className="text-primary" /> Active Repositories
            </h2>

            {repositories === null ? (
              <div className="h-32 flex items-center justify-center border border-border/50 rounded-xl bg-card/20">
                <p className="text-sm text-muted-foreground animate-pulse">Loading repositories...</p>
              </div>
            ) : repositories.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                title="No active repositories"
                description="Import a repository from GitHub above, or use the manual upload option."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {repositories.map((repo) => (
                  <Link key={repo.id} href={`/dashboard/repositories/${repo.id}`}>
                    <Card className="transition-all hover:border-primary/50 hover:shadow-glow-sm group bg-card/40 backdrop-blur-sm h-full border-border/60">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FolderGit2 className="text-primary" size={18} />
                          </div>
                          <Badge variant={STATUS_VARIANT[repo.status]} className="text-[10px] uppercase tracking-wider">
                            {repo.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{repo.name}</h3>
                        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-success/60"></span>
                          Updated {new Date(repo.updatedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Alternate Upload Methods & Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-border/60 bg-card/40 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileArchive size={16} className="text-secondary" />
                  Manual Upload
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload a ZIP file containing your source code directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="w-full gap-2 gradient-brand shadow-glow-sm hover:shadow-glow transition-all"
                >
                  {uploading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Upload size={16} />
                    </motion.div>
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploading ? 'Uploading ZIP...' : 'Upload .ZIP Archive'}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  Max file size: 50MB. Exclude node_modules for best results.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-primary flex items-center gap-2">
                  <Terminal size={14} />
                  CLI Integration
                </CardTitle>
                <CardDescription className="text-xs text-foreground/70">
                  Prefer the terminal? Run Codentra locally before pushing to GitHub.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <code className="block rounded bg-background p-3 text-xs font-mono text-muted-foreground border border-border/50">
                    <span className="text-primary">$</span> npx codentra init<br/>
                    <span className="text-primary">$</span> codentra scan
                  </code>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent border-primary/30 hover:bg-primary/10">
                    View CLI Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
