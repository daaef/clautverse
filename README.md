# Clautverse

Reality-TV fan platform: Nuxt 4 / Nitro API on Neon Postgres (Drizzle), Better Auth, Zod.
The implementation guide (Docus) lives in [`/guide`](./guide).

## Local setup

Requirements: Node 24+, pnpm, Docker.

```bash
docker run -d --name clautverse-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clautverse -p 5432:5432 postgres:17
cp .env.example .env            # fill NUXT_BETTER_AUTH_SECRET and NUXT_CURSOR_SECRET
pnpm install
set -a; . ./.env; set +a
pnpm db:migrate && pnpm db:seed
pnpm dev                        # http://localhost:3000/api/health
```

Without `NUXT_RESEND_API_KEY`, verification and password-reset emails are printed to the server console.

## Checks

```bash
pnpm typecheck
pnpm test:unit
pnpm test:e2e   # needs the Docker Postgres above; creates a throwaway clautverse_test database
```

## Database changes

Edit `server/db/schema/*`, then `pnpm db:generate` to create a numbered migration in `server/db/migrations`, and `pnpm db:migrate`. Never change production by hand.
