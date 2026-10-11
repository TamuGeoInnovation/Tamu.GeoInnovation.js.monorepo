# Running GIS Day locally

The whole GIS Day stack in Docker on one machine: SQL Server, Redis, the API (`gisday-nest`) and the
front end's dev server (`gisday-angular`). Part of #1511.

| Container | What | Port |
| --- | --- | --- |
| `gisday-db` | SQL Server 2022 Developer, data in volume `gisday-db-data` | 14330 |
| `gisday-redis` | Redis 7, the API's job queue | none outside Docker |
| `gisday-api` | `node dist/apps/gisday-nest/main.js` on Node 22.23.3 | 3333 |
| `gisday-dev` | `nx serve gisday-angular --configuration=local` on Node 22.23.3 | 4201 |

All four share the Docker network `gisday-local`, so they reach each other by container name. The
API and the dev server bind-mount the checkout and share the `node_modules` volume `tamu-js-dev-nm`
with the AggieMap dev server (see CLAUDE.md), so that volume must match the checkout's lock file.

## Settings stay outside the repository

`scripts/gisday-local.sh` reads them from `GISDAY_LOCAL_DIR` (default `C:/TAMU/gisday-local`):

- `local-db.env`: `SA_PASSWORD` and `GISDAY_APP_PASSWORD`, local passwords for this container only.
- `gisday-api.local.env`: the API's settings. Start from `apps/gisday-nest/local.env.sample`. The
  database settings must point at `gisday-db`, never production or the shared dev server, and every
  `MAILROOM_` value stays blank so no email is sent. `TYPEORM_PASSWORD` is `GISDAY_APP_PASSWORD`.
- the backup to restore (`.bak`).

## Steps, in order

From Git Bash at the root of the checkout:

```bash
scripts/gisday-local.sh install                 # npm ci into tamu-js-dev-nm, about 2 minutes
scripts/gisday-local.sh db                      # SQL Server, waits until it answers
scripts/gisday-local.sh restore <file>.bak      # seconds for a scrubbed copy, about 90 s for 9 GB
scripts/gisday-local.sh api                     # builds gisday-nest (under a minute), starts it and Redis
scripts/gisday-local.sh web                     # first compile takes several minutes
```

Then open <http://localhost:4201>. `status` lists the containers; `stop` removes them and keeps the
database volume, so the restore is needed only once.

`migrate` shows, generates, runs and reverts schema migrations on the local database;
[gisday-migrations.md](gisday-migrations.md) has the process for changing the schema.

## What the restore needs by hand

A backup carries the database user `gisday_app` but not the server login, so `restore` creates the
login with `GISDAY_APP_PASSWORD` and maps the user to it. `gisday_app` can read and write data
(`db_datareader`, `db_datawriter`) and has `VIEW DEFINITION`, which TypeORM needs to compare the
schema; it cannot change tables. The migrations table already records `InitialSchema` as applied.

## A copy with no personal data

A backup of production holds real people's names, email addresses, account ids, student ids and
photographs. It should be on as few machines as possible, and never on a student's. Anyone who has
one restored can write a scrubbed copy from it:

```bash
scripts/gisday-local.sh scrub gisday-scrubbed-<date>.bak    # under a minute; about 5 MB against 9 GB
scripts/gisday-local.sh restore gisday-scrubbed-<date>.bak  # a few seconds
```

`scrub` builds a new, empty database from the migrations and copies every table into it through
`apps/gisday-nest/src/database/scrub.sql`, so nothing of the original can be left in freed pages or
the log. The scrubbed backup restores like any other and is the one to hand to a new developer.

What it keeps: seasons, events, places, organizations, sponsors, tags, classes, the competition
forms and answers, and speakers' names and profiles. Sign-ups and check-ins keep their counts.

What it replaces:

- every account id, with a made-up one that stays the same wherever that account appears;
- every email address, and the contact names of organizations and sponsors;
- competition entries' titles, abstracts, messages, links and participant lists;
- meeting links, ids, phone numbers and passwords;
- participants' photographs, each with a one-pixel image, which is nearly all of the size;
- any event abstract, speaker profile or organization name that holds an email address.

Two things make it safe to keep using as the schema changes. Every column is named in `scrub.sql`
as kept or replaced, and a column in neither list stops the script before it copies anything. And
after copying, it searches every text column of the copy for an account id or a real email address
and fails if it finds one.

## How the front end reaches the API

`gisday-angular` is built with placeholder settings (`___ANGULAR_API_URL___` and the
`___ANGULAR_AUTH0_...___` values) that its production container replaces at start. The dev server
does no such replacement, so the front end calls `/___ANGULAR_API_URL___/...` literally. The `local`
serve configuration adds `apps/gisday-angular/proxy.local.json`, which sends those calls to
`http://gisday-api:3333/api/...`.

## What works locally

- Pages load with the restored data (checked 11 October on the office machine: the page, the API
  directly at <http://localhost:3333/api/seasons/active>, and the same call through the dev server's
  proxy at <http://localhost:4201/___ANGULAR_API_URL___/seasons/active> all answer 200).
- Sign-in, with your own GIS Day account. The `local` serve configuration swaps in
  `apps/gisday-angular/src/environments/environment.local.ts`, which holds the settings of the
  "GIS Day (local development)" Auth0 application. That application accepts only sign-ins that return
  to `http://localhost:4201`, so the port cannot be changed. It is the same Auth0 tenant as production:
  the accounts are real, and the local API holds whatever Auth0 credentials its settings file was
  given, so do not edit users from a local copy.

What does not, yet:

- **Uploaded images** (sponsor logos, speaker photos). They live on the production cluster's volume,
  not in the database.
- **Email**, deliberately: every `MAILROOM_` value is blank.

## Things that look broken

- `Recursive task invocation detected`, or a start that prints `Waiting for <task> in another nx process`
  and never continues: an Nx container in this checkout was killed in the middle of a task (`docker rm -f`,
  `docker kill`, Docker itself stopping). Nx writes each running task into
  `.nx/workspace-data/machine-v3.db`, keyed by its process id, and removes the record only when it exits
  normally. Every container gives Nx the same process id, so the next run of that task finds the dead
  run's record and takes it for its own parent (the first message, from `build`, `lint` or a migration)
  or for a live server (the second, from `serve`). `gisday-dev` cannot leave one behind, because it keeps
  its Nx records inside the container; the build and migration containers can, if they are killed. With
  no Nx container running in the checkout, delete the `.nx/workspace-data` folder (it is gitignored and
  rebuilt) and start again. Nx also drops the first kind of record by itself after a day. See #1626.
- The TypeORM CLI cannot find `@tamu-gisc/...` packages: do not run it by hand; use the
  `gisday-nest:migration-*` targets, which set what it needs ([gisday-migrations.md](gisday-migrations.md)).
