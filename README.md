# Codentra

> Distributed code analysis engine, automated review workspace, and developer tooling platform built as a high-performance TypeScript monorepo.

[![CI Status](https://github.com/ErSHAAD-code/codentra/actions/workflows/ci.yml/badge.svg)](https://github.com/ErSHAAD-code/codentra/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-critical)](https://bullmq.io/)

---

## Overview

**Codentra** is an end-to-end code analysis platform designed to inspect codebases for architectural flaws, security vulnerabilities, code smells, and performance bottlenecks. It supports both remote GitHub repository analysis via OAuth/webhooks and local ZIP package ingestion.

The platform provides a browser-based Monaco code intelligence environment, enabling developers to review AI-annotated diffs, browse dependency trees, inspect severity-ranked diagnostic reports, and directly execute refactor suggestions within the browser.

---

## System Architecture

Codentra uses an event-driven decoupled architecture optimized for throughput and asynchronous CPU-intensive workloads:

```
                          ┌──────────────────────────┐
                          │  Next.js 15 (App Router) │
                          │  Client & React 19 UI    │
                          └─────────────┬────────────┘
                                        │ REST / SSE
                                        ▼
                          ┌──────────────────────────┐
                          │  NestJS Core API Gateway │
                          │  Auth, RBAC, Repos, DTOs │
                          └──────┬─────────────┬─────┘
                                 │             │
                Prisma ORM Queries             │ BullMQ Job Dispatch
                                 │             │
                                 ▼             ▼
                    ┌──────────────────┐  ┌──────────────────┐
                    │  PostgreSQL 16   │  │   Redis 7 Cache  │
                    │  Relational Data │  │   & Message Bus  │
                    └──────────────────┘  └────────┬─────────┘
                                                   │
                                                   │ Job Consumer
                                                   ▼
                                          ┌──────────────────┐
                                          │ Background Worker│
                                          │ Ingestion, AST,  │
                                          │ AI Rule Engine   │
                                          └──────────────────┘
```

### Core Architecture Components

1. **Frontend (`apps/frontend`)**: Next.js 15 App Router application with React 19, Tailwind CSS, Radix UI primitives, Framer Motion, and Monaco Editor. Implements client-side stream decoding for real-time analysis updates.
2. **Backend Gateway (`apps/backend`)**: NestJS 10 modular API providing JWT and GitHub OAuth session handling, Prisma ORM persistence, Throttler rate limiting, and BullMQ queue dispatching.
3. **Background Worker (`apps/worker`)**: Standalone BullMQ consumer node that processes asynchronous repository downloads, archive unzipping, AST parsing, language classification, and LLM inference pipelines.
4. **Shared Packages (`packages/*`)**:
   - `@codentra/shared-types`: Unified TypeScript interfaces and DTOs shared across API boundaries.
   - `@codentra/shared-ui`: Design system components and design tokens.
   - `@codentra/eslint-config` & `@codentra/ts-config`: Shared linter and compiler configs.

---

## Key Technical Decisions & Engineering Trade-offs

- **Decoupled Worker vs API Monolith**: Parsing large repositories and streaming AI responses can easily saturate the Node.js event loop. Delegating extraction, AST tokenization, and third-party AI provider calls to a separate BullMQ worker pool prevents HTTP request starvation on the primary API.
- **Monorepo with Turborepo & pnpm**: Enables atomic commits across schema definitions, frontend components, and backend endpoints while sharing validation logic and TypeScript types with zero build duplication.
- **SSE (Server-Sent Events) for Streaming**: Chosen over WebSockets for one-way AI token streaming and analysis progress notifications, simplifying proxy traversal and reducing connection state overhead.
- **Prisma with PostgreSQL Connection Pooling**: Enforces strict relational integrity across organizations, projects, repositories, findings, and audit logs while optimizing connection reuse in multi-container setups.

---

## Monorepo Directory Structure

```
codentra/
├── apps/
│   ├── frontend/                   # Next.js 15 web client & Monaco editor workspace
│   │   ├── src/app/                # App router routes (marketing, dashboard, explorer)
│   │   ├── src/components/         # Feature components (editor, dashboard, marketing, UI)
│   │   └── src/lib/                # Auth.js setup, API client, utilities
│   ├── backend/                    # NestJS API application
│   │   ├── prisma/                 # Schema definitions, migrations, and seeds
│   │   └── src/modules/            # Feature modules (auth, analysis, github, repos, chat)
│   └── worker/                     # Asynchronous job processor
│       └── src/processors/         # BullMQ queue handlers for repo extraction & parsing
├── packages/
│   ├── shared-types/               # TypeScript domain contracts & DTO types
│   ├── shared-ui/                  # UI component library
│   ├── ts-config/                  # Base tsconfig configurations
│   └── eslint-config/              # Shared ESLint ruleset
├── docker/                         # Multi-stage Dockerfiles and docker-compose orchestration
├── turbo.json                      # Turborepo task pipeline configuration
└── pnpm-workspace.yaml             # Workspace definition
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher
- **Docker & Docker Compose**: for local PostgreSQL and Redis instances

### 1. Clone and Install

```bash
git clone https://github.com/ErSHAAD-code/codentra.git
cd codentra
pnpm install
```

### 2. Configure Environment

Copy the example environment configuration:

```bash
cp .env.example .env
```

Set the required environment variables in `.env`:

```ini
# PostgreSQL
DATABASE_URL="postgresql://codentra:codentra_dev_password@localhost:5432/codentra"

# Redis
REDIS_URL="redis://localhost:6379"

# API & Web App Ports
BACKEND_PORT=4000
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication
AUTH_SECRET="your-32-character-secret"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"

# AI Provider
OPENROUTER_API_KEY="your-api-key"
```

### 3. Spin Up Infrastructure

Start PostgreSQL and Redis services using Docker Compose:

```bash
docker compose -f docker/docker-compose.yml --env-file .env up -d postgres redis
```

### 4. Database Setup & Seed

Run migrations and generate the Prisma Client:

```bash
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

### 5. Run Development Servers

Start all monorepo applications in parallel using Turborepo:

```bash
pnpm dev
```

The services will be accessible at:
- **Web Client**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## Verification & Testing

The repository includes a comprehensive testing and validation suite:

```bash
# Typecheck across all workspace packages
pnpm typecheck

# Lint codebase with ESLint
pnpm lint

# Run Jest unit & integration tests
pnpm test

# Run Playwright E2E smoke tests
pnpm --filter frontend test:e2e
```

---

## Deployment & Production Build

Production builds are managed via multi-stage Docker builds:

```bash
# Build frontend container
docker build -f docker/Dockerfile.frontend -t codentra-frontend:latest .

# Build backend API container
docker build -f docker/Dockerfile.backend -t codentra-backend:latest .

# Build worker container
docker build -f docker/Dockerfile.worker -t codentra-worker:latest .
```

---

## Author & Maintainer

**Md Shaad** — [GitHub](https://github.com/ErSHAAD-code) • [LinkedIn](https://linkedin.com)

---

## License

This project is licensed under the [MIT License](LICENSE).
