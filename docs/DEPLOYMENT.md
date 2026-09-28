# Codentra — Deployment Guide

## Local Development

```bash
pnpm install
cp .env.example .env   # fill in AUTH_SECRET, GitHub OAuth app credentials, ANTHROPIC_API_KEY
docker compose -f docker/docker-compose.yml --env-file .env up -d
pnpm --filter backend prisma:migrate
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1
- Readiness check: http://localhost:4000/api/v1/health/ready

## Staging / Production

Codentra deploys as three independent services, matching the architecture decided in Phase 0 (separate web/API/worker tiers):

| Service | Recommended host | Why |
|---|---|---|
| `apps/frontend` | Vercel | Native Next.js support, edge caching, zero-config previews per PR |
| `apps/backend` | Railway / Render / Fly.io | Needs a persistent process (not serverless-friendly due to BullMQ connections) |
| `apps/worker` | Same as backend | Needs to stay running continuously to process the queue |
| Postgres | Neon / Supabase / Railway managed Postgres | Managed backups, connection pooling |
| Redis | Railway / Upstash | Managed, low-latency to the backend/worker |

### Steps

1. Provision managed Postgres and Redis; copy their connection strings.
2. Set environment variables on each service host using `.env.production.example` as the checklist — never commit real values.
3. Create a GitHub OAuth App (and, for webhooks, note the callback/webhook URLs) pointing at your production domain.
4. Run `pnpm --filter backend prisma:deploy` (uses `migrate deploy`, not `migrate dev` — no interactive prompts, safe for CI/CD) against the production database once, before first deploy.
5. Push to `main` — `.github/workflows/deploy.yml` builds and pushes Docker images to GHCR automatically. The `deploy-production` job is gated behind a GitHub Environment approval (configure under repo Settings → Environments → production) so nothing reaches production without a manual click.
6. Wire your host's deploy hook into the `deploy-production` job (currently a placeholder — the exact call is host-specific).

### Rollback

Every image is tagged with the commit SHA (`ghcr.io/.../backend:<sha>`), not just `latest`. To roll back: redeploy the previous SHA's image on your host, and if the rollback crosses a migration, run the corresponding `prisma migrate resolve` against the down migration before redeploying.

### Health checks for your platform's load balancer

- Liveness: `GET /api/v1/health/live` — process is up, restart if this fails.
- Readiness: `GET /api/v1/health/ready` — dependencies (DB, Redis, AI provider key present) are reachable; route traffic only if this passes.
