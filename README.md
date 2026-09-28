<p align="center">
  <img src="https://img.shields.io/badge/Codentra-AI%20Code%20Intelligence-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+" alt="Codentra" />
</p>

<h1 align="center">⚡ Codentra</h1>

<p align="center">
  <strong>AI-Powered Code Intelligence Platform</strong><br/>
  Connect your repo. Get instant AI analysis. Ship with confidence.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🎯 What is Codentra?

**Codentra** is a full-stack AI code intelligence platform that analyzes your repositories for bugs, security vulnerabilities, and code quality issues — powered by AI. Connect a GitHub repo or upload a ZIP file, and get actionable insights in under 60 seconds.

### Key Highlights

- 🔍 **AI-Powered Code Review** — Automated static analysis with AI-driven insights
- 🤖 **AI Agent Mode** — An autonomous coding agent that can plan, generate, and validate changes
- 💬 **Repository Chat** — Chat with your codebase using natural language
- 📊 **Quality Scoring** — 5 explainable quality dimensions (Security, Reliability, Maintainability, Performance, Style)
- 🛠️ **AI Productivity Tools** — Auto-generate README, tests, refactoring suggestions, architecture diagrams
- 🌐 **GitHub Explorer** — Browse any public GitHub user's repositories, branches, and file trees
- ✏️ **Built-in Code Editor** — Monaco-powered editor with AI assistant panel and contribution workflows
- 🔐 **Auth.js Integration** — GitHub OAuth for seamless authentication

---

## ✨ Features

### 🏠 Marketing Landing Page
- Stunning animated hero with particle effects and 3D tilt cards
- Scramble text animations and glassmorphism design
- Interactive pricing, FAQ, tech stack, and testimonials sections
- Fully responsive with smooth scroll navigation

### 📊 Dashboard
- Project and repository management
- Code analysis history and review tracking
- Real-time analysis status with BullMQ job queue
- Global command palette (⌘K) for quick navigation

### 🔬 Code Analysis Engine
- Upload ZIP files or connect GitHub repositories
- Static analysis pipeline with severity-ranked findings
- AI-powered review with explainable quality scores
- Finding management (dismiss, acknowledge, resolve)

### 🤖 AI Features
- **Chat with Code** — Natural language conversations about your codebase
- **AI Agent** — Autonomous agent that plans tasks, generates code, and validates changes
- **README Generator** — Auto-generate professional documentation
- **Test Generator** — AI-written unit tests for your code
- **Code Explainer** — Get plain-language explanations of complex code
- **Architecture Diagrams** — Auto-generated Mermaid diagrams
- **Refactoring Suggestions** — AI-driven code improvement recommendations
- **SQL Explainer** — Break down complex SQL queries
- **Debug Assistant** — AI-powered error analysis
- **Commit Message Generator** — Smart commit message suggestions

### 🌐 GitHub Explorer
- Search and browse GitHub users and organizations
- Explore repositories, branches, and file trees
- One-click repository import
- Branch selector with live file browsing

### ✏️ Code Editor
- Monaco Editor with syntax highlighting for 20+ languages
- Integrated AI assistant panel with quick actions
- File explorer with tree navigation
- Problems panel with error analysis
- Editor review modal with diff preview
- Contribution dialog for submitting changes back to GitHub

---

## 🏗 Architecture

Codentra is built as a **pnpm monorepo** powered by **Turborepo**, with three main applications and shared packages:

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Next.js 15 Frontend (Port 3000)         │   │
│  │  ┌────────┐ ┌──────────┐ ┌───────┐ ┌──────────┐ │   │
│  │  │Landing │ │Dashboard │ │Editor │ │ GitHub   │  │   │
│  │  │  Page  │ │  & Repos │ │ + AI  │ │Explorer  │  │   │
│  │  └────────┘ └──────────┘ └───────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│              NestJS Backend (Port 4000)                   │
│                                                           │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌────────────┐  │
│  │ Auth │ │Repos │ │Analysis│ │ Chat │ │ AI Provider │  │
│  │Module│ │Module│ │ Module │ │Module│ │   Module    │  │
│  └──────┘ └──────┘ └────────┘ └──────┘ └────────────┘  │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌────────────┐  │
│  │GitHub│ │Upload│ │Projects│ │Notif.│ │  AI Agent   │  │
│  │Module│ │Module│ │ Module │ │Module│ │   Module    │  │
│  └──────┘ └──────┘ └────────┘ └──────┘ └────────────┘  │
└───────┬──────────────────┬──────────────────────────────┘
        │                  │
   ┌────▼────┐        ┌───▼────┐        ┌─────────────┐
   │PostgreSQL│        │ Redis  │        │   Worker     │
   │  (5432)  │        │ (6379) │◄───────│  (BullMQ)   │
   └──────────┘        └────────┘        └─────────────┘
```

---

## 📁 Project Structure

```
codentra/
├── apps/
│   ├── frontend/                   # Next.js 15 application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx                    # Landing page
│   │       │   ├── layout.tsx                  # Root layout with providers
│   │       │   ├── login/                      # Authentication page
│   │       │   ├── api/                        # API routes (auth callbacks)
│   │       │   └── (dashboard)/
│   │       │       ├── dashboard/
│   │       │       │   ├── page.tsx             # Main dashboard
│   │       │       │   ├── repositories/        # Repository management
│   │       │       │   │   └── [id]/            # Repository detail + editor
│   │       │       │   ├── reviews/             # Analysis review history
│   │       │       │   ├── chat/                # AI chat interface
│   │       │       │   └── settings/            # User settings
│   │       │       └── explore/                 # GitHub explorer
│   │       ├── components/
│   │       │   ├── marketing/                   # Landing page sections
│   │       │   │   ├── hero.tsx                 # Animated hero section
│   │       │   │   ├── features.tsx             # Feature showcase
│   │       │   │   ├── how-it-works.tsx         # 4-step workflow
│   │       │   │   ├── pricing.tsx              # Pricing plans
│   │       │   │   ├── tech-stack.tsx           # Technology showcase
│   │       │   │   ├── faq.tsx                  # FAQ accordion
│   │       │   │   ├── testimonials.tsx         # User testimonials
│   │       │   │   ├── navbar.tsx               # Navigation bar
│   │       │   │   └── cta-footer.tsx           # Call-to-action footer
│   │       │   ├── dashboard/                   # Dashboard components
│   │       │   │   ├── sidebar.tsx              # Navigation sidebar
│   │       │   │   ├── topbar.tsx               # Top navigation bar
│   │       │   │   ├── command-palette.tsx       # ⌘K command palette
│   │       │   │   ├── github-import.tsx        # GitHub repo import dialog
│   │       │   │   ├── stat-card.tsx            # Statistics card
│   │       │   │   └── severity-badge.tsx       # Finding severity indicator
│   │       │   ├── code-editor/                 # Monaco editor integration
│   │       │   │   ├── EditorLayout.tsx         # Main editor layout
│   │       │   │   ├── CodeEditor.tsx           # Monaco editor wrapper
│   │       │   │   ├── FileExplorer.tsx         # File tree sidebar
│   │       │   │   ├── EditorToolbar.tsx        # Editor action bar
│   │       │   │   ├── EditorTabs.tsx           # Multi-tab file editing
│   │       │   │   ├── ProblemsPanel.tsx        # Error/warning display
│   │       │   │   ├── EditorReviewModal.tsx    # AI code review modal
│   │       │   │   ├── ContributionDialog.tsx   # Submit changes to GitHub
│   │       │   │   ├── BranchSelector.tsx       # Git branch selector
│   │       │   │   └── ChangesPanel.tsx         # Modified files panel
│   │       │   ├── ai-editor/                   # AI assistant components
│   │       │   │   ├── AgentMode.tsx            # Autonomous AI agent
│   │       │   │   ├── AgentActivity.tsx        # Agent execution timeline
│   │       │   │   ├── AgentPlan.tsx            # Agent task planning
│   │       │   │   ├── AgentDiffViewer.tsx      # Agent change diff view
│   │       │   │   ├── AgentChangesPanel.tsx    # Agent changes review
│   │       │   │   ├── AgentValidationPanel.tsx # Agent validation results
│   │       │   │   ├── AiAssistantPanel.tsx     # AI sidebar panel
│   │       │   │   ├── AiChat.tsx               # AI chat interface
│   │       │   │   ├── AiQuickActions.tsx       # One-click AI actions
│   │       │   │   ├── ModelSelector.tsx        # AI model picker
│   │       │   │   └── DiffPreview.tsx          # Code diff viewer
│   │       │   ├── github-explorer/             # GitHub browsing components
│   │       │   │   ├── github-user-search.tsx   # User/org search
│   │       │   │   ├── github-repo-list.tsx     # Repository listing
│   │       │   │   ├── github-file-tree.tsx     # File tree browser
│   │       │   │   ├── github-user-card.tsx     # User profile card
│   │       │   │   ├── github-repo-card.tsx     # Repository card
│   │       │   │   └── github-branch-selector.tsx # Branch picker
│   │       │   ├── ui/                          # Reusable UI primitives
│   │       │   │   ├── 3d-effects.tsx           # TiltCard, FloatingOrb, BorderBeam
│   │       │   │   ├── motion-primitives.tsx    # ScrollReveal, Parallax, Typing
│   │       │   │   ├── text-scramble.tsx        # Scramble text animations
│   │       │   │   ├── canvas-particles.tsx     # Particle background
│   │       │   │   ├── button.tsx               # Button component (CVA)
│   │       │   │   ├── card.tsx                 # Card component
│   │       │   │   ├── badge.tsx                # Badge component
│   │       │   │   └── theme-switcher.tsx       # Dark/light mode toggle
│   │       │   └── providers/                   # React context providers
│   │       ├── lib/                             # Utilities & configuration
│   │       │   ├── api.ts                       # API client
│   │       │   ├── auth.ts                      # Auth.js configuration
│   │       │   ├── prisma.ts                    # Prisma client singleton
│   │       │   └── utils.ts                     # Shared utilities
│   │       └── styles/                          # Global CSS & design tokens
│   │
│   ├── backend/                    # NestJS API server
│   │   ├── prisma/
│   │   │   ├── schema.prisma                    # Database schema (640 lines)
│   │   │   ├── migrations/                      # Database migrations
│   │   │   └── seed.ts                          # Database seeder
│   │   └── src/
│   │       ├── main.ts                          # Application entry point
│   │       ├── app.module.ts                    # Root module
│   │       ├── common/                          # Shared guards, pipes, filters
│   │       └── modules/
│   │           ├── auth/                        # Auth.js + JWT authentication
│   │           ├── projects/                    # Project CRUD operations
│   │           ├── repositories/                # Repository management
│   │           ├── uploads/                     # ZIP file upload handling
│   │           ├── analysis/                    # Code analysis pipeline
│   │           ├── chat/                        # AI chat with codebase
│   │           ├── github/                      # GitHub API integration
│   │           ├── ai-provider/                 # AI model abstraction layer
│   │           ├── ai-productivity/             # README, tests, refactor AI tools
│   │           ├── ai-agent/                    # Autonomous coding agent
│   │           ├── ai-context/                  # Repository context for AI
│   │           ├── members/                     # Organization member management
│   │           ├── invitations/                 # Team invitation system
│   │           ├── notifications/               # In-app notification system
│   │           ├── webhooks/                    # GitHub webhook handler
│   │           ├── health/                      # Health check endpoints
│   │           ├── parser/                      # Code file parser
│   │           └── language-detector/           # Programming language detection
│   │
│   └── worker/                     # Background job processor
│       └── src/
│           ├── index.ts                         # Worker entry point
│           ├── parser.ts                        # Code file parser
│           ├── language-map.ts                  # File extension mapping
│           ├── github-tarball.ts                # GitHub repo downloader
│           ├── processors/                      # BullMQ job processors
│           └── ai/                              # AI analysis workers
│
├── packages/                       # Shared workspace packages
│   ├── shared-types/               # TypeScript type definitions
│   ├── shared-ui/                  # Reusable UI components
│   ├── ts-config/                  # Shared TypeScript configs
│   └── eslint-config/              # Shared ESLint rules
│
├── docker/                         # Docker configuration
│   ├── docker-compose.yml          # Full local development stack
│   ├── Dockerfile.backend          # Backend container
│   ├── Dockerfile.frontend         # Frontend container
│   └── Dockerfile.worker           # Worker container
│
├── turbo.json                      # Turborepo pipeline config
├── pnpm-workspace.yaml             # pnpm workspace definition
├── package.json                    # Root workspace scripts
├── .env.example                    # Environment variable template
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥ 20.0.0 | JavaScript runtime |
| [pnpm](https://pnpm.io/) | ≥ 9.0.0 | Package manager |
| [Docker](https://www.docker.com/) | Latest | PostgreSQL & Redis containers |
| [Git](https://git-scm.com/) | Latest | Version control |

### 1. Clone the Repository

```bash
git clone https://github.com/ErSHAAD-code/codentra.git
cd codentra
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and configure the following:

```env
# ── Database ──────────────────────────────────────────────
POSTGRES_USER=codentra
POSTGRES_PASSWORD=codentra_dev_password
POSTGRES_DB=codentra
POSTGRES_PORT=5432
DATABASE_URL=postgresql://codentra:codentra_dev_password@localhost:5432/codentra

# ── Redis ─────────────────────────────────────────────────
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# ── Backend (NestJS) ──────────────────────────────────────
BACKEND_PORT=4000
NODE_ENV=development
API_PREFIX=api/v1

# ── Frontend (Next.js) ────────────────────────────────────
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Auth (Auth.js) ────────────────────────────────────────
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_GITHUB_ID=<your-github-oauth-app-id>
AUTH_GITHUB_SECRET=<your-github-oauth-app-secret>

# ── AI Provider ───────────────────────────────────────────
OPENROUTER_API_KEY=<your-openrouter-api-key>
```

> **💡 Tip:** To create a GitHub OAuth App, go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App. Set the callback URL to `http://localhost:3000/api/auth/callback/github`.

### 4. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose -f docker/docker-compose.yml --env-file .env up -d postgres redis
```

Verify both containers are running and healthy:

```bash
docker ps --filter name=codentra --format "table {{.Names}}\t{{.Status}}"
```

Expected output:
```
NAMES               STATUS
codentra-postgres   Up X minutes (healthy)
codentra-redis      Up X minutes (healthy)
```

### 5. Set Up the Database

```bash
# Generate Prisma client
cd apps/backend
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed

cd ../..
```

### 6. Start the Development Servers

```bash
pnpm run dev
```

This starts all three services in parallel via Turborepo:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js web application |
| **Backend** | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | NestJS REST API |
| **Worker** | — | BullMQ background job processor |

### 7. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## 🛑 Stopping the Project

```bash
# Stop the dev servers (Ctrl+C in the terminal)

# Stop the Docker containers
docker compose -f docker/docker-compose.yml --env-file .env down

# To also remove volumes (database data):
docker compose -f docker/docker-compose.yml --env-file .env down -v
```

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript 5.5** | Type safety |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **GSAP** | Advanced scroll animations |
| **Monaco Editor** | VS Code-powered code editor |
| **Zustand** | Lightweight state management |
| **React Query (TanStack)** | Server state & caching |
| **Auth.js (NextAuth v5)** | Authentication |
| **Radix UI** | Accessible headless UI primitives |
| **Lucide React** | Icon library |
| **Lenis** | Smooth scroll |

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Modular Node.js framework |
| **Prisma 5** | Type-safe ORM |
| **PostgreSQL 16** | Relational database |
| **Redis 7** | Caching & job queue broker |
| **BullMQ** | Background job processing |
| **Helmet** | Security headers |
| **Throttler** | Rate limiting |
| **class-validator** | DTO validation |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Local development orchestration |
| **Turborepo** | Monorepo build system |
| **pnpm** | Fast, disk-efficient package manager |
| **GitHub Actions** | CI/CD (planned) |

---

## 📡 API Reference

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Full health status |
| `GET` | `/api/v1/health/live` | Liveness probe |
| `GET` | `/api/v1/health/ready` | Readiness probe |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects` | List all projects |
| `GET` | `/api/v1/projects/:id` | Get project details |
| `PATCH` | `/api/v1/projects/:id` | Update project |
| `DELETE` | `/api/v1/projects/:id` | Delete project |

### Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/repositories` | Create repository |
| `POST` | `/api/v1/repositories/quick-start` | Quick start setup |
| `GET` | `/api/v1/repositories` | List repositories |
| `GET` | `/api/v1/repositories/:id` | Get repository |
| `GET` | `/api/v1/repositories/:id/tree` | Get file tree |
| `GET` | `/api/v1/repositories/:id/files/:fileId` | Get file content |
| `DELETE` | `/api/v1/repositories/:id` | Delete repository |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/repositories/:id/analyze` | Trigger analysis |
| `GET` | `/api/v1/repositories/:id/analyses` | List analyses |
| `GET` | `/api/v1/analyses/:id` | Get analysis details |
| `GET` | `/api/v1/analyses/:id/findings` | Get findings |
| `PATCH` | `/api/v1/findings/:id` | Update finding status |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/repositories/:id/chats` | Create chat |
| `GET` | `/api/v1/repositories/:id/chats` | List chats |
| `POST` | `/api/v1/repositories/:id/chats/:chatId/messages` | Send message |
| `GET` | `/api/v1/repositories/:id/chats/:chatId/messages` | Get messages |

### AI Productivity
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/repositories/:id/ai/readme` | Generate README |
| `POST` | `/api/v1/repositories/:id/ai/tests` | Generate tests |
| `POST` | `/api/v1/repositories/:id/ai/explain` | Explain code |
| `POST` | `/api/v1/repositories/:id/ai/refactor` | Suggest refactoring |
| `POST` | `/api/v1/repositories/:id/ai/diagram` | Generate diagram |

### GitHub Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/github/repositories` | List user repos |
| `POST` | `/api/v1/github/import` | Import repository |
| `GET` | `/api/v1/github/users/search` | Search GitHub users |
| `GET` | `/api/v1/github/users/:username/repos` | Get user repos |

---

## 📜 Available Scripts

Run from the **monorepo root** (`codentra/`):

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages and applications |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run all test suites |
| `pnpm clean` | Remove all build artifacts and `node_modules` |
| `pnpm format` | Format code with Prettier |

### Backend-specific (from `apps/backend/`):

| Command | Description |
|---------|-------------|
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate` | Run database migrations (dev) |
| `pnpm prisma:deploy` | Deploy migrations (production) |
| `pnpm prisma:studio` | Open Prisma Studio GUI |
| `pnpm prisma:seed` | Seed the database |

---

## 🐛 Troubleshooting

<details>
<summary><strong>❌ ECONNREFUSED on port 5432 or 6379</strong></summary>

PostgreSQL or Redis containers aren't running. Start them:

```bash
docker compose -f docker/docker-compose.yml --env-file .env up -d postgres redis
```

</details>

<details>
<summary><strong>❌ Prisma client not generated</strong></summary>

Run from `apps/backend/`:

```bash
npx prisma generate
```

</details>

<details>
<summary><strong>❌ Port already in use</strong></summary>

Change the port in `.env` or kill the process using the port:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

</details>

<details>
<summary><strong>❌ pnpm not recognized</strong></summary>

Install pnpm globally:

```bash
npm install -g pnpm
```

</details>

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 Security

If you discover a security vulnerability, please refer to our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

See our [Roadmap](ROADMAP.md) for planned features and improvements.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/SHAAD-SHAAD">SHAAD</a>
</p>
