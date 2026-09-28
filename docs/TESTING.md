# Codentra — Testing Guide

## Testing Pyramid

Codentra follows a standard pyramid: many fast unit tests at the base, fewer integration tests, and a thin layer of E2E tests at the top — because unit tests are cheap to write and run, and E2E tests are expensive (slow, flaky, need real infrastructure) but catch what unit tests can't (real user flows across the whole stack).

| Layer | Tool | What it verifies |
|---|---|---|
| Unit | Jest + ts-jest | Pure functions and isolated logic — no DB, no network |
| Integration | Jest + a real test DB (not yet implemented — see below) | Service-to-database behavior, transactions |
| E2E | Playwright | Real user journeys through the actual running app |

## What's Actually Covered Right Now

**Unit tests (real, run in CI):**
- `apps/backend`: RBAC permission matrix, `slugify`, language detection (extension mapping + multi-language summarization + framework detection), the regex-based code parser (JS/TS/Python), upload validation (size limits, extension allowlist, path-traversal sanitization).
- `apps/worker`: AI findings JSON parsing (including malformed-response handling), the worker's language map.
- `apps/frontend`: the `cn()` className utility.

**E2E tests (real, run in CI against a built frontend):**
- Landing page renders and navigation works.
- Unauthenticated users are redirected away from `/dashboard`.
- Login page renders the GitHub sign-in option.

**What's honestly NOT covered:**
- **Integration tests against a real database** — every service method that touches Prisma (`ProjectsService`, `RepositoriesService`, `AnalysisService`, etc.) is untested at the integration level. This is the biggest real gap. Writing these requires a test-database strategy (a dedicated `DATABASE_URL` in CI, transactional rollback per test, or `testcontainers`) that wasn't set up in this pass.
- **Full user-journey E2E tests** — upload → AI analysis → review results, GitHub import → sync, invite → accept. These need seeded test data and a live `ANTHROPIC_API_KEY`, which isn't wired into CI.
- **Load testing, chaos testing, accessibility testing (axe-core), and security penetration testing** — none of these are implemented. They're real engineering work, not something to claim as "done" without the actual scripts/tools in the repo.

## Running Tests

```bash
# Unit tests, per app
pnpm --filter backend test
pnpm --filter worker test
pnpm --filter frontend test

# All unit tests
pnpm test

# Coverage
pnpm --filter backend test -- --coverage

# E2E (starts the dev server automatically)
pnpm --filter frontend test:e2e
```

## CI Quality Gates

`.github/workflows/ci.yml` fails the build if: lint fails, typecheck fails, the build fails, or any unit test fails. `pnpm audit --audit-level=critical` runs but currently only warns rather than blocking — tightening that to a hard failure is a reasonable next step once the dependency tree is stable enough not to block on transitive advisories you can't immediately fix.

## Recommended Next Steps (not yet done)

1. Add `testcontainers` (or a dedicated CI Postgres/Redis, which already exist as service containers in CI) and write integration tests for each service's Prisma-touching methods.
2. Seed a fixture GitHub repo and Anthropic test key (or mock the AI provider) to write real upload→analysis E2E coverage.
3. Add `axe-playwright` for automated accessibility assertions on key pages.
4. Add k6 or Artillery for load testing once there's a deployed environment to point it at.
