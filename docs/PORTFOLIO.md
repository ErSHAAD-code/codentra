# Codentra — Portfolio Presentation Guide

This document is deliberately honest about what's built versus what's designed-but-not-built. Claiming more than what exists is the fastest way to lose credibility in a technical interview — everything below is accurate as of this writing.

---

## Recruiter Pitch (30 seconds)

Codentra is an AI code intelligence platform — think "automated senior engineer doing your code review." Upload a repository or connect GitHub, and it runs a hybrid static-analysis-plus-LLM pipeline that finds bugs, security vulnerabilities, and quality issues, then explains each one with a suggested fix and an explainable 0–100 quality score. It's built as a real, multi-tenant SaaS architecture — separate API and worker services, async job processing, RBAC, GitHub OAuth and webhook integration — not a single-file demo.

## Technical Overview

**Architecture:** Modular monolith (not microservices — a deliberate choice, defensible on its own) split into three independently deployable services: a Next.js frontend, a NestJS API, and a BullMQ-backed worker for async processing (repository parsing, AI analysis). PostgreSQL via Prisma, Redis for queues and caching.

**The core engineering idea:** deterministic static analysis and AI review are treated as separate concerns — static tools catch what they're good at (syntax, known patterns), AI is reserved for judgment calls. The AI provider itself sits behind an interface (`AIProvider`), so Claude can be swapped for another model without touching business logic.

## Tech Stack Summary

Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui-pattern components · NestJS, Prisma, PostgreSQL, Redis, BullMQ · Auth.js (GitHub OAuth, server-side sessions) · Anthropic Claude API · Docker (multi-stage builds, three services) · GitHub Actions (CI + approval-gated deploy) · Jest + Playwright.

## What's Actually Built (be ready to demo exactly this)

- End-to-end repository ingestion: ZIP upload or GitHub import → background parsing → language detection → structured AI context.
- Async AI code review producing categorized, severity-ranked findings with suggested fixes and five 0–100 scores.
- Repository-scoped AI chat with streaming responses.
- Nine AI productivity features (README/test/doc generation, code/architecture/SQL/algorithm explainers, debugging, refactoring, commit messages, diagrams).
- 7-role RBAC with a real permission matrix, invitations, notifications.
- GitHub OAuth login, repository import, HMAC-verified push webhooks triggering re-sync.
- Structured logging, health checks, caching, pagination, a working CI/CD pipeline with an approval gate.
- Real (if partial) automated test coverage — not zero, not claimed-but-absent.

## Known Limitations (say these before an interviewer finds them)

- **Never deployed to a live URL.** Built and packaged, but not run against a live Postgres/Redis in a hosted environment — first deploy will likely surface a handful of runtime issues (dependency version mismatches, Prisma edge cases) that static review can't catch.
- **Frontend UI is incomplete.** RBAC, GitHub import, and AI productivity are real, working APIs — but most don't have UI yet beyond the landing page, dashboard shell, and analysis results page.
- **No integration or load testing.** Unit tests cover pure logic (parsing, validation, RBAC); nothing yet exercises the database or a live LLM call in CI.
- **Code parsing is regex-based, not AST-based.** A documented, deliberate trade-off (see code comments) — accurate for common patterns, not as precise as tree-sitter would be.
- **Analysis is capped at 20 files per run**, largest-first — doesn't scale to very large repos yet; real prioritization (diff-aware, changed-files-only) isn't built.
- **Single global rate-limit tier** — AI-calling endpoints should realistically be stricter than CRUD endpoints, not yet split out.

## Engineering Decisions Worth Discussing in an Interview

1. **Why a modular monolith, not microservices** — no measured load justifies the operational overhead yet; the API/worker split already isolates the one thing that actually needs independent scaling (AI job processing).
2. **Why the multi-tenant schema was designed before RBAC enforcement existed** — every table was scoped under `Organization` from the first migration, so adding permission enforcement in Phase 4 was additive, not a schema migration.
3. **Why static analysis and AI are separate passes, not AI-does-everything** — cost, latency, and reliability: deterministic checks shouldn't depend on a probabilistic model.
4. **Why session-based auth over pure JWT** — server-side revocation matters for a tool with access to source code; a compromised JWT can't be invalidated before expiry, a compromised session can.
5. **The one real bug caught mid-build** — a `str_replace`-style schema edit once silently dropped a model declaration line. It was caught via a brace-balance check before generating a migration from it, not after. Good story about verifying structural integrity after edits rather than trusting that "the edit succeeded" means "the result is correct."

## STAR-Format Story (the schema bug, as one example)

- **Situation:** Mid-way through adding new database models to a growing Prisma schema file via targeted text edits.
- **Task:** Keep the schema valid while making incremental additions across many separate changes.
- **Action:** After a schema edit, ran a quick brace-balance check before generating a migration from it — caught that an edit had silently deleted a model's declaration line, leaving orphaned fields.
- **Result:** Fixed before it could produce a broken migration or corrupt state; the practice of verifying structural integrity after edits (not just assuming success) became standard for the rest of the build.

## Resume Bullet Points

- **Architected and built Codentra**, a multi-tenant AI code-review SaaS platform (Next.js, NestJS, PostgreSQL, Redis, BullMQ), with independently deployable API and worker services for async AI processing.
- **Designed a hybrid static-analysis-plus-LLM review pipeline** producing categorized, severity-ranked findings and explainable quality scores, using structured-JSON-output prompting to keep AI responses machine-parseable.
- **Implemented a provider-agnostic AI abstraction** enabling model swaps (Claude/OpenAI/local) without touching business logic, plus 9 AI-powered developer productivity tools (test/doc generation, code explanation, refactoring, debugging).
- **Built a 7-role RBAC system** with a centralized permission matrix, invitation lifecycle, and organization/workspace multi-tenancy designed for permission enforcement from the first schema migration.
- **Integrated GitHub OAuth, repository import, and HMAC-verified webhooks**, reusing a single parsing pipeline across ZIP upload and GitHub tarball ingestion paths.
- **Set up CI/CD with GitHub Actions**: automated lint/typecheck/test/security-audit gates, and an approval-gated, SHA-tagged deployment pipeline with documented rollback strategy.

## Interview Q&A Prep

**"Why not microservices?"** — No measured scaling need justifies the operational cost yet. The one thing that genuinely benefits from independent scaling (AI job processing) is already split into its own worker service; further splitting would be premature.

**"How do you know the AI's output is reliable?"** — It isn't fully verified end-to-end yet, honestly — that's the biggest gap. The design defends against the failure modes I can control: structured-JSON-output prompting instead of free text, defensive parsing that degrades to zero findings on malformed output rather than crashing, and static analysis catching what doesn't need probabilistic judgment. Measuring actual AI accuracy against ground truth is unbuilt.

**"What would you build next?"** — Integration tests against a real database, then finish the frontend UI for the RBAC/GitHub/AI-productivity APIs that currently only exist server-side, then an actual deployment.

**"What's the hardest part of this project?"** — Keeping a fast-moving multi-phase build architecturally consistent — making sure phase 6 didn't silently break assumptions phase 2 made. That's why the schema is additive by design and why a structural-integrity check caught a real bug before it became a broken migration.
