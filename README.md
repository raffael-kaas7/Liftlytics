# Liftlytics

**A sharp strength training tracker built for fast gym logging, hosted web access, and a future native mobile app.**

Liftlytics is designed around one core idea: logging workouts should be fast enough to do between sets, and the analytics should be useful enough to actually change how you train.

The current version is a server-hosted Next.js app with Postgres, basic authentication, PWA support, and a deliberately separated domain layer so iOS and Android apps can later reuse the same business logic.

## Why Liftlytics

Most fitness apps try to do everything. Liftlytics focuses on strength progression:

- fast workout logging
- clean session history
- estimated 1RM tracking
- volume trends
- PR detection
- milestone suggestions
- local-first native mobile path later
- optional server sync path later

## Current Architecture

```text
src/domain
  Pure business logic, types, validation, analytics, seed definitions

src/server/repositories
  Storage abstraction and Prisma/Postgres implementation

src/server/services
  Application use cases such as creating sessions and loading analytics data

src/app
  Next.js routes, pages, API handlers, and hosted web UI
```

The important rule is:

```text
UI can change.
Storage can change.
Business logic should not.
```

That means a future Expo mobile app can reuse `src/domain` logic and replace the web storage implementation with a phone-local SQLite repository.

## What “Repository / Service Layer” Means

If you come from embedded development, think of it like this:

- **Domain layer**: pure algorithms and data structures, similar to platform-independent control logic
- **Repository interface**: a storage abstraction, similar to a driver interface or HAL
- **Prisma repository**: the concrete Postgres driver implementation
- **Service layer**: application orchestration, similar to code that validates commands, calls the right driver, and returns a clean result
- **UI/API routes**: presentation and transport only

Today:

```text
Next.js UI -> WorkoutService -> WorkoutRepository interface -> Prisma/Postgres
```

Later on mobile:

```text
Expo UI -> WorkoutService -> WorkoutRepository interface -> phone SQLite
```

The app behavior stays consistent because both implementations obey the same repository contract.

## Core Features

- Dashboard with sessions, volume, unique exercises, recent PRs, frequency charts, volume charts, recent sessions, and improving exercises
- Fast workout logging with searchable exercises, inline exercise creation, compact set tables, warm-up flags, notes, and exercise ordering
- Session history with exercise and date filters
- Session detail pages with editing, deletion, clear set display, and PR badges
- Exercise library with dedicated analytics pages
- Exercise analytics with estimated 1RM trends, best set history, total volume, recent performances, and notes history
- Basic HTTP authentication for private hosted use
- PWA manifest for install-like behavior on mobile browsers

## Analytics

Core strength logic lives in [`src/domain/analytics.ts`](src/domain/analytics.ts).

Implemented:

- Estimated 1RM using Epley formula: `weight * (1 + reps / 30)`
- Set volume: `weight * reps`
- Best estimated 1RM
- Best weight lifted
- Best single-set volume
- Lifetime volume
- Average reps at repeated working weights
- Session count
- Last performed date
- Consistency by active training weeks
- Current projected 1RM from the last 30 days
- Recent momentum comparing last 30 days vs previous 30 days
- Rep PR, weight PR, estimated 1RM PR, and volume PR detection
- Simple next milestone suggestions

Warm-up sets are excluded from PR and KPI calculations by default.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Recharts
- Prisma
- Postgres
- date-fns

## Quick Start

### 1. Configure environment

Copy the example environment file:

```bash
cp .env.example .env
```

Default development values:

```text
DATABASE_URL="postgresql://liftlytics:liftlytics@localhost:5432/liftlytics?schema=public"
BASIC_AUTH_USERNAME="admin"
BASIC_AUTH_PASSWORD="change-me-before-deploy"
BASIC_AUTH_USERNAME_2="training-partner"
BASIC_AUTH_PASSWORD_2="change-me-too"
```

Change both passwords before exposing the app outside your machine.

### 2. Start Postgres

Using Docker:

```bash
docker compose up -d postgres
```

Check that Postgres is running:

```bash
docker compose ps
docker compose logs postgres
```

You want to see that Postgres is ready to accept connections.

### 3. Install dependencies and prepare the database

```bash
npm install
npx prisma generate
npm run db:setup
```

`npm run db:setup` applies the checked-in migrations and seeds example exercises/sessions.

### 4. Start on localhost

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5. Log in

Open the app and sign in with the credentials from `.env`.

The default development login is:

```text
Username: admin
Password: change-me-before-deploy
```

An optional second login can also be configured:

```text
Username: training-partner
Password: change-me-too
```

Both logins access the same shared Liftlytics instance and the same training database. This is useful for a partner or second device, but it is not yet separate per-user data ownership.

## Running On Your Local Network

If you want to use Liftlytics from your phone while your laptop is running the app, bind the Next.js server to your LAN interface.

Recommended:

```bash
APP_HOST=0.0.0.0 APP_PORT=3000 npm run dev:host
```

Then find your laptop IP:

```bash
hostname -I
```

If your laptop IP is `192.168.0.3`, open this on your phone:

```text
http://192.168.0.3:3000
```

You can also bind directly to a specific IP:

```bash
APP_HOST=192.168.0.3 APP_PORT=3000 npm run dev:host
```

For a production build on your local network:

```bash
npm run build
APP_HOST=0.0.0.0 APP_PORT=3000 npm run start:host
```

Important:

- Your phone and laptop must be on the same network.
- `192.168.x.x` addresses only work inside your local network.
- If your phone cannot connect, check your firewall and make sure port `3000` is allowed.

## Where Data Is Stored

When you run the app locally with Docker Postgres:

```text
Phone browser
  -> Next.js app running on your laptop
  -> Prisma
  -> Postgres container
  -> Docker volume postgres-data
```

So if you add a session from your phone, the data is stored in the Postgres container volume on your laptop, not on the phone.

This keeps the data:

```bash
docker compose down
```

This deletes the database volume and your local data:

```bash
docker compose down -v
```

Do not use `-v` unless you intentionally want to wipe the local database.

## Deployment Shape

The intended hosted setup is:

```text
Next.js server
Postgres database
Basic auth for private use
HTTPS reverse proxy or platform TLS
```

For access from any network, deploy to a server with a public IP or domain. A typical simple setup is:

```text
VPS or app host
  -> HTTPS reverse proxy such as Caddy or Nginx
  -> Next.js app
  -> Postgres database
```

Required production environment variables:

```text
DATABASE_URL
BASIC_AUTH_USERNAME
BASIC_AUTH_PASSWORD
BASIC_AUTH_USERNAME_2 optional
BASIC_AUTH_PASSWORD_2 optional
```

On the server, the basic flow is:

```bash
npm install
npx prisma generate
npm run db:setup
npm run build
APP_HOST=0.0.0.0 APP_PORT=3000 npm run start:host
```

Then put HTTPS in front of the app using your hosting platform, Caddy, Nginx, or another reverse proxy.

Public deployment notes:

- Use strong auth passwords.
- Use HTTPS. Do not expose login over plain HTTP on the public internet.
- Back up Postgres regularly.
- For more than personal/private use, replace basic auth with real user accounts.
- `192.168.0.3` is not useful for public deployment; it is only a private LAN address.

### Deployment Options

Good options:

- Small VPS with Docker Compose
- Hetzner, Netcup, DigitalOcean, Linode, or similar
- Railway/Fly/Render-style hosting with persistent Postgres
- Tailscale for private access without exposing the app publicly

Avoid for the current app unless adapted:

- Serverless hosting without a persistent database connection strategy
- Public deployment without HTTPS
- Router port forwarding from your laptop as the long-term solution

## Project Structure

- [`src/domain/types.ts`](src/domain/types.ts): framework-independent domain types
- [`src/domain/analytics.ts`](src/domain/analytics.ts): strength KPI logic
- [`src/domain/validation.ts`](src/domain/validation.ts): shared validation schemas
- [`src/server/repositories/workout-repository.ts`](src/server/repositories/workout-repository.ts): storage interface
- [`src/server/repositories/prisma-workout-repository.ts`](src/server/repositories/prisma-workout-repository.ts): Prisma/Postgres implementation
- [`src/server/services/workout-service.ts`](src/server/services/workout-service.ts): application use cases
- [`src/lib/data.ts`](src/lib/data.ts): compatibility facade for pages and routes
- [`prisma/schema.prisma`](prisma/schema.prisma): Postgres data model
- [`docker-compose.yml`](docker-compose.yml): local Postgres
- [`Dockerfile`](Dockerfile): production container build

## Scripts

- `npm run dev`: start development server
- `npm run dev:host`: start development server on configurable host/port
- `npm run build`: build production app
- `npm run start`: serve production app
- `npm run start:host`: serve production app on configurable host/port
- `npm run lint`: run ESLint
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: create/apply development migrations
- `npm run prisma:seed`: seed example exercises and sessions
- `npm run db:setup`: apply migrations and seed data

Host scripts use:

```text
APP_HOST
APP_PORT
```

Example:

```bash
APP_HOST=0.0.0.0 APP_PORT=3000 npm run dev:host
```

## Future Native App Path

The planned mobile architecture is:

```text
apps/mobile
  Expo React Native app
  local SQLite database
  optional sync client

packages/domain or src/domain
  shared analytics
  shared validation
  shared types

server
  hosted sync API
  account auth
  Postgres cloud copy
```

The mobile app should work fully without an account. If users opt in later, sync can upload local data to the server and keep devices aligned.

## Roadmap

- Hosted deployment hardening
- Mobile logging polish
- Real account auth
- User-owned data model
- Export and backup
- Offline-first native Expo app
- Optional sync
- Shareable progress cards
- Test coverage for analytics and repository behavior

## Contributing

Contributions are welcome, especially around:

- workout logging UX
- local-first mobile architecture
- strength analytics
- sync design
- Postgres deployment
- test coverage
- charts and data visualization

If this project resonates, star it, open an issue, or ship a focused improvement.
