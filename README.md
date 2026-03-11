# FootballOurPlayers

Production-ready football tactical analysis platform with aggregated (non-event) stats.

## Stack

- Next.js App Router + TypeScript
- PostgreSQL (Neon)
- Drizzle ORM + SQL migrations
- TailwindCSS + shadcn-style UI components
- Recharts

## Core Features

- Admin management:
  - `/admin/seasons`
  - `/admin/competitions`
  - `/admin/teams`
  - `/admin/players`
  - `/admin/matches`
  - `/admin/stats` (competition -> match -> team -> player workflow)
- Dashboard:
  - `/dashboard`
  - competition totals
  - match evolution
  - player comparisons
  - offensive distribution
  - radar profile
- Public report:
  - `/report/player/[id]`
  - shareable direct URL
  - no admin navigation

## Database

Drizzle schema + initial migration include:

- `seasons`
- `competitions`
- `teams`
- `team_competitions`
- `players`
- `matches`
- `player_match_stats`
- `goalkeeper_match_stats`
- `team_match_stats`

## Dynamic Metrics

Calculated in code, never persisted:

- Percentages:
  - pass accuracy
  - cross accuracy
  - duel success rate
  - shot accuracy
- Per 90:
  - `(stat / minutes_played) * 90`

## Local Setup

1. Configure environment:
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` with Neon/PostgreSQL URL
2. Install dependencies:
   - `npm install`
3. Run migrations:
   - `npm run db:migrate`
4. Seed example data:
   - `npm run db:seed`
5. Start development server:
   - `npm run dev`

## Useful Scripts

- `npm run dev`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`
- `npm run db:seed`

## Project Structure

- `app/` routes and layouts
- `components/` UI, chart, and layout components
- `actions/` server actions
- `lib/` queries, stat calculators, validators
- `db/` schema, migration SQL, database client
- `scripts/seed.ts` sample data
