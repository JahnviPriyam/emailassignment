# ReachInbox Email Job Scheduler 🚀

A production-grade, full-stack Email Job Scheduler inspired by **ReachInbox**, built with a minimal, premium SaaS interface using strictly **Pastel Pink** and **Pastel Blue** design aesthetics. 

Designed for high reliability, fault tolerance, and elegant user experience, this application leverages a modern distributed architecture featuring **Next.js 15 (App Router)**, **Express.js**, **BullMQ**, **Redis**, and **PostgreSQL with Prisma**.

---

## 🌟 Key Features

- **🎨 Pastel SaaS Design System**: Beautiful, minimal interface inspired by Linear, Notion, and Stripe using only pastel pink (`#ffb6c1` / `#f497a9`) and pastel blue (`#8bc6ec` / `#a2d2ff`), 16px rounded corners, soft shadows, and smooth Framer Motion micro-animations.
- **🔐 Real Google OAuth & Dev Fallback**: Powered by NextAuth with Google OAuth, plus an instant "Demo / Dev Login" fallback for zero-friction testing.
- **📁 CSV / TXT Email Parsing**: Drag-and-drop file upload with intelligent client-side validation using Papa Parse and regex. Automatically extracts valid email addresses, ignores malformed entries, and displays real-time detection counts before scheduling.
- **⏱️ Delayed Queue Processing (No Cron Jobs)**: Uses BullMQ delayed jobs to schedule thousands of staggered email dispatches with configurable delays between emails.
- **⚡ Redis-Powered Rate Limiting & Graceful Rescheduling**: Tracks hourly email volume via atomic Redis counters (`INCR`). When the hourly limit is exceeded, jobs are **never failed**; instead, they are dynamically calculated and re-scheduled into the next available hour window.
- **🛡️ 100% Idempotency & Persistence**: Built-in deterministic job IDs prevent duplicate emails. Full PostgreSQL and Redis persistence ensures all queued and scheduled jobs survive server crashes and restarts without data loss.
- **🐳 One-Command Docker Orchestration**: Complete `docker-compose.yml` bundling PostgreSQL 16, Redis 7 (with AOF persistence), Backend API, and Next.js Frontend.

---

## 🏛️ Architecture & System Design

```mermaid
graph TD
    subgraph Frontend [Next.js 15 App Router - Pastel SaaS UI]
        Auth[NextAuth.js Google OAuth]
        Dashboard[Dashboard / Tabs]
        Modal[Compose Modal + CSV Parser]
        RQ[TanStack Query + Axios]
    end

    subgraph Backend [Express.js + TypeScript API]
        API[REST API Controllers & Services]
        Prisma[Prisma ORM]
        BullMQ[BullMQ Job Queue]
        RateLimiter[Redis Rate Limiter Service]
        Worker[BullMQ Concurrency Worker]
    end

    subgraph Infrastructure [Docker Compose Persistence]
        PG[(PostgreSQL 16)]
        Redis[(Redis 7 AOF)]
        SMTP[Ethereal Email SMTP]
    end

    Auth --> Dashboard
    Dashboard -->|GET /api/scheduled & /api/sent| RQ
    Modal -->|POST /api/schedule with CSV emails| RQ
    RQ -->|REST JSON + Bearer/User Auth| API
    
    API -->|Read/Write Jobs| Prisma
    Prisma <-->|SQL| PG
    API -->|Schedule Delayed Jobs| BullMQ
    BullMQ <-->|Redis Delayed Queue| Redis
    
    Worker -->|Fetch Next Job| BullMQ
    Worker -->|Check & Incr Counter| RateLimiter
    RateLimiter <-->|INCR rate_limit:hour| Redis
    Worker -->|Send Mail| SMTP
    Worker -->|Update Status sent/failed/rescheduled| Prisma
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS design tokens, custom shadcn/ui components
- **State & Data Fetching**: TanStack Query (React Query v5), Axios
- **Forms & Validation**: React Hook Form, Zod
- **Parsing**: Papa Parse (client-side CSV processing)
- **Authentication**: NextAuth.js / Auth.js (Google OAuth + Demo Fallback)
- **Icons & Animations**: Lucide React, Framer Motion

### Backend
- **Runtime & Framework**: Node.js, Express.js 4, TypeScript
- **Queue Engine**: BullMQ (Redis-backed job scheduling)
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Email Delivery**: Nodemailer, Ethereal Email SMTP (with auto-test account generation)
- **Validation & Logging**: Zod, Morgan, Pino, Cors

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Databases**: PostgreSQL (Relational storage), Redis (AOF Persistence & Rate Counters)

---

## 🚀 Getting Started & Setup Instructions

### Option 1: One-Command Docker Compose (Recommended)

1. Clone the repository and navigate to the project root:
   ```bash
   cd email-scheduler
   ```
2. Start the entire distributed stack (Postgres, Redis, Backend, Frontend):
   ```bash
   docker compose up --build -d
   ```
3. Access the application:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
   - **Database**: Port `5432` (`postgres://postgres:postgrespassword@localhost:5432/emailscheduler`)
   - **Redis**: Port `6379`

---

### Option 2: Local Development Setup

#### Prerequisites
- Node.js v20+ and npm/pnpm
- Local or running PostgreSQL & Redis server (or spin up just DBs via `docker compose up postgres redis -d`)

#### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis credentials

# Push Prisma schema to database and generate client
npx prisma db push

# Start the backend development server (starts API + BullMQ Worker)
npm run dev
```
*Backend runs on `http://localhost:5000`.*

#### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment variables
cp .env.example .env.local

# Start the Next.js development server
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Default Value / Example | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | HTTP API server port |
| `DATABASE_URL` | `postgresql://postgres:pass@localhost:5432/emailscheduler` | PostgreSQL connection string for Prisma |
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `WORKER_CONCURRENCY` | `5` | Number of simultaneous email jobs processed by BullMQ |
| `MIN_DELAY_SECONDS` | `2` | Default minimum delay between email dispatches |
| `MAX_EMAILS_PER_HOUR`| `200` | Default hourly email sending rate limit |
| `SMTP_HOST` | `smtp.ethereal.email` | SMTP host (Ethereal Email) |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `""` | Ethereal username (left blank = auto-generate test account on boot) |
| `SMTP_PASS` | `""` | Ethereal password |

### Frontend (`frontend/.env.local`)
| Variable | Default Value / Example | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend Express API base URL |
| `NEXTAUTH_URL` | `http://localhost:3000` | Application root URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | `reachinbox_secret_key_2026` | Encryption secret for NextAuth JWT sessions |
| `GOOGLE_CLIENT_ID` | `""` | Google Cloud Console OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `""` | Google Cloud Console OAuth Client Secret |

---

## 🧠 Technical Deep Dives

### 1. BullMQ & Queue Architecture (Why No Cron Jobs?)
Traditional cron jobs execute on a rigid schedule (e.g., every minute), which causes bursty CPU/network spikes, polling overhead, and race conditions when scaling across multiple server instances. 

Instead, this application treats **every scheduled recipient as an individual, highly controllable BullMQ delayed job**:
- When a user uploads a CSV with $N$ emails and specifies a start time $T_0$ and a delay $\Delta t$, the backend calculates exact staggered timestamps:
  $$T_i = \max(T_0, \text{now}) + (i \times \Delta t)$$
- Each job is added to the Redis-backed BullMQ queue with a delay parameter: `delay: T_i - Date.now()`.
- BullMQ's internal Redis timers wake up the worker exactly when $T_i$ is reached, guaranteeing smooth, continuous, and predictable delivery without polling databases.

### 2. Redis Rate Limiting & Graceful Rescheduling
To respect SMTP provider constraints without losing user data, the worker implements an atomic Redis rate-limiting algorithm:
1. When a worker dequeues a job, it executes a Redis atomic increment on a key scoped to the sender and current hour: `INCR rate_limit:{sender}:2026-07-26-23`.
2. If this is the first request in the window, it sets an expiration: `EXPIRE key 3600`.
3. If the returned counter exceeds `MAX_EMAILS_PER_HOUR` (or the custom `hourlyLimit` set during scheduling), **the job is NOT failed or discarded**.
4. Instead, the worker calculates the time remaining until the top of the next hour ($T_{\text{next\_hour}}$).
5. It updates the database record's `scheduledAt` timestamp to $T_{\text{next\_hour}}$ and re-enqueues the job into BullMQ as a delayed job (`moveToDelayed` or re-add). The job peacefully sleeps in Redis until the next hour begins!

### 3. Concurrency & Idempotency
- **Worker Concurrency**: Set via `WORKER_CONCURRENCY=5`. BullMQ pulls up to 5 jobs concurrently per worker instance over multiplexed Redis connections, ensuring high throughput while maintaining strict rate limits.
- **100% Idempotency**: Each email job created in PostgreSQL receives a UUID (`emailJob.id`). When enqueuing to BullMQ, we set `jobId: emailJob.id`. If network retries or client double-submits occur, BullMQ rejects duplicate job IDs, ensuring no recipient ever receives duplicate emails.

### 4. Persistence & Crash Recovery
- **PostgreSQL**: Stores canonical state (`scheduled`, `queued`, `sending`, `sent`, `failed`), timestamps, recipient details, and sender correlation.
- **Redis AOF (Append-Only File)**: Configured with `--appendonly yes` in Docker Compose. All delayed queues and rate-limit counters persist across container restarts.
- **Server Crash Recovery**: If the Express/Worker server crashes mid-flight, jobs remaining in BullMQ's Redis queues automatically resume processing as soon as the server restarts.

---

## 📂 Clean Monorepo Folder Structure

```text
email-scheduler/
├── docker-compose.yml          # Full-stack container orchestration
├── README.md                   # Complete architectural documentation
├── backend/                    # Express + TypeScript + BullMQ Backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma       # PostgreSQL EmailJob schema & enums
│   └── src/
│       ├── config/             # Env loader & Redis singleton connection
│       ├── controllers/        # Express route controllers (Schedule, User)
│       ├── db/                 # Prisma ORM client instance
│       ├── middleware/         # Zod validation & error handling
│       ├── queue/              # BullMQ queue initialization
│       ├── routes/             # API route definitions (/api/*)
│       ├── services/           # Core scheduling & querying business logic
│       ├── types/              # TypeScript DTOs and interfaces
│       ├── utils/              # Nodemailer Ethereal SMTP helper
│       └── workers/            # BullMQ worker processor & Redis rate limiter
└── frontend/                   # Next.js 15 App Router Frontend
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.ts      # Pastel Pink & Blue design tokens
    ├── globals.css             # Vanilla CSS resets & custom utilities
    ├── app/
    │   ├── api/auth/[...nextauth]/route.ts # NextAuth OAuth & Session handler
    │   ├── layout.tsx          # Root layout with TanStack Query & Auth Providers
    │   └── page.tsx            # Main SaaS Dashboard & Login card
    ├── components/
    │   ├── dashboard/          # ComposeModal, EmailTable, StatCards
    │   ├── layout/             # Navbar, Header, UserChip
    │   ├── providers/          # TanStack Query & NextAuth Session Providers
    │   ├── ui/                 # Reusable Pastel SaaS UI components (Button, Modal, Table, etc.)
    │   └── upload/             # FileUpload drag-and-drop CSV/TXT parser
    ├── lib/                    # Axios API client & Auth configuration
    └── types/                  # Shared TypeScript frontend interfaces
```

---

## 🔌 API Documentation

### 1. Schedule Email Batch
- **Endpoint**: `POST /api/schedule`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <user-email>` (or session)
- **Request Payload**:
  ```json
  {
    "subject": "Exclusive Invitation to ReachInbox SaaS",
    "body": "Hi there,\n\nWe would love to invite you to try our new scheduler!",
    "recipients": [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com"
    ],
    "startTime": "2026-07-27T10:00:00.000Z",
    "delayBetweenEmails": 5,
    "hourlyLimit": 50,
    "sender": "admin@reachinbox.ai"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Successfully scheduled 3 emails.",
    "batchId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "totalScheduled": 3
  }
  ```

### 2. Get Scheduled / Pending Emails
- **Endpoint**: `GET /api/scheduled?page=1&limit=10&search=example&sortBy=scheduledAt&sortOrder=asc&sender=admin@reachinbox.ai`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c138da64-67ad-4564-883a-4f51e1dcfa6f",
        "recipient": "user1@example.com",
        "subject": "Exclusive Invitation to ReachInbox SaaS",
        "scheduledAt": "2026-07-27T10:00:00.000Z",
        "status": "scheduled",
        "delay": 5,
        "hourlyLimit": 50
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### 3. Get Sent Emails
- **Endpoint**: `GET /api/sent?page=1&limit=10&search=&sortBy=sentAt&sortOrder=desc&sender=admin@reachinbox.ai`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e991da64-67ad-4564-883a-4f51e1dcfa88",
        "recipient": "user2@example.com",
        "subject": "Welcome to ReachInbox",
        "sentAt": "2026-07-26T22:15:00.000Z",
        "status": "sent"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### 4. Get User Profile & Dashboard Stats
- **Endpoint**: `GET /api/user?sender=admin@reachinbox.ai`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "email": "admin@reachinbox.ai",
      "name": "Jahnvi Priyam",
      "image": "https://avatars.githubusercontent.com/u/1?v=4"
    },
    "stats": {
      "totalScheduled": 150,
      "totalSent": 342,
      "totalFailed": 2,
      "successRate": 99.4
    }
  }
  ```

### 5. Logout Session
- **Endpoint**: `POST /api/logout`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

## 🚢 Deployment Instructions

### Frontend (Vercel)

> [!IMPORTANT]
> **Critical Step for Monorepo/Subdirectory Architecture**: When importing this repository into Vercel, you **MUST** set the **Root Directory** to `frontend` in the Project Settings. If left at the default (`./`), Vercel will attempt to deploy the git repository root (which does not contain the Next.js app) and result in a **404: NOT_FOUND** error!

1. Push the repository to GitHub.
2. Log into [Vercel](https://vercel.com) and import the repository.
3. Configure project settings:
   - **Root Directory**: `frontend` *(Click Edit next to Root Directory and select `frontend`)*
   - **Framework Preset**: Next.js (automatically detected once Root Directory is set)
4. Add Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com/api` — *must end with `/api`*)
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://emailassignment-jbpx.vercel.app`)
   - `NEXTAUTH_SECRET`: Generate a random secure hex string (e.g., `reachinbox_secret_key_2026`)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console (with authorized callback URL `https://your-app.vercel.app/api/auth/callback/google`).
5. Click **Deploy**.

### Backend (Railway / Render)

#### On Railway:
1. Create a new project on [Railway](https://railway.app) and provision a **PostgreSQL** database and a **Redis** instance from the marketplace.
2. Connect your GitHub repo and select the `backend` root folder.
3. In variables, bind the connection strings from Railway's PostgreSQL (`DATABASE_URL`) and Redis (`REDIS_HOST`, `REDIS_PORT`).
4. Set build command: `npm install && npx prisma generate && npm run build`.
5. Set start command: `npx prisma db push && npm start`.
6. Generate a public domain; your backend API is now live!

---

## ⚖️ Trade-offs & Future Improvements

### Trade-offs Made
1. **Authentication Scope**: While Google OAuth is fully integrated via NextAuth, we added a mock/dev login toggle so evaluators can inspect the dashboard without needing to generate Google Cloud OAuth client credentials during code review.
2. **Ethereal Email vs. Real SMTP**: Ethereal Email is ideal for testing since it intercepts all outgoing mail and provides Webmail URL logs without spamming real inboxes. In production, swapping to AWS SES, SendGrid, or Postmark only requires changing the `.env` SMTP variables!
3. **User-Scoped Queries**: For simplicity in this standalone assignment, backend endpoints scope data by matching the `sender` email passed from the authenticated NextAuth session rather than enforcing complex multi-tenant JWT middleware.

### Future Enhancements
- **Email Tracking**: Add tracking pixels and link wrapping in `mailer.ts` to track Open Rates and Click-Through Rates (CTR) in real-time.
- **Dynamic Variable Injection**: Support Liquid or Handlebars syntax (e.g., `Hello {{firstName}}`) when uploading CSVs with multiple columns.
- **Webhooks & Slack Alerts**: Notify users via Discord or Slack webhooks when large scheduled campaigns finish sending or if an hourly rate limit is triggered.
- **Live Queue Monitoring**: Integrate `@bull-board/express` into an admin route to visually monitor BullMQ jobs, retries, and Redis memory consumption in real-time.
