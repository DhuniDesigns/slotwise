# Slotwise

A production-oriented scaffold for a solo-professional appointment scheduler. It includes a public booking flow, host dashboard, availability editor, transactional email templates, and a Supabase schema with database-enforced overlap protection.

## Start locally

1. Install Node.js 22+ and run `npm install` (this creates the initial lockfile; commit it).
2. Copy `.env.example` to `.env.local` and add Supabase/Resend credentials.
3. Run `npx supabase start`, then `npx supabase db reset`.
4. Run `npm run dev` and open `http://localhost:3000`.

The UI works with sample data before services are configured. API mutations return a configuration error until Supabase credentials are present.

## Architecture

- `src/app`: public, auth, dashboard, and API route surfaces
- `src/lib/availability`: deterministic, timezone-aware candidate slot generation
- `src/lib/supabase`: browser/server client boundaries
- `src/emails`: HTML and plain-text message renderers
- `supabase/migrations`: relational schema, RLS, and atomic booking RPC
- `tests/e2e`: browser smoke tests

All persisted appointment instants use `timestamptz`. Public writes call a `create_booking` database function, where a PostgreSQL exclusion constraint prevents concurrent overlapping active appointments. Email jobs are inserted into `email_events` in the same transaction and are delivered separately.

## Quality gates

Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run test:e2e`.
