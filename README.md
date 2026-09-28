<div align="center">

# Codentra

**Enterprise-Grade AI Code Intelligence Platform & Distributed Review Engine**

A modern, high-throughput monorepo engineered with Next.js 15, NestJS 10, BullMQ, Redis, PostgreSQL, and Monaco Editor. Codentra automates static analysis, AST tokenization, vulnerability scanning, and real-time AI-assisted refactoring for complex software repositories.

<br/>

[![CI Pipeline](https://github.com/ErSHAAD-code/codentra/actions/workflows/ci.yml/badge.svg)](https://github.com/ErSHAAD-code/codentra/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.4-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.18-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.12-FF5722?style=flat-square)](https://bullmq.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.1-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

[Key Features](#-key-features) •
[System Architecture](#-system-architecture) •
[Data Flow Lifecycle](#-data-flow-lifecycle) •
[Repository Structure](#-repository-structure) •
[Database Schema](#-database-schema--domain-model) •
[Getting Started](#-getting-started) •
[API Reference](#-api-specification) •
[Engineering Trade-offs](#-engineering-trade-offs--design-decisions)

</div>

---

## 📌 Overview

**Codentra** is designed to solve the bottlenecks of manual code reviews and complex codebase comprehension. By uniting deterministic static parsing with multi-model LLM reasoning (Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro), Codentra delivers deep, contextual diagnostics across 5 explainable quality dimensions: **Security**, **Reliability**, **Maintainability**, **Performance**, and **Code Style**.

### Highlights
- **Distributed Job Offloading:** Large repository ingestion and file parsing are offloaded from the web tier into a dedicated BullMQ/Redis worker cluster, preventing Node.js event-loop starvation.
- **In-Browser Monaco Workspace:** A full IDE experience inside the browser featuring syntax highlighting for 20+ languages, file tree navigation, multi-tab editing, inline diff inspectors, and an AI chat sidecar.
- **Real-Time Streaming Engine:** Uses Server-Sent Events (SSE) and HTTP stream readers for live AI token generation and instant analysis progress updates.
- **Strict Monorepo Type Safety:** Unified TypeScript DTOs and contracts shared across `@codentra/shared-types`, the frontend client, and the backend gateway.

---

## ⚡ Key Features

| Capability | Technical Implementation | Highlights |
| :--- | :--- | :--- |
| **Repository Ingestion** | Tarball stream decompression & ZIP archive extraction | Supports GitHub OAuth import via REST API and direct drag-and-drop archive uploads. |
| **AST Parsing & Mapping** | Custom regex tokenizer & language detection matrix | Categorizes source code by language, resolves file hierarchies, and filters noise (`node_modules`, binaries). |
| **Explainable Scoring** | Multi-dimensional evaluation algorithms | Computes granular scores (0–100) per file and repository, classifying findings by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`). |
| **Autonomous AI Agent** | Task planning, patch generation, validation pipeline | Executes multi-step refactor plans, checks file diffs, and validates changes against syntax constraints. |
| **Repository Chat** | Context-augmented LLM prompt assembly | Natural language querying over repository structures, function signatures, and security vulnerabilities. |
| **GitHub Explorer** | Octokit REST API wrapper with caching | Live exploration of public GitHub users, organizations, branches, and remote file trees without local cloning. |

---

## 🏗 System Architecture

Codentra employs a decoupled, event-driven micro-service monorepo architecture. 

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENT LAYER (Browser)                │
                                  │                                                        │
                                  │   Next.js 15 (App Router) • React 19 • Monaco Editor   │
                                  │   TanStack Query • Zustand • Tailwind CSS • Lenis      │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                  REST API / SSE Streams
                                                              │
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │                API GATEWAY LAYER (NestJS 10)           │
                                  │                                                        │
                                  │  • Auth Module (Auth.js / JWT Session Validation)      │
                                  │  • Repositories & Uploads Controllers                  │
                                  │  • AI Provider Abstraction (Claude / OpenAI / Gemini)   │
                                  │  • Throttler Rate Limiting & Helmet Security Guards    │
                                  └─────────────┬──────────────────────────┬───────────────┘
                                                │                          │
                                   Prisma ORM Queries             BullMQ Job Dispatch
                                                │                          │
                                                ▼                          ▼
                                  ┌───────────────────────────┐  ┌─────────────────────────┐
                                  │       DATABASE LAYER      │  │     MESSAGE BROKER      │
                                  │                           │  │                         │
                                  │       PostgreSQL 16       │  │         Redis 7         │
                                  │   (Relational Entities)   │  │    (BullMQ Job State)   │
                                  └───────────────────────────┘  └─────────────┬───────────┘
                                                                               │
                                                                         Job Subscription
                                                                               │
                                                                               ▼
                                                                 ┌─────────────────────────┐
                                                                 │   WORKER PROCESSING NODE│
                                                                 │                         │
                                                                 │  • BullMQ Consumer      │
                                                                 │  • Tarball / ZIP Parser │
                                                                 │  • AST & Token Analyzer │
                                                                 │  • AI Inference Engine  │
                                                                 └─────────────────────────┘
```

```mermaid
graph TD
    subgraph Client["Frontend Application (Next.js 15)"]
        UI[React 19 UI / Landing & Dashboard]
        Editor[Monaco Code Intelligence Editor]
        SSE[SSE Stream Reader / TanStack Query]
    end

    subgraph Gateway["API Server (NestJS 10)"]
        Auth[Auth & RBAC Guard]
        RepoCtrl[Repository & Project Controller]
        AICtrl[AI Agent & Productivity Controller]
        Prisma[Prisma ORM Client]
    end

    subgraph Broker["Cache & Job Broker"]
        Redis[(Redis 7)]
    end

    subgraph Processing["Background Engine (Worker)"]
        Worker[BullMQ Job Consumer]
        Parser[File Parser & AST Extractor]
        LLM[Multi-Model AI Orchestrator]
    end

    subgraph Storage["Primary Database"]
        PG[(PostgreSQL 16)]
    end

    UI -->|HTTP Requests| Auth
    Editor -->|Live Edits| RepoCtrl
    SSE -->|Stream Connection| AICtrl
    Auth --> Prisma
    RepoCtrl --> Prisma
    RepoCtrl -->|Enqueue Scan Job| Redis
    AICtrl --> LLM
    Prisma --> PG
    Redis -->|Dequeue Work| Worker
    Worker --> Parser
    Parser --> LLM
    Worker -->|Persist Findings| Prisma
```

---

## 🔄 Data Flow Lifecycle

```
[1. User Upload / Git Import]
         │
         ▼
[2. NestJS API Gateway] ──────────► (Validates DTO, Creates 'PENDING' Repository in DB)
         │
         ▼
[3. BullMQ Queue Enqueue] ────────► (Dispatches job to Redis with payload & metadata)
         │
         ▼
[4. Worker Node Execution]
         ├── a. Extracts ZIP / Stream-downloads GitHub tarball
         ├── b. Normalizes paths & ignores binary files / lockfiles
         ├── c. Parses AST symbols, language extensions, and line metrics
         └── d. Batches file contents to AI Provider for diagnostic scoring
         │
         ▼
[5. Results Persistence] ─────────► (Saves Findings, Diagnostics & Status to PostgreSQL)
         │
         ▼
[6. Real-time UI Update] ─────────► (Frontend polling / SSE stream updates Monaco workspace)
```

---

## 📂 Repository Structure

```
codentra/
├── apps/
│   ├── frontend/                         # Next.js 15 Web Application
│   │   ├── src/app/                      # Next.js App Router (Dashboard, Editor, Auth)
│   │   ├── src/components/
│   │   │   ├── ai-editor/                # Autonomous Agent mode, diff viewer, AI chat
│   │   │   ├── code-editor/              # Monaco editor layout, file tree, review modal
│   │   │   ├── dashboard/                # Analytics charts, repository manager, sidebar
│   │   │   ├── github-explorer/          # Public GitHub browser and repo importer
│   │   │   ├── marketing/                # Hero, dynamic 3D effects, feature showcases
│   │   │   └── ui/                       # Accessible UI primitives (Radix, CVA, Tailwind)
│   │   └── src/lib/                      # Auth.js config, Prisma client, API client
│   │
│   ├── backend/                          # NestJS 10 Modular Core API
│   │   ├── prisma/                       # Database schema, migrations, seed data
│   │   └── src/
│   │       ├── common/                   # Guards, decorators, filters, permission matrix
│   │       └── modules/                  # Feature modules
│   │           ├── ai-agent/             # Agent orchestrator, changeset generator
│   │           ├── ai-productivity/      # Automated README, test, and refactor tools
│   │           ├── ai-provider/          # Claude, OpenAI, and Gemini multi-model bridge
│   │           ├── analysis/             # Ingestion pipelines and finding management
│   │           ├── auth/                 # OAuth callback handler and JWT verification
│   │           ├── github/               # Octokit GitHub integration service
│   │           └── repositories/         # File tree resolution and code retrieval
│   │
│   └── worker/                           # Dedicated Background Processing Node
│       └── src/
│           ├── ai/                       # Batch AI analysis handlers
│           ├── processors/               # BullMQ repository & archive processors
│           ├── github-tarball.ts         # Stream-based GitHub repository unpacker
│           └── parser.ts                 # Source code parser & language classifier
│
├── packages/                             # Shared Monorepo Packages
│   ├── shared-types/                     # Shared TypeScript interfaces & DTO schemas
│   ├── shared-ui/                        # Shared React UI components
│   ├── ts-config/                        # Shared tsconfig compiler presets
│   └── eslint-config/                    # Shared ESLint configuration ruleset
│
├── docker/                               # Production & Development Containers
│   ├── docker-compose.yml                # Multi-container local orchestration (Postgres, Redis)
│   ├── Dockerfile.frontend               # Multi-stage standalone Next.js build
│   ├── Dockerfile.backend                # Multi-stage NestJS build
│   └── Dockerfile.worker                 # Multi-stage Node.js worker build
│
├── .github/workflows/                    # CI/CD Workflows
│   ├── ci.yml                            # Lint, Typecheck, Test, E2E workflow
│   └── deploy.yml                        # GHCR Docker image build and push
│
├── turbo.json                            # Turborepo task pipeline configuration
└── pnpm-workspace.yaml                   # pnpm workspace definition
```

---

## 🗄 Database Schema & Domain Model

The application uses PostgreSQL managed via Prisma ORM with strict referential integrity:

| Model | Description | Relations |
| :--- | :--- | :--- |
| `User` | Core user identity & credentials | Has many `Accounts`, `Sessions`, `Memberships`, `ActivityLogs` |
| `Account` | OAuth provider account linkages (GitHub) | Belongs to `User` |
| `Organization` | Multi-tenant tenant boundary | Has many `Members`, `Workspaces`, `Invitations` |
| `Project` | Workspace project collection | Belongs to `Workspace`, contains `Repositories` |
| `Repository` | Ingested repository metadata & status | Has many `Analyses`, `FileNodes`, `Chats` |
| `Analysis` | Analysis execution instance & metrics | Belongs to `Repository`, contains `Findings` |
| `Finding` | Diagnostic issue (Security, Bug, Style) | Belongs to `Analysis` and `FileNode` |
| `FileNode` | Hierarchical file tree node & content | Belongs to `Repository`, has parent/child nodes |
| `Chat` / `Message`| AI conversation history on codebase | Belongs to `Repository` and `User` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` (`npm i -g pnpm`)
- **Docker**: For PostgreSQL & Redis

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ErSHAAD-code/codentra.git
cd codentra
pnpm install
```

### 2. Environment Configuration

Copy the sample environment file:

```bash
cp .env.example .env
```

Configure your local `.env` values:

```env
# Infrastructure
DATABASE_URL="postgresql://codentra:codentra_dev_password@localhost:5432/codentra"
REDIS_URL="redis://localhost:6379"

# Ports & URLs
BACKEND_PORT=4000
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication (Auth.js)
AUTH_SECRET="generate-a-secure-32-byte-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# AI Provider API Key
OPENROUTER_API_KEY="your-openrouter-key"
```

### 3. Start PostgreSQL & Redis

```bash
docker compose -f docker/docker-compose.yml --env-file .env up -d postgres redis
```

### 4. Database Setup & Migration

```bash
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

### 5. Launch Development Services

```bash
pnpm dev
```

The monorepo services will start concurrently:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **NestJS REST Gateway**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Worker Process**: Subscribed to Redis queues

---

## 🧪 Testing & Code Quality

Codentra enforces zero-compromise code quality standards across the entire monorepo:

```bash
# Typecheck all apps and packages
pnpm typecheck

# Lint entire codebase with shared ESLint configuration
pnpm lint

# Execute unit and integration tests (Jest)
pnpm test

# Run Playwright end-to-end smoke tests
pnpm --filter frontend test:e2e
```

---

## 📡 API Specification

### Authentication & Users
- `GET /api/v1/auth/session` — Retrieve current authenticated session
- `GET /api/v1/users/me` — Get current user profile and memberships

### Repository Management
- `POST /api/v1/repositories` — Register new repository
- `GET /api/v1/repositories` — List accessible repositories
- `GET /api/v1/repositories/:id/tree` — Fetch hierarchical file tree
- `GET /api/v1/repositories/:id/files/:fileId` — Fetch file content & diagnostics
- `POST /api/v1/uploads/zip` — Ingest repository via ZIP package

### Code Analysis & Diagnostics
- `POST /api/v1/repositories/:id/analyze` — Enqueue asynchronous repository analysis
- `GET /api/v1/analyses/:id` — Get analysis status, scores, and summary
- `GET /api/v1/analyses/:id/findings` — Retrieve severity-ranked findings
- `PATCH /api/v1/findings/:id` — Update finding status (`DISMISSED`, `RESOLVED`, `ACKNOWLEDGED`)

### AI Agent & Code Intelligence
- `POST /api/v1/repositories/:id/chats` — Initiate contextual codebase chat
- `POST /api/v1/repositories/:id/chats/:chatId/messages` — Send message with streaming response
- `POST /api/v1/ai/agent/run` — Trigger autonomous agent refactoring plan
- `POST /api/v1/ai/agent/validate` — Validate generated AST patches against project rules

---

## ⚖️ Engineering Trade-offs & Design Decisions

### 1. Dedicated Worker Pool vs API Route Processing
- **Problem:** Parsing ZIP tarballs and streaming multi-token LLM completions inside NestJS or Next.js serverless functions blocks the Node.js event loop during intensive I/O and deserialization.
- **Solution:** Defer parsing and LLM inference to a standalone BullMQ worker process. Redis acts as a high-performance, persistent message broker allowing horizontal worker scaling independent of the HTTP gateway.

### 2. Turborepo Monorepo Architecture
- **Problem:** Duplicating TypeScript DTOs, API validation contracts, and UI primitives between frontend and backend leads to contract drift and brittle integrations.
- **Solution:** Centralized `@codentra/shared-types` and `@codentra/shared-ui` packages inside a pnpm workspace with caching via Turborepo. Updates to DTOs are validated across the entire stack at compile time.

### 3. Server-Sent Events (SSE) vs WebSockets for AI Streaming
- **Problem:** Full-duplex WebSockets introduce stateful connection overhead, complex load balancer affinity, and reconnection management.
- **Solution:** Implemented Server-Sent Events (SSE) for downstream AI token streaming. SSE operates cleanly over HTTP/2, handles proxy traversal reliably, and features native browser reconnection support.

---

## 🐳 Containerization & Deployment

Codentra is fully containerized using multi-stage Docker builds:

```bash
# Build Frontend Image
docker build -f docker/Dockerfile.frontend -t ghcr.io/ershaad-code/codentra/frontend:latest .

# Build Backend Image
docker build -f docker/Dockerfile.backend -t ghcr.io/ershaad-code/codentra/backend:latest .

# Build Worker Image
docker build -f docker/Dockerfile.worker -t ghcr.io/ershaad-code/codentra/worker:latest .
```

---

## 👨‍💻 Author

**Md Shaad** — Full Stack Software Engineer
- **GitHub:** [@ErSHAAD-code](https://github.com/ErSHAAD-code)
- **Project Repository:** [https://github.com/ErSHAAD-code/codentra](https://github.com/ErSHAAD-code/codentra)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
