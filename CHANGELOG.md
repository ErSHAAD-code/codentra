# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Phase 1 — Foundation:** Turborepo monorepo, Docker Compose dev environment, multi-tenant Prisma schema, NestJS API skeleton, Next.js frontend with design system, landing page, dashboard shell, Auth.js session-based authentication (GitHub OAuth).
- **Phase 2 — Repository Intelligence Engine:** ZIP/single-file upload with validation, BullMQ background processing worker, regex-based multi-language parser, language detection, AI Context Engine, repository-scoped AI chat with SSE streaming.
- **Phase 3 — AI Review Engine:** Async AI code review pipeline (bugs, security, code smells, performance, architecture), structured-JSON-output prompting, explainable 0–100 quality scoring, findings dashboard.
- **Phase 4 — Enterprise/RBAC:** 7-role permission matrix, invitation lifecycle, member management, notifications.
- **Phase 5 — GitHub Integration:** Repository import via GitHub API, tarball-based sync reusing the Phase 2 pipeline, HMAC-verified push webhooks.
- **Phase 6 — AI Productivity:** README/docs/test generation, code/architecture/SQL/algorithm explainers, debugging assistant, refactoring suggestions, commit message generation, Mermaid diagram generation.
- **Phase 7 — DevOps:** Structured JSON logging with request IDs, liveness/readiness health checks, CSP + compression, staging/production env templates, CI security audit, approval-gated deploy pipeline with SHA-tagged rollback.
- **Phase 8 — Performance:** Redis caching (get-or-set with invalidation), cursor pagination, command palette (⌘K), OG/Twitter metadata, sitemap/robots.
- **Phase 9 — Testing:** Unit test coverage for RBAC, parsing, language detection, upload validation, and AI-response parsing; Playwright E2E smoke tests; CI quality gates.
- **Phase 10 — Release Prep:** Open-source repository files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY), portfolio documentation.

### Known Limitations
See [`docs/PORTFOLIO.md`](./docs/PORTFOLIO.md) — documented honestly rather than omitted.

## [0.1.0] — Unreleased

Initial development. Not yet deployed to a public production environment.
