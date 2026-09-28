# Contributing to Codentra

## Getting Started

See the [README](./README.md) for local setup, and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the system design before making changes.

## Workflow

1. Fork and branch from `main` (`feat/short-description` or `fix/short-description`).
2. Make your change. Follow the existing module structure — see an existing module under `apps/backend/src/modules/` as a template (controller/service/module/dto).
3. Run `pnpm lint && pnpm typecheck && pnpm test` before opening a PR — CI enforces all three.
4. Open a PR against `main`. CI must pass before merge.

## Code Style

- TypeScript strict mode is on everywhere — don't add `any` without a comment explaining why.
- Follow the Clean Architecture layering already in place: controllers stay thin, business logic lives in services, data access goes through Prisma via services (never raw SQL without a specific reason).
- New backend modules follow the existing pattern: `module-name/module-name.controller.ts`, `.service.ts`, `.module.ts`, `dto/`.

## Commit Messages

Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `docs(scope): ...`.

## Reporting Issues

Use the issue templates under `.github/ISSUE_TEMPLATE/`. Include repro steps for bugs.
