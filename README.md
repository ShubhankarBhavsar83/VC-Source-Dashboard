# Scout — VC Intelligence Interface
A thesis-driven sourcing interface for venture capital deal flow. Built as a take-home assignment.

# Live Demo
-   Deployed URL: [add Vercel URL here]
-   GitHub: https://github.com/ShubhankarBhavsar83/VC-Source-Dashboard

# Setup
| Prerequisite | Details |
| --- | --- |
| Node.js | 18+ |
| MongoDB Atlas account | (free tier works) |
| Groq API key | console.groq.com (free, no credit card) |
| Jina AI key (optional) | jina.ai for higher scrape rate limits |

# Environment Variables
-   Create .env.local in the project root:
-   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vc-sourcing?retryWrites=true&w=majority
-   GROQ_API_KEY=gsk_...
-   JINA_API_KEY=jina_...
-   GEMINI_API_KEY=...
-   OPENAI_API_KEY=sk-...

MongoDB note: URL-encode any special characters in your password. In Atlas Network Access, whitelist 0.0.0.0/0 to allow connections from Vercel.

# Install & Run:
npm install
npm run dev

-   Open [http://localhost:3000](http://localhost:3000).

-   The database seeds automatically on first run with 20 mock companies across sectors and stages.


# Features:

# Core:

| Feature | Notes |
| --- | --- |
| Company database | 20 seeded companies, MongoDB-backed, server-side search + pagination |
| Search & filters | Full-text search, multi-select stage and sector filters, URL-restorable state |
| Live enrichment | Scrapes company website via Jina Reader, extracts structured data with Groq LLaMA 3.3 70B |
| Thesis scoring | Score companies 1–100 against a custom investment thesis with matched/missing criteria |
| Enrichment history | Every enrichment run is stored per-thesis — compare scores across multiple theses |
| Notes | Per-company analyst notes, persisted to MongoDB |
| Lists | Create named lists, bulk-add companies, export as CSV or JSON |
| Saved searches | Save and re-run filter combinations |
| Global search | ⌘K / Ctrl+K keyboard shortcut, live results with 250ms debounce |

# Power-User Touches:
-   Bulk actions: Select multiple companies in the table, add to list or export in one click.

-   Thesis panel: Slide-out sidebar for creating and switching between fund theses; active thesis drives scoring on all enrichments.

-   Enrichment tab empty state: Guided CTA when a company hasn't been enriched yet.

-   Cache feedback: Info alert when re-enriching returns a cached result, with instruction to force a fresh fetch.

-   Collapsed sidebar search: Search icon with tooltip remains accessible when sidebar is collapsed.

## Architecture:

# Stack:

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | MUI v5 + MUI DataGrid v7 |
| State | Zustand (persisted to localStorage) |
| Database | MongoDB via Mongoose v8 |
| Scraping | Jina Reader (r.jina.ai) |
| AI Extraction | Groq (primary) -> Gemini -> OpenAI |
| Fonts | DM Sans + IBM Plex Mono |
| Deploy | Vercel |

# Data flow — enrichment:

-   Client POSTs /api/enrich { companyId, url, thesis?, thesisId?, thesisName? }
        -> Check enrichmentHistory[] for cached record matching thesisId
        -> Cache hit: return immediately
        -> Cache miss:
            1. Jina scrape -> Groq extraction -> build EnrichmentRecord
            2. MongoDB: $set enrichment + $push enrichmentHistory (idempotency guarded)
            3. Return { enrichment, thesisScore, record, enrichmentHistory }
-   Client updates local state from server response (no reload needed)

# API routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/companies` | `GET` | List with search, filter, pagination |
| `/api/companies/[id]` | `GET`, `PATCH` | Fetch or update a single company |
| `/api/enrich` | `POST` | Scrape + extract + score + cache |

# Key Engineering Decisions:
-   Enrichment history per thesis: Rather than overwriting a single enrichment field, each run appends an EnrichmentRecord to enrichmentHistory[] tagged with the thesis ID. This lets analysts compare how the same   company scores against different theses over time.

-   Idempotent writes: Before pushing to enrichmentHistory, the route re-fetches the document and checks for an existing record with the same thesisId. This prevents duplicate records from React 18 Strict Mode double-invocation in development.

-   Provider cascade: GROQ_API_KEY -> GEMINI_API_KEY -> OPENAI_API_KEY. Groq is free with no rate-limit issues on the free tier; the others are fallbacks.

-   Params async (Next.js 15): Route segment params is now a Promise in Next.js 15. Both GET and PATCH handlers in /api/companies/[id] await params before use.


# Project Structure

- **`src/`**
  - **`app/`**
    - **`api/`**
      - **`companies/`**
        - `route.ts` — GET `/api/companies`
        - `[id]/route.ts` — GET, PATCH `/api/companies/[id]`
      - **`enrich/`**
        - `route.ts` — POST `/api/enrich`
    - **`companies/`**
      - `page.tsx` — Company table with bulk actions
      - `[id]/page.tsx` — Company profile + enrichment tabs
    - **`lists/`**
      - `page.tsx` — List management
      - `[id]/page.tsx` — List detail with export
    - **`saved/`**
      - `page.tsx` — Saved searches
    - `AppShell.tsx` — Root layout with sidebar
    - `layout.tsx`
  - **`components/`**
    - **`layout/`**
      - `AppShell.tsx` — Sidebar, nav, search trigger
      - `GlobalSearch.tsx` — ⌘K search overlay
      - `ThesisPanel.tsx` — Thesis creation + switching
    - **`companies/`**
      - `StageChip.tsx`
      - `ScoreBadge.tsx`
    - **`enrichment/`**
      - `EnrichmentHistory.tsx` — Collapsible per-thesis history cards
      - `EnrichmentPanel.tsx`
  - **`lib/`**
    - `mongodb.ts` — Connection singleton
    - `models/Company.ts` — Mongoose schema
    - `seed.ts` — 20 mock companies
    - `theme.ts` — Dark MUI theme
  - **`store/`**
    - `index.ts` — Zustand store
  - **`types/`**
    - `index.ts` — Shared TypeScript types



# Stretch goals completed

- MongoDB entity store with Mongoose schemas
- Thesis scoring engine (1–100, matched/missing criteria, per-thesis history)
- Enrichment history — multiple runs stored and compared per thesis
- Bulk actions — select rows, add to list, export CSV/JSON
- Keyboard-first search (`Ctrl + K`)
- Idempotent enrichment writes

# Future Scope

- Vector similarity search / embeddings
- Background job queue for enrichment
- CRM / Slack / Airtable integrations
- Live signal extraction beyond what Groq infers from scraped content

