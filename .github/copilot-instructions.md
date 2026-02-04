# GitHub Copilot / AI Agent Instructions for this repo ✅

Purpose: Help AI agents make productive, low-risk changes quickly by documenting the project structure, conventions, and concrete commands to run and test changes.

## Quick Start / Important scripts 🔧

- Install: `npm install`
- App dev server (Next.js + TurboPack): `npm run dev` (runs on port **9002** by default)
- AI/GenKit local dev: `npm run genkit:dev` (start GenKit with `src/ai/dev.ts`)
- Watch GenKit for interactive iteration: `npm run genkit:watch`
- Build: `npm run build` (NOTE: script uses `NODE_ENV=production next build` which is POSIX-style; on Windows PowerShell use `$env:NODE_ENV='production'; npx next build` or add `cross-env`)
- Lint & typecheck: `npm run lint` and `npm run typecheck`

## High-level architecture (big picture) 🧭

- Frontend: Next.js App Router in `src/app/` (server components by default; explicit `'use client'` marks client components).
- UI primitives live in `src/components/ui/` (Tailwind + Radix patterns used).
- Backend / Data: API routes implemented inside `src/app/api/**` (each route exports `GET` / `POST` etc and returns `NextResponse`).
- DB: MongoDB via Mongoose. Models live in `src/models/` and are used by routes (see `src/models/Medication.ts`, `src/models/IntakeLog.ts`).
- AI: GenKit usage is centralized in `src/ai/genkit.ts` (currently uses `@genkit-ai/google-genai` plugin and model `googleai/gemini-2.5-flash`). Flows live in `src/ai/flows/` (example: `smart-schedule-suggestions.ts`).

## Key conventions & patterns to follow 🧩

- Path alias: `@/*` maps to `./src/*` (see `tsconfig.json`). Prefer `@/` imports for repo-local modules.
- Mongoose model export pattern to avoid re-compilation in dev: `mongoose.models.Model || mongoose.model(...)`. Keep it.
- DB connection caching: `src/lib/db.ts` uses a `global.mongoose` cache — do not re-create multiple connections.
- API routes always call `await connectDB()` before DB operations (follow the pattern in `src/app/api/*.ts`).
- Next client/server split: add `'use client'` at the top of client components. If a file uses browser APIs or hooks, it must be a client component.
- GenKit flows: use `ai.definePrompt` + `ai.defineFlow` and `z` schemas exported from GenKit (see `src/ai/flows/smart-schedule-suggestions.ts`).

## Environment & credentials 🔐

- Required: `DATABASE_URL` (used by `src/lib/db.ts`). If missing the app will throw at startup.
- GenKit (Google plugin) requires Google credentials as per `@genkit-ai/google-genai` setup — provide credentials (e.g., `GOOGLE_APPLICATION_CREDENTIALS` or API key) via your environment or secret manager.
- Local env: use `.env` or `.env.local` for Next (and `dotenv` is used in `backend/server.js`). Never commit secrets.

## How to iterate safely (recommended dev loop) 🔄

1. Run `npm run dev` to hot-reload the Next app (port 9002).
2. When editing AI flows: run `npm run genkit:watch` to get quick feedback and iterate on prompts and schemas.
3. After changing types or TS signatures, run `npm run typecheck`.
4. Before PR: run `npm run lint` and ensure no new environment assumptions are introduced.

## Quick examples (use these as templates) 📎

- API route pattern: `src/app/api/medications/route.ts` — `export async function GET() { await connectDB(); const medications = await Medication.find({}); return NextResponse.json(medications); }`
- GenKit flow example: `src/ai/flows/smart-schedule-suggestions.ts` — uses `z` schemas for input/output and `ai.definePrompt` + `ai.defineFlow`.

## CI / automation notes ⚠️

- There is a GitHub Actions workflow at `.github/workflows/webpack.yml` (runs `npm install` + `npx webpack`). If you change build steps (Next.js build) update CI accordingly.

## Where to look first if you need context 🗺️

- App entry & layout: `src/app/` (pages & layouts)
- API + DB: `src/app/api/`, `src/lib/db.ts`, `src/models/`
- AI flows: `src/ai/flows/` and `src/ai/genkit.ts`
- UI primitives: `src/components/ui/`

---

If anything above is unclear or you'd like more detail (examples of unit-test patterns, suggested CI changes, or environment setup steps for GenKit credentials), tell me which area to expand and I’ll update the doc. 💬
