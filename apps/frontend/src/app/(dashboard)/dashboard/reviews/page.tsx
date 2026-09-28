'use client';

import { Bug, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { apiJson } from '@/lib/api';

interface Review {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  overallScore: number | null;
  createdAt: string;
  repository: { id: string; name: string };
  _count: { findings: number };
}

const STATUS_VARIANT: Record<Review['status'], 'default' | 'warning' | 'success' | 'danger'> = {
  QUEUED: 'default',
  RUNNING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
};

function scoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    apiJson<Review[]>('/reviews')
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">AI code reviews across all your repositories.</p>
      </div>

      {reviews === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No reviews yet"
          description="Run an AI analysis from a repository's page to see results here."
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Link key={review.id} href={`/dashboard/repositories/${review.repository.id}/analysis/${review.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-semibold ${scoreColor(review.overallScore)}`}>
                      {review.overallScore ?? '—'}
                    </div>
                    <div>
                      <p className="font-medium">{review.repository.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review._count.findings} findings · {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[review.status]}>{review.status}</Badge>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
