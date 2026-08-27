# Abhyaas Knowledge Base

Abhyaas is a highly personalized, AI-powered full-stack learning path recommender. This knowledge base serves as an AI-optimized architectural map for future agents.

## Architecture & Workflows

**Core Stack:** Next.js (App Router), React, Tailwind CSS, Supabase (Auth + PostgreSQL RLS), Google Gemini API.

### Systems
- **[Frontend UI](./frontend.md):** Next.js routing, dark-mode components, interactive Recharts, and Shadcn UI.
- **[Authentication & Database](./database.md):** Supabase SSR configuration, PostgreSQL schema, RLS policies, cascading deletes.
- **[AI Integration](./ai.md):** Gemini-powered roadmap generator and AI Tutor endpoints.

### Request Flow (Auth)
1. User submits login via `/login` -> Supabase Client (`@supabase/ssr`)
2. Server validates Auth cookies via `web/utils/supabase/server.ts`
3. Next.js middleware guards `(dashboard)` routes.
4. Unauthenticated users are redirected to `/login`.

### Workflows
- **Roadmap Generation:** Goal submission -> Next.js API Route -> Gemini Service -> Parse JSON -> Insert into `roadmaps` PostgreSQL table.
- **Account Deletion:** User action -> Cascade delete all records in Postgres (Profiles, Roadmaps, XP) -> Delete Supabase Auth Identity.

## Directory Map
- `web/`: Next.js frontend/backend monorepo
  - `src/app/(auth)/`: Login, Register, Recovery
  - `src/app/(dashboard)/`: Protected dashboard UI, games, AI tutor
  - `src/components/`: Reusable Tailwind components (Sidebar, TopBar, Charts)
  - `src/utils/supabase/`: SSR configuration
- `supabase/`: Database configuration
  - `migrations/`: Schema definitions and RLS policies
- `brain/`: System knowledge base (You are here)
