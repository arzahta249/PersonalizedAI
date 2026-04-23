# E-Learning AI

Next.js + Prisma learning platform with PostgreSQL-compatible deployment support, including Supabase bootstrap and legacy data transfer helpers.

## Development

```bash
npm install
npm run dev
```

## Supabase setup

Copy [.env.supabase.example](.env.supabase.example) into `.env`, then fill:

- `DATABASE_URL`: Supabase pooled runtime URL
- `DIRECT_URL`: Supabase direct database URL for Prisma CLI and bootstrap
- `SOURCE_DATABASE_URL`: old PostgreSQL database you want to migrate from
- `JWT_SECRET`, `OPENROUTER_API_KEY`, `ADMIN_REGISTER_CODE`: existing app secrets

## Schema bootstrap

This repo contains a fresh SQL snapshot in [prisma/supabase-baseline.sql](prisma/supabase-baseline.sql) generated from the current Prisma schema. Use it once on a new Supabase database:

```bash
npm run db:supabase:bootstrap
```

If the target database is not empty and you still want to continue:

```bash
npm run db:supabase:bootstrap -- --force
```

## Legacy data migration

Export data from the old PostgreSQL database:

```bash
npm run db:export:postgres
```

The export will be written to `prisma/data-export/`.

Import the exported JSON into Supabase:

```bash
npm run db:import:supabase
```

If you want to append instead of truncating first:

```bash
npm run db:import:supabase -- --no-truncate
```

## Prisma commands

Prisma CLI is configured in [prisma.config.ts](prisma.config.ts) to prefer `DIRECT_URL` and fall back to `DATABASE_URL`.

Useful commands:

```bash
npm run db:generate
npm run db:push
npm run build
```

## Deployment checklist

1. Fill Supabase env values in your hosting platform.
2. Run `npm run db:supabase:bootstrap` once against the fresh Supabase project.
3. Run `npm run db:export:postgres`.
4. Run `npm run db:import:supabase`.
5. Deploy the Next.js app.
