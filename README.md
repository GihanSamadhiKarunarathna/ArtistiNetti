# ArtistiNetti

A Finland-first marketplace connecting artists/bands, booking agents, and event
clients — discovery, availability, inquiries, quotes, and (mock) payments in
one platform. See `/Users/gihan/.claude/plans/shimmering-kindling-planet.md`
for the full architecture write-up.

## Stack

Next.js (App Router) · TypeScript · Prisma + Postgres · Auth.js v5 · next-intl
(fi/en) · Tailwind + shadcn/ui · Vitest + Playwright.

## Getting started

```bash
npm install

# Start a local Postgres instance (no Docker needed)
npm run db:dev

# Point .env at it (see the connection string db:dev prints), then:
npm run db:migrate
npm run db:seed   # creates admin@artistinetti.fi / ChangeMe123!

npm run dev
```

Open http://localhost:3000. Fi is the default (unprefixed) locale; English is
available at `/en`.

### Email & file uploads in local dev

- No `RESEND_API_KEY` is required to develop locally: magic-link sign-in URLs
  (used for guest/client login) are printed to the dev server console instead
  of being emailed.
- No `BLOB_READ_WRITE_TOKEN` is required either: uploaded files fall back to
  `/public/uploads` on disk. Set both env vars to switch to real Resend and
  Vercel Blob in production.
- Payments run against an in-memory `MOCK` provider (see `src/lib/payments`)
  until real Stripe/Paytrail/MobilePay credentials and adapters are added.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `start` | Production build / server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests (auto-starts the app) |
| `npm run db:dev` | Start/attach to the local Postgres dev server |
| `npm run db:migrate` | Create & apply a Prisma migration |
| `npm run db:seed` | Seed the first admin user |
| `npm run db:studio` | Prisma Studio |

## Project structure

```
prisma/               Schema, migrations, seed script
src/
  app/[locale]/        Route groups: (public), (client), (artist), (agent), (admin)
  components/ui/       shadcn/ui primitives
  components/shared/   Cross-role building blocks (DataTable, StepperForm bits, uploads)
  components/dashboard/ DashboardShell (sidebar/topbar shell for role dashboards)
  components/features/ Feature-specific UI, grouped by domain
  lib/                 auth, db, payments, storage, validation, i18n, constants
  server/actions/      "use server" mutations (thin, call into services)
  server/services/     Business logic, reused by actions and (future) webhooks
messages/              fi.json / en.json translation catalogs
tests/e2e/             Playwright specs (the money-path flows)
tests/unit/            Vitest specs
```

## Status

This is the Phase 1 (MVP) build: registration for all roles, artist public
profiles + media kit, availability calendar, discovery directory, guest
inquiry wizard, quote creation, mock-payment quote acceptance, gig messaging,
a thin agent multi-artist view, and admin approvals/metrics.

Not yet built (by design — see the architecture doc): band split payouts,
the Finnish expense/travel logger, CRM/CSV export, real escrow release, VAT
invoicing, agent commission withholding, the venue database, the
dispute/cancellation engine, and GMV analytics. The data model already has
room for all of these (see `prisma/schema.prisma` comments).
