# Running GIS Day locally

The whole GIS Day stack in Docker on one machine: SQL Server, Redis, the API (`gisday-nest`) and the
front end's dev server (`gisday-angular`). Part of #1511.

| Container | What | Port |
| --- | --- | --- |
| `gisday-db` | SQL Server 2022 Developer, data in volume `gisday-db-data` | 14330 |
| `gisday-redis` | Redis 7, the API's job queue | none outside Docker |
| `gisday-api` | `node dist/apps/gisday-nest/main.js` on Node 24.22.0 | 3333 |
| `gisday-dev` | `nx serve gisday-angular --configuration=local` on Node 24.22.0 | 4201, or 4202 with `--site` |
| `gisday-site` | Only with `web --site <key>`: serves the dev server as that site ([below](#another-organizations-site)) | 4201 |

All of them share the Docker network `gisday-local`, so they reach each other by container name. The
API and the dev server bind-mount the checkout and share the `node_modules` volume `tamu-js-dev-nm`
with the AggieMap dev server (see CLAUDE.md), so that volume must match the checkout's lock file.

## Settings stay outside the repository

`scripts/gisday-local.sh` reads them from `GISDAY_LOCAL_DIR` (default `C:/TAMU/gisday-local`):

- `local-db.env`: `SA_PASSWORD` and `GISDAY_APP_PASSWORD`, local passwords for this container only.
  The `db` step writes it, with new random values, the first time it runs.
- `gisday-api.local.env`: the API's settings, a copy of `apps/gisday-nest/local.env.sample`, which
  holds no secrets and works as it stands. The database settings must point at `gisday-db`, never
  production or the shared dev server, and every `MAILROOM_` value stays blank so no email is sent.
  Leave `TYPEORM_PASSWORD` blank; the script passes the one it wrote.
  `AUTH0_MANAGEMENT_DISABLED=true` lets the API start without Auth0 management credentials, which
  nobody is given for local use (#1623, #1759).

Nothing needs to come from anyone: the settings are a copy of the sample, and `restore` uses the
scrubbed copy of the database in the repository.

```bash
mkdir -p "${GISDAY_LOCAL_DIR:-C:/TAMU/gisday-local}"
cp -n apps/gisday-nest/local.env.sample "${GISDAY_LOCAL_DIR:-C:/TAMU/gisday-local}/gisday-api.local.env"
```

`-n` keeps a settings file that is already there.

## Steps, in order

From Git Bash at the root of the checkout:

```bash
scripts/gisday-local.sh install                 # npm ci into tamu-js-dev-nm, about 2 minutes
scripts/gisday-local.sh db                      # SQL Server, waits until it answers
scripts/gisday-local.sh restore                 # the repository's scrubbed copy, a few seconds
scripts/gisday-local.sh api                     # builds gisday-nest (under a minute), starts it and Redis
scripts/gisday-local.sh web                     # first compile takes several minutes
```

Then open <http://localhost:4201>. `status` lists the containers; `stop` removes them and keeps the
database volume, so the restore is needed only once.

### Another organization's site

The same code serves more than one organization's GIS Day site; each is defined in
`libs/gisday/common/src/lib/sites.ts` and chosen per deployment by `ANGULAR_SITE` (#1835). To review
one locally, start the web step with its key:

```bash
scripts/gisday-local.sh web --site ucgis
```

<http://localhost:4201> is then that site and <http://localhost:4202> is txgisday.org, from the same
dev server. `gisday-site` replaces the site placeholder in the scripts the dev server sends, as a
deployed container does when it starts. Sign-in works only on 4201, the one address the local Auth0
application accepts. The API is still the one `api` started, which serves every feature, and the data
is the local database's.

`migrate` shows, generates, runs and reverts schema migrations on the local database;
[gisday-migrations.md](gisday-migrations.md) has the process for changing the schema.

## What the restore needs by hand

A backup carries the database user `gisday_app` but not the server login, so `restore` creates the
login with `GISDAY_APP_PASSWORD` and maps the user to it. `gisday_app` can read and write data
(`db_datareader`, `db_datawriter`) and has `VIEW DEFINITION`, which TypeORM needs to compare the
schema; it cannot change tables. The migrations table already records `InitialSchema` as applied.

## A copy with no personal data

`apps/gisday-nest/src/database/gisday-local.bak` is the starting database for local development: a
copy of the real one with nobody's real data in it, about 4 MB. `restore` with no file name uses it.

**It is in a public repository. Whoever replaces it is publishing it.**

What it holds that is real: seasons and their days; events' names, times, rooms and abstracts;
places, organizations, universities, sponsors, tags and classes; the competition forms, and the
answers and map positions people submitted to them, which are choices from fixed lists about things
on campus. It has how many people signed up for and checked in to each event, and nothing about who.

What is made up or removed:

- **everyone in `speakers`**, published or not: a made-up name, biography and affiliation, and no
  degree, year, program or social media;
- **every account id**, with a new random one on every row, so no two rows belong to one person;
- every email address, and the contact names of organizations and sponsors;
- professors' names on classes;
- competition entries' titles, abstracts, messages, links and participant lists;
- meeting links, ids, phone numbers and passwords;
- participants' photographs, each with a one-pixel image, which was nearly all of the size;
- every uploaded logo and photograph, with one placeholder image that the front end ships;
- any event name, event abstract or organization name that holds a real person's full name or an
  email address.

### Refreshing it

Only someone who has a backup of production, and only when the local data has gone stale:

```bash
scripts/gisday-local.sh restore <production backup>.bak   # from GISDAY_LOCAL_DIR; about 90 s for 9 GB
scripts/gisday-local.sh scrub                             # rewrites gisday-local.bak; about 3 minutes
scripts/gisday-local.sh restore                           # back onto the scrubbed copy
```

A backup of production holds real people's names, email addresses, account ids, student ids and
photographs. Keep it on as few machines as possible, never on a student's, and delete it afterwards.

`scrub` builds a new, empty database from the migrations and copies every table into it through
`apps/gisday-nest/src/database/scrub.sql`, so nothing of the original can be left in freed pages or
the log. Three things keep it safe as the schema and the data change:

- Every column is named in `scrub.sql` as kept or replaced. A column in neither list stops the
  script before it copies anything.
- Before copying, it lists every real full name in the database: speakers, contacts, professors and
  competition entrants.
- After copying, it searches every text column of the copy for an account id, a real email address
  or one of those names, and fails if it finds one.

What it cannot find is a person mentioned by first name only, or described without being named, in
an event's name or abstract. Read the diff of what the site shows before committing a new copy.

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
  to `http://localhost:4201`, so the port cannot be changed. It is the same Auth0 tenant as production,
  so the accounts are real.

What does not, yet:

- **Real people, logos and photographs.** The scrubbed copy has made-up speakers and one placeholder
  image for every upload; the real files are on the production site, not in the database.
- **Email**, deliberately: every `MAILROOM_` value is blank.
- **Anything that needs a user's Auth0 profile.** The local API has no management credentials (#1759)
  until a development tenant with test users exists (#1623), so:
  - The admin Users page, and reading or saving a signed-in user's own profile (Account > My
    details), answer `503 Service Unavailable`. A refused save writes nothing.
  - Because the profile cannot be read, a signed-in user cannot register for or check in to an
    event: the event's page asks for the profile to be completed.
  - Nothing else fails: a class's attendance lists each student with `N/A` for name, email and UIN
    (attendance counts are still right), and the competition leaderboard and submission review show
    the last four characters of each user's id instead of an email.

## Things that look broken

- The site compiles and listens on 4201, but the first page stays blank, and the log stops at
  `[vite] (client) [optimizer] bundling dependencies...` with only a `deps_temp_*` folder in
  `.angular/cache/<version>/gisday-angular/vite/`: the dev server was started without
  `UV_THREADPOOL_SIZE=64`. `--poll=2000`, which the bind mount needs, keeps Node's 4 default
  file-system threads busy, and the dependency optimizer waits behind them for good. `scripts/gisday-local.sh web`
  sets it; a dev server started by hand needs `-e UV_THREADPOOL_SIZE=64` too. Remove the container and
  `.angular/cache`, then start it again (#1955). `bash scripts/gisday-local.test.sh` checks the script still sets it.
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
