# DB tooling

This repo keeps schema changes and test data separate.

## Commands

```powershell
npm run db:identity
npm run db:migrate -- --dry-run
npm run db:migrate
npm run db:seed:rooms
npm run db:verify
```

`db:migrate` applies only additive, idempotent-looking migrations. It skips older
one-shot migrations that contain destructive or non-idempotent SQL unless a file
is explicitly selected and forced after review:

```powershell
npm run db:migrate -- --file 005_rooms_and_credits.sql --force
```

`db:seed:rooms` creates the standard test rooms if they are missing and ensures
each room has a room credit account. Existing rooms are left alone by default.
Use `--sync` only when you intentionally want to reset the seeded room states,
sharing flags, and assignments to the standard test layout.

```powershell
npm run db:seed:rooms -- --sync
```

## App user resolution

The live ACE database has had auth ownership drift over time. Scripts should not
guess by only using one column. The shared resolver checks these identity columns:

- `id`
- `auth_id`
- `auth_user_id`
- `app_user_id`

If there is exactly one `app_users` row, scripts use it. If there are multiple
rows, set `ACE_APP_USER_ID` in `.env.local` or in the shell before running DB
commands.

## Supabase CLI

The project is linked to Supabase project ref `ecblmatbmortqkdadvlt`.

If `supabase` is not on `PATH`, use `npx supabase` from the repo root.

Before pushing migrations, check both the CLI migration ledger and the live
schema summary:

```powershell
npx supabase migration list
npx supabase db push --dry-run
npm run db:verify
```

When the dry run says the remote database is up to date, there is nothing to
push. For future migrations, prefer:

```powershell
npx supabase db push --dry-run
npx supabase db push
npm run db:verify
```

The local helper scripts are still useful for verification, identity inspection,
and test data seeding. Do not put test data such as standard rooms directly in
schema migrations.

`004_review_queue.sql` and `005_rooms_and_credits.sql` were applied manually
before the CLI was linked, then marked as applied in the Supabase migration
history with `supabase migration repair`. The CLI now reports local and remote
migration history aligned through `005`.
