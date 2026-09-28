import { cookies } from 'next/headers';

import { ScoreCard } from '@/components/dashboard/score-card';
import { SeverityBadge } from '@/components/dashboard/severity-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Finding {
  id: string;
  filePath: string;
  lineStart: number | null;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  suggestedFix: string | null;
}

interface AnalysisResult {
  id: string;
  status: string;
  overallScore: number | null;
  securityScore: number | null;
  performanceScore: number | null;
  maintainabilityScore: number | null;
  complexityScore: number | null;
  findings: Finding[];
}

async function fetchAnalysis(analysisId: string): Promise<AnalysisResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('codentra.session-token')?.value;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyses/${analysisId}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to load analysis');
  return response.json();
}

export default async function AnalysisResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
  const { analysisId } = await params;
  const analysis = await fetchAnalysis(analysisId);

  if (analysis.status !== 'COMPLETED') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Analysis is {analysis.status.toLowerCase()}... this page will show results once it completes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <ScoreCard label="Overall" score={analysis.overallScore} />
        <ScoreCard label="Security" score={analysis.securityScore} />
        <ScoreCard label="Performance" score={analysis.performanceScore} />
        <ScoreCard label="Maintainability" score={analysis.maintainabilityScore} />
        <ScoreCard label="Architecture" score={analysis.complexityScore} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Findings ({analysis.findings.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.findings.map((finding) => (
            <div key={finding.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <Badge>{finding.category}</Badge>
                <span className="text-sm font-medium">{finding.title}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{finding.description}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {finding.filePath}
                {finding.lineStart ? `:${finding.lineStart}` : ''}
              </p>
              {finding.suggestedFix && (
                <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">{finding.suggestedFix}</pre>
              )}
            </div>
          ))}
          {analysis.findings.length === 0 && (
            <p className="text-sm text-muted-foreground">No issues found. Clean pass.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
