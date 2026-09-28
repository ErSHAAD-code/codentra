import { cn } from '@/lib/utils';

function scoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
}

export function ScoreCard({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <div className={cn('text-3xl font-semibold', scoreColor(score))}>{score ?? '—'}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
