# Codentra — AI Code Intelligence Platform
## System Architecture, Stack & Roadmap (v1.0)

---

## 1. Product Definition

**What Codentra does:** Developers connect a repo or paste code → Codentra runs AI-assisted analysis for bugs, security vulnerabilities, code quality issues, missing docs, and missing tests → returns actionable, categorized findings with suggested fixes.

**Core value loop:**
```
Code Input → Analysis Engine (static + AI) → Findings → Suggested Fixes → Developer Action → Feedback loop improves prompts/rules
```

**Why this matters for your portfolio:** This isn't a to-do app with AI sprinkled on top. It touches everything a product-based company cares about: async job processing, third-party API orchestration (LLMs), secure multi-tenant data handling, real-time UX (streaming AI output), and a domain (code analysis) that's inherently technical. That's the story you want to tell in an interview.

---

## 2. Technology Stack (with reasoning)

### 2.1 Frontend
| Choice | Why |
|---|---|
| **Next.js 14+ (App Router) + TypeScript** | Industry default for modern SaaS (Linear, Vercel, Notion-adjacent stacks). Server components reduce client bundle size; built-in routing/SSR removes need for separate build tooling. |
| **Tailwind CSS + shadcn/ui** | shadcn gives you unstyled, ownable component primitives (not a black-box library) — this is what most funded SaaS startups actually use today, and it reads well in a portfolio because you're not just gluing together Material UI. |
| **Zustand** (not Redux) | Modern SaaS apps favor lightweight state managers. Redux's boilerplate is a red flag of outdated patterns in 2026 interviews unless the app has extreme state complexity — Codentra doesn't. |
| **TanStack Query** | For server state (API data, caching, invalidation) — separate from Zustand's client state. This separation (server state vs. client state) is itself an architecture decision worth explaining in interviews. |
| **React Hook Form + Zod** | Type-safe forms with shared validation schemas between frontend and backend. |

### 2.2 Backend
| Choice | Why |
|---|---|
| **NestJS (Node.js) + TypeScript** | NestJS enforces layered architecture (controllers/services/modules) out of the box — this *is* Clean Architecture / SOLID for you, structurally. It's used by real companies (Adidas, Roche, and many YC startups) and interviewers recognize the patterns (DI, decorators, guards) instantly. Alternative considered: FastAPI (Python) — excellent for AI-heavy backends, but splits your codebase into two languages. We'll use Python only where it earns its place (see 2.4). |
| **PostgreSQL** | Relational integrity matters here (users → projects → scans → findings, all relational). Postgres is the default at nearly every serious SaaS company. |
| **Prisma ORM** | Type-safe queries, best-in-class migration tooling, and it generates types your frontend can share. Alternative: TypeORM — more "enterprise Java-like," more boilerplate, less loved in current job-market signaling. |
| **Redis** | Two jobs: (1) caching, (2) BullMQ job queue backing store for async AI analysis jobs. |
| **BullMQ** | Code analysis is not request/response — it's a background job (can take 10–60s+). Queues are how real systems handle this. This alone is a strong interview talking point (why not just await the AI call in the controller). |

### 2.3 AI Layer
| Choice | Why |
|---|---|
| **Anthropic Claude API (primary)**, provider-agnostic adapter pattern | Build an `AIProvider` interface so Claude/OpenAI/local models are swappable — this demonstrates the Strategy pattern and protects you from vendor lock-in, which is exactly the kind of decision a staff engineer makes. |
| **Structured output (JSON mode / tool use)** for findings | Never parse free-text AI output with regex in production code — this is a common beginner mistake. We'll design strict JSON schemas for "finding" objects. |
| **Streaming responses** to frontend via SSE | For the AI chat/explanation features — shows you understand real-time UX beyond basic REST. |
| **RAG-lite for repo context** (chunk + embed relevant files) | For analyzing more than a single file, we can't dump an entire repo into context. We'll chunk, retrieve relevant code, and only send what's needed — a real scalability constraint, not a toy one. |

### 2.4 Static Analysis Layer (non-AI, deterministic)
| Choice | Why |
|---|---|
| **ESLint/Semgrep-based static rules run first, AI second** | This is critical: don't make AI do what deterministic tools do better (syntax errors, known vulnerability patterns). AI should focus on judgment calls (design smells, missing edge-case handling, unclear naming). Hybrid analysis (static + AI) is the actual industry pattern (see: GitHub CodeQL + Copilot, Snyk, SonarQube). This is a genuinely strong architecture talking point. |

### 2.5 Infrastructure & DevOps
| Choice | Why |
|---|---|
| **Docker + docker-compose** for local dev | Non-negotiable for "production-grade." Every service (API, worker, Postgres, Redis) runs identically on any machine. |
| **GitHub Actions** for CI/CD | Lint → typecheck → test → build → (deploy) pipeline. Free, ubiquitous, and what most companies use. |
| **Deployment**: Frontend → Vercel; Backend/Worker → Railway or Render (Fly.io as alt); DB → managed Postgres (Neon/Supabase/Railway) | Realistic for a portfolio project — you don't need to run raw Kubernetes to prove infra competence. What matters is that the *pipeline* (CI/CD, containerization, environment config) is real. |
| **Sentry** for error tracking, **Better Stack/Axiom** for logs | Observability is something junior projects skip and senior engineers don't. Even a lightweight integration signals maturity. |

### 2.6 Auth & Security
| Choice | Why |
|---|---|
| **NextAuth.js / Auth.js** with JWT + refresh token rotation | Industry-standard session handling, supports OAuth (GitHub login makes deep sense for a dev tool). |
| **RBAC (role-based access control)** at the API layer via NestJS Guards | Multi-tenant orgs → projects → members, with roles (owner/admin/member). This is a genuinely important SaaS pattern to demonstrate. |
| **Rate limiting** (via `@nestjs/throttler` + Redis) | Protects AI endpoints from abuse — also protects your API cost. |
| **Input validation** via class-validator/Zod on every boundary | No trust of client input, ever. |
| **Secrets** via `.env` + documented `.env.example`, never committed | Basic hygiene that's still worth stating explicitly in your README. |

---

## 3. High-Level System Architecture

```
                         ┌─────────────────────┐
                         │     Next.js Web      │
                         │  (Dashboard, Editor,  │
                         │   Auth, Billing UI)   │
                         └──────────┬───────────┘
                                    │ REST/JSON + SSE (streaming)
                         ┌──────────▼───────────┐
                         │   NestJS API Server   │
                         │  Auth │ Projects │    │
                         │  Scans │ Users │ Orgs │
                         └──────┬───────┬────────┘
                                │       │
                    enqueue job │       │ read/write
                                │       │
                     ┌──────────▼──┐  ┌─▼─────────────┐
                     │  BullMQ      │  │  PostgreSQL   │
                     │  (Redis)     │  │  (Prisma)     │
                     └──────┬───────┘  └───────────────┘
                            │
                 ┌──────────▼───────────┐
                 │   Analysis Worker     │
                 │  1. Static analysis   │
                 │  2. AI Provider call  │
                 │     (Claude API)      │
                 │  3. Persist findings  │
                 └───────────────────────┘
```

**Key architectural decision — why a separate worker process:** The API server must stay fast and responsive. AI analysis is slow and can fail/retry. Decoupling via a queue means a flaky AI call never takes down your API, and you can scale workers independently of the web tier. This is precisely the kind of separation-of-concerns a Staff Engineer interview will probe.

---

## 4. Monorepo Folder Structure

We'll use a **Turborepo monorepo** — this is how most modern SaaS teams organize frontend + backend + shared types in one repo, and it's a strong signal on GitHub.

```
codentra/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/                  # App router pages
│   │   ├── components/
│   │   │   ├── ui/                # shadcn primitives
│   │   │   └── features/          # feature-based components
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   │
│   ├── api/                      # NestJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── users/
│   │       │   ├── organizations/
│   │       │   ├── projects/
│   │       │   ├── scans/
│   │       │   └── findings/
│   │       ├── common/
│   │       │   ├── guards/
│   │       │   ├── interceptors/
│   │       │   ├── filters/
│   │       │   └── decorators/
│   │       └── main.ts
│   │
│   └── worker/                   # BullMQ analysis worker
│       └── src/
│           ├── processors/
│           ├── analyzers/
│           │   ├── static/
│           │   └── ai/
│           └── ai-providers/
│               ├── ai-provider.interface.ts
│               ├── claude.provider.ts
│               └── openai.provider.ts
│
├── packages/
│   ├── database/                 # Prisma schema + client (shared)
│   ├── shared-types/              # Shared TS types/DTOs
│   ├── config/                    # Shared eslint/tsconfig
│   └── ui/                        # Shared component library (optional, later phase)
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── CONTRIBUTING.md
```

**Why feature-based, not layer-based, inside each module:** `modules/scans/{scans.controller.ts, scans.service.ts, scans.module.ts, dto/}` keeps everything about "scans" together. This scales far better than a `controllers/`, `services/`, `models/` split as the app grows — and it's the NestJS-recommended pattern.

---

## 5. Database Design (initial schema)

Core entities and relationships:

```
User ─┬── OrganizationMember ──┬── Organization
      │                        │
      │                        └── Project ──┬── Scan ──── Finding
      │                                      │
      └── (personal projects, optional)      └── Integration (GitHub App connection)
```

**Key tables:**

- **User**: id, email, name, avatarUrl, authProvider, createdAt
- **Organization**: id, name, slug, plan (free/pro/team), createdAt
- **OrganizationMember**: userId, organizationId, role (owner/admin/member)
- **Project**: id, organizationId, name, repoUrl, defaultBranch, createdAt
- **Scan**: id, projectId, status (queued/running/completed/failed), triggeredBy, commitSha, startedAt, completedAt
- **Finding**: id, scanId, filePath, lineStart, lineEnd, category (bug/security/quality/docs/test), severity (critical/high/medium/low), title, description, suggestedFix, source (static/ai), status (open/resolved/ignored)
- **Integration**: id, projectId, provider (github), accessToken (encrypted), installationId

**Design decisions worth noting:**
- `Finding.source` distinguishes static-analysis findings from AI findings — useful for both UX (badges) and for measuring AI accuracy later.
- Soft status fields (`ignored`, `resolved`) rather than deleting findings — preserves audit history, which real code-review tools do.
- Everything scoped under `Organization`, even for solo users (a "personal org" is created automatically) — this avoids a painful schema migration later when you add team features. This is a scalability decision made *before* it's needed, which is exactly the kind of foresight to narrate in an interview.

---

## 6. Development Roadmap — Phased Delivery

We build in vertical slices, not horizontal layers — each phase produces something demoable end-to-end.

### **Phase 0 — Foundations (Week 1)**
- Monorepo setup (Turborepo), shared configs, Docker Compose (Postgres + Redis)
- Prisma schema v1 + migrations
- CI pipeline: lint, typecheck, test on every PR
- **Deliverable:** `docker-compose up` boots the full stack locally.

### **Phase 1 — Auth & Multi-tenancy (Week 2)**
- GitHub OAuth login, JWT + refresh tokens
- Organization creation, member invites, RBAC guards
- **Deliverable:** Sign up, log in, see an empty dashboard scoped to your org.

### **Phase 2 — Project Ingestion (Week 2–3)**
- Connect a GitHub repo (GitHub App or manual paste-in for MVP)
- Project CRUD
- **Deliverable:** Add a project, see it listed with metadata.

### **Phase 3 — Core Analysis Engine (Week 3–5)** ⭐ Heart of the product
- BullMQ worker setup
- Static analysis integration (ESLint/Semgrep runner)
- AI Provider abstraction + Claude integration with structured JSON output
- Findings persistence + severity scoring
- **Deliverable:** Trigger a scan → see real findings with severity, category, and suggested fixes.

### **Phase 4 — Findings Dashboard & Code Viewer (Week 5–6)**
- Findings list with filters (severity/category/status)
- Inline code viewer showing the exact flagged lines (Monaco Editor)
- Mark as resolved/ignored
- **Deliverable:** A genuinely usable review experience.

### **Phase 5 — AI Chat / "Ask about this finding" (Week 6–7)**
- Streaming chat scoped to a specific finding or file
- **Deliverable:** Click a finding → ask "why is this a problem?" → streamed AI explanation.

### **Phase 6 — Test & Doc Generation (Week 7–8)**
- Generate unit test skeletons and docstrings for flagged functions
- **Deliverable:** One-click "Generate tests" / "Generate docs" per finding.

### **Phase 7 — Polish, Billing Stub, Observability (Week 8–9)**
- Sentry integration, rate limiting, empty/loading/error states everywhere
- Stripe billing scaffold (even if not fully live) — shows SaaS completeness
- **Deliverable:** Production-feel across the whole app.

### **Phase 8 — Deployment & Documentation (Week 9–10)**
- Deploy all services, custom domain, environment configs
- Write ARCHITECTURE.md, API.md, README with screenshots/GIFs
- **Deliverable:** Live URL + an ATS/recruiter-ready GitHub repo.

---

## 7. What We Will NOT Over-Engineer (and why that's a good decision)

- **No Kubernetes** — Docker Compose + managed PaaS deploys is the right scale for this project. K8s here would be resume-padding, not architecture.
- **No microservices split beyond API/Worker** — a modular monolith with clear module boundaries is what real early-stage SaaS runs; premature microservices are a classic interview red flag when the interviewer asks "how many requests/sec justified this?"
- **No custom-built LLM/model training** — we consume frontier models via API. Building our own model would be a distraction from the actual product value.

---

## Next Step

Before I write any code, confirm or adjust:
1. Stack choices above (any strong preferences — e.g., you already know Flutter; do you want a mobile companion app later, or is this web-only for now?)
2. Repo ingestion approach for MVP — full GitHub App integration (more setup, more impressive) vs. paste-code/upload-zip MVP first, GitHub integration in a later phase?
3. Should we start with **Phase 0** now?
