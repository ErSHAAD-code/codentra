import { PrismaClient, FindingCategory, FindingSeverity } from '@prisma/client';

import { callClaude } from '../ai/claude-client';
import { buildReviewPrompt, REVIEW_SYSTEM_PROMPT } from '../ai/review-prompts';
import { AnalysisJob } from '../types';

// Reviewing every file with an LLM call doesn't scale for large repos —
// cap files per run and skip trivial ones. Real prioritization (changed
// files, complexity heuristics) is a Phase 8 performance concern; this
// cap keeps the pipeline correct and bounded in cost/time for now.
const MAX_FILES_PER_ANALYSIS = 20;
const MIN_LINE_COUNT_TO_REVIEW = 3;

interface RawFinding {
  category: string;
  severity: string;
  lineStart: number | null;
  lineEnd: number | null;
  title: string;
  description: string;
  suggestedFix: string;
}

const SEVERITY_WEIGHT: Record<FindingSeverity, number> = {
  CRITICAL: 25,
  HIGH: 12,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0,
};

export async function processAnalysis(prisma: PrismaClient, job: AnalysisJob): Promise<void> {
  const { analysisId, repositoryId } = job;

  try {
    await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'RUNNING', startedAt: new Date() } });

    const files = await prisma.repositoryFile.findMany({
      where: { repositoryId, lineCount: { gte: MIN_LINE_COUNT_TO_REVIEW }, content: { not: null } },
      orderBy: { lineCount: 'desc' }, // review the most substantial files first within the cap
      take: MAX_FILES_PER_ANALYSIS,
    });

    for (const file of files) {
      const raw = await callClaude(REVIEW_SYSTEM_PROMPT, buildReviewPrompt(file.path, file.content ?? ''));
      const findings = parseFindings(raw);

      for (const finding of findings) {
        await prisma.finding.create({
          data: {
            analysisId,
            filePath: file.path,
            lineStart: finding.lineStart ?? undefined,
            lineEnd: finding.lineEnd ?? undefined,
            category: finding.category as FindingCategory,
            severity: finding.severity as FindingSeverity,
            source: 'AI',
            title: finding.title,
            description: finding.description,
            suggestedFix: finding.suggestedFix,
          },
        });
      }
    }

    const scores = await computeScores(prisma, analysisId);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'COMPLETED', completedAt: new Date(), ...scores },
    });
  } catch (error) {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/** Best-effort JSON parse — the prompt enforces a strict schema, but LLM
 * output is never trusted blindly. Malformed responses degrade to zero
 * findings for that file rather than crashing the whole analysis. */
export function parseFindings(raw: string): RawFinding[] {
  try {
    const cleaned = raw.trim().replace(/^```json\n?/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed.findings) ? parsed.findings : [];
  } catch {
    return [];
  }
}

/** Score = 100 minus weighted deductions per finding severity, floored at 0.
 * Simple and explainable — a defensible v1 that's easy to justify in an
 * interview, versus an opaque ML-scored metric with no clear rationale. */
async function computeScores(prisma: PrismaClient, analysisId: string) {
  const findings = await prisma.finding.findMany({ where: { analysisId } });

  const deduct = (category?: string) =>
    findings
      .filter((f: any) => !category || f.category === category)
      .reduce((sum: number, f: any) => sum + (SEVERITY_WEIGHT[f.severity as FindingSeverity] ?? 0), 0);

  const clamp = (score: number) => Math.max(0, Math.min(100, score));

  return {
    overallScore: clamp(100 - deduct()),
    securityScore: clamp(100 - deduct('SECURITY')),
    performanceScore: clamp(100 - deduct('PERFORMANCE')),
    maintainabilityScore: clamp(100 - deduct('CODE_SMELL')),
    complexityScore: clamp(100 - deduct('ARCHITECTURE')),
  };
}
