# Production Deployment

This app is intended to run as Docker Compose stack with:

- Next.js app container
- Postgres container
- Caddy reverse proxy with automatic HTTPS

## DNS

Create an `A` record for your domain that points to the VPS public IPv4 address.

```text
liftlytics.example.com -> YOUR_VPS_IPV4
```

If you want to use the root domain, point `example.com` to the VPS instead and set `DOMAIN=example.com`.

## Server Setup

On a fresh Ubuntu/Debian VPS:

```bash
apt update
apt install -y ca-certificates curl git ufw
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Clone the repo:

```bash
git clone REPLACE_WITH_YOUR_REPO_URL liftlytics
cd liftlytics
```

Create production environment values:

```bash
cp .env.production.example .env.production
nano .env.production
```

Set:

- `DOMAIN`
- `POSTGRES_PASSWORD`
- `BASIC_AUTH_USERNAME`
- `BASIC_AUTH_PASSWORD`

Use long random passwords.

## Start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

The app container runs `prisma migrate deploy` before starting Next.js.

## Update

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## Logs

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

## Backup

Create a local backup directory:

```bash
mkdir -p backups
```

Dump Postgres:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "backups/liftlytics-$(date +%F).sql"
```

Copy backups away from the VPS regularly.
