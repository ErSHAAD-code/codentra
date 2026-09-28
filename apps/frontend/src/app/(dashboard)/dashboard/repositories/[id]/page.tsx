'use client';

import { FileCode, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiJson } from '@/lib/api';

interface RepoFile {
  id: string;
  path: string;
  language: string;
  lineCount: number;
}

interface Repository {
  id: string;
  name: string;
  status: string;
}

export default function RepositoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    apiJson<Repository>(`/repositories/${id}`).then(setRepository);
    apiJson<{ files: RepoFile[] }>(`/repositories/${id}/tree`)
      .then((tree) => setFiles(tree.files))
      .catch(() => setFiles([]));
  }, [id]);

  const runAnalysis = async () => {
    setTriggering(true);
    try {
      const analysis = await apiJson<{ id: string }>(`/repositories/${id}/analyze`, { method: 'POST' });
      // Analysis runs async in the background worker — jump to the results
      // page now; it shows a "still running" state until findings land.
      router.push(`/dashboard/repositories/${id}/analysis/${analysis.id}`);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{repository?.name ?? 'Loading...'}</h1>
          {repository && <Badge className="mt-1">{repository.status}</Badge>}
        </div>
        <Button onClick={runAnalysis} disabled={triggering || repository?.status !== 'READY'}>
          <Play size={16} /> {triggering ? 'Starting...' : 'Run AI Analysis'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {files.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {repository?.status === 'PROCESSING' ? 'Still parsing...' : 'No files found.'}
            </p>
          )}
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
              <FileCode size={14} className="text-muted-foreground" />
              <span className="font-mono">{file.path}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {file.language} · {file.lineCount} lines
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
