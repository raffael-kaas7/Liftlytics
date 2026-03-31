# Liftlytics

**A sharp, local-first strength training tracker for people who actually lift.**

Liftlytics is built for one job: make logging workouts fast enough to use every day, then turn that data into useful strength insights you will actually check. No signup wall. No cloud dependency. No bloated wellness fluff. Just sessions, sets, progression, and clean analytics.

If you want a personal gym log that feels like a real product instead of a spreadsheet with buttons, this is the project.

## Why Liftlytics

Most fitness apps optimize for breadth.
Liftlytics optimizes for repeat use.

That means:

- fast session logging
- low-friction editing
- clear strength KPIs
- useful charts
- local SQLite persistence
- a clean codebase that is easy to extend

## What makes it interesting

- **Local-first by default**: your data lives with you
- **Built for lifters**: warm-up sets are excluded from PR math and KPI logic
- **Actually useful analytics**: estimated 1RM, volume trends, PR detection, momentum, milestone suggestions
- **Strong MVP scope**: daily use comes first, social or shareable features come later
- **Open-source friendly**: clear structure, TypeScript throughout, business logic separated from UI

## Core features

- Dashboard with:
  - total sessions
  - total volume lifted
  - total exercises logged
  - recent PR count
  - workout frequency chart
  - training volume chart
  - recent sessions
  - top improving exercises
- Fast workout logging flow:
  - create a new session
  - add exercises from a searchable list
  - create new exercises inline
  - log reps, weight, set notes, and warm-up flags
  - reorder exercises
  - edit or remove sets quickly
- Session history:
  - browse all sessions
  - filter by exercise
  - filter by date range
  - inspect full session details
  - edit and delete sessions
- Exercise detail pages:
  - PRs
  - estimated 1RM trend
  - best set history
  - volume over time
  - session count
  - recent performances
  - notes history

## Analytics that matter

All KPI and progression logic lives in [src/lib/analytics.ts](/home/raffael/workspace/Github/Liftlytics/src/lib/analytics.ts).

Implemented in v1:

- Estimated 1RM with Epley formula
  - `1RM = weight * (1 + reps / 30)`
- Best estimated 1RM all time
- Best weight ever lifted
- Best single-set volume
- Total lifetime volume
- Average reps at repeated working weights
- Session count
- Last performed date
- Training consistency by active weeks
- Current projected 1RM from the last 30 days
- All-time projected 1RM
- Recent momentum using last 30 days vs previous 30 days
- Rep PR and weight PR detection
- Suggested next milestone based on recent best working set

Important:

- warm-up sets are excluded from PR and KPI calculations by default
- charts and badges are designed to be informative, not decorative

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Recharts
- SQLite
- Prisma
- date-fns

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npm run db:setup
npm run dev
```

Then open `http://localhost:3000`.

## Seeded demo data

If the database is empty, Liftlytics seeds example sessions and common exercises so the charts and KPI views are useful immediately.

Included exercises:

- Bench Press
- Incline Bench Press
- Squat
- Deadlift
- Overhead Press
- Pull-Up
- Barbell Row
- Lat Pulldown
- Leg Press
- Romanian Deadlift
- Dumbbell Curl
- Triceps Pushdown
- Lateral Raise

## Project structure

- [prisma/schema.prisma](/home/raffael/workspace/Github/Liftlytics/prisma/schema.prisma): database schema
- [prisma/migrations/202603312140_init/migration.sql](/home/raffael/workspace/Github/Liftlytics/prisma/migrations/202603312140_init/migration.sql): initial SQL migration
- [scripts/setup-db.ts](/home/raffael/workspace/Github/Liftlytics/scripts/setup-db.ts): local SQLite bootstrap
- [src/lib/data.ts](/home/raffael/workspace/Github/Liftlytics/src/lib/data.ts): Prisma CRUD and queries
- [src/lib/analytics.ts](/home/raffael/workspace/Github/Liftlytics/src/lib/analytics.ts): KPI logic and strength insights
- [src/components/session/session-form.tsx](/home/raffael/workspace/Github/Liftlytics/src/components/session/session-form.tsx): workout logging and editing UI
- [src/app/page.tsx](/home/raffael/workspace/Github/Liftlytics/src/app/page.tsx): dashboard
- [src/app/exercises/[id]/page.tsx](/home/raffael/workspace/Github/Liftlytics/src/app/exercises/[id]/page.tsx): exercise analytics page

## Scripts

- `npm run dev` starts the app in development
- `npm run build` builds the production app
- `npm run start` serves the production build
- `npm run lint` runs ESLint
- `npm run prisma:generate` regenerates Prisma client
- `npm run prisma:migrate` runs Prisma migrations
- `npm run prisma:seed` seeds example data
- `npm run db:setup` creates the local SQLite schema and seeds data

## Contributing

Contributions are very welcome, especially if you care about:

- strength training workflows
- data modeling for exercise tracking
- polished UI/UX
- analytics and visualization
- keyboard-friendly input flows
- export/import and local-first tooling

Good first areas to contribute:

- exercise templates and saved workout splits
- better mobile logging ergonomics
- CSV export/import
- richer progression comparisons
- test coverage for analytics logic
- more robust PR explanation UI

If you open an issue or PR:

- keep the core product focused on logging and progress review
- prefer practical features over novelty features
- keep analytics logic centralized instead of spreading calculations through components
- preserve the low-friction feel of the logging flow

## Why star this project

If this repo is interesting to you, a star helps in three ways:

- it makes the project easier for other lifters and builders to discover
- it signals that focused, local-first fitness tools are worth building
- it creates momentum for more contributors to jump in

## Roadmap

Planned next steps:

- shareable progress cards
- workout templates
- import/export
- PWA support
- richer comparisons across time windows
- optional sync without sacrificing local-first usage

## Current status

Liftlytics is already usable as a real personal strength log.
The current MVP is aimed at solo daily use first, then thoughtful expansion into a stronger open-source fitness tracking project.

If that resonates, star it, open an issue, or ship a feature.
