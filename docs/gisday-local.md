# Running GIS Day locally

The whole GIS Day stack in Docker on one machine: SQL Server, Redis, the API (`gisday-nest`) and the
front end's dev server (`gisday-angular`). Part of #1511.

| Container | What | Port |
| --- | --- | --- |
| `gisday-db` | SQL Server 2022 Developer, data in volume `gisday-db-data` | 14330 |
| `gisday-redis` | Redis 7, the API's job queue | none outside Docker |
| `gisday-api` | `node dist/apps/gisday-nest/main.js` on Node 24.22.1 | 3333 |
| `gisday-dev` | `nx serve gisday-angular --configuration=local` on Node 24.22.1, or nginx with `web --static` ([below](#a-build-instead-of-the-dev-server)) | 4201, or 4202 with `--site` |
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
  `AUTH0_MANAGEMENT_DISABLED=true` lets the API start without Auth0 management credentials (#1759).
- `auth0-dev.local.env` (optional): the development Auth0 tenant's management credentials and a test
  admin account, written by `scripts/gisday-auth0-dev.ps1` (see [Signing in](#signing-in)). When it
  exists, the `api` step passes it after `gisday-api.local.env`, so its values win and the API has its
  management credentials.

Nothing needs to come from anyone to see the site: the settings are a copy of the sample, and
`restore` uses the scrubbed copy of the database in the repository. Signing in needs an account in the
development tenant.

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

Then open <http://gisday.local.test:4201>, after adding it to the hosts file and telling the browser to treat it as
secure ([Signing in](#sign-in-at-gisdaylocaltest-not-localhost) says why and how); <http://localhost:4201> works too,
but signing in there always stops at a consent screen. `status` lists the containers; `stop` removes them and keeps the
database volume, so the restore is needed only once.

### Another organization's site

The same code serves more than one organization's GIS Day site; each is defined in
`libs/gisday/common/src/lib/sites.ts` and chosen per deployment by `ANGULAR_SITE` (#1835). Adding a
new one, from that entry to its own address, is [`docs/gisday-sites.md`](gisday-sites.md) (#1843). To
review one locally, start the web step with its key:

```bash
scripts/gisday-local.sh web --site ucgis
```

<http://localhost:4201> is then that site and <http://localhost:4202> is txgisday.org, from the same
dev server. `gisday-site` replaces the site placeholder in the scripts the dev server sends, as a
deployed container does when it starts. Sign-in works only on 4201, the one address the local Auth0
application accepts. The API is still the one `api` started, which serves every feature, and the data
is the local database's.

`gisday-site` also adds `x-forwarded-host: <the site's host>` (the host of its `address` in `sites.ts`, such as
`gisday.tamu.edu`) to every request it passes on, so the API's site logic (`siteHost()`: which site's sessions a
dashboard counts, which site an email is from) answers for that site, as it does behind the real site's ingress
([#3050](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3050)). Before, a GET through
4201 carried no `Origin` and the API answered as txgisday.org. A request that does carry an `Origin` (a `POST`,
`PATCH` or `DELETE` from the page) still names `http://localhost:4201`, which `siteHost()` reads first, so those
answer as txgisday.org; 4202 adds nothing and is txgisday.org throughout.

### A build instead of the dev server

When the dev server will not finish its first page load ([below](#things-that-look-broken)), build the
front end once and serve the build instead (#2057):

```bash
scripts/gisday-local.sh web --static                # or: web --static --site ucgis
```

It builds `gisday-angular --configuration local` into `dist/apps/gisday-angular`, then serves that
folder from `nginx:alpine` as `gisday-dev`, on the same ports as the dev server, with `--site` working
as above. `scripts/gisday-local-static.conf` sends `/___ANGULAR_API_URL___/...` to `gisday-api`, as
`proxy.local.json` does for the dev server, so start `api` first: nginx will not start if it cannot
find `gisday-api`. **Nothing recompiles.** After an edit, run `web --static` again; it rebuilds and
replaces `gisday-dev` (and `gisday-site`).

`migrate` shows, generates, runs and reverts schema migrations on the local database;
[gisday-migrations.md](gisday-migrations.md) has the process for changing the schema.

## What the restore needs by hand

A backup carries the database user `gisday_app` but not the server login, so `restore` creates the
login with `GISDAY_APP_PASSWORD` and maps the user to it. `gisday_app` can read and write data
(`db_datareader`, `db_datawriter`) and has `VIEW DEFINITION`, which TypeORM needs to compare the
schema; it cannot change tables. The migrations table already records `InitialSchema` as applied.
Then `restore` runs the migrations, as `migrate run` does, because a backup is only as new as the schema
it was taken at: the scrubbed copy predates `AddCheckInZones` and `AddSponsorActive`, and without them
the API answered 500 on the sponsors and on a season day's events (#2196).

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
- Sign-in, with an account in the development Auth0 tenant (see [Signing in](#signing-in)).

What does not, yet:

- **Real people, logos and photographs.** The scrubbed copy has made-up speakers and one placeholder
  image for every upload; the real files are on the production site, not in the database.
- **Email**, deliberately: every `MAILROOM_` value is blank.
- **Publishing VGI submissions to ArcGIS Online** (#2433), deliberately: the `VGI_ARCGIS_` values are blank, so
  nothing is sent, and the admin Submissions page's **Publish to ArcGIS** says publishing is not set up.
- **Anything that needs a user's Auth0 profile, without `auth0-dev.local.env`.** The API then has no
  management credentials (#1759), so:
  - The admin Users page, and reading or saving a signed-in user's own profile (Account > My
    details), answer `503 Service Unavailable`. A refused save writes nothing.
  - Because the profile cannot be read, a signed-in user cannot register for or check in to an
    event: the event's page asks for the profile to be completed.
  - Nothing else fails: a class's attendance lists each student with `N/A` for name, email and UIN
    (attendance counts are still right), and the competition leaderboard and submission review show
    the last four characters of each user's id instead of an email.

## Signing in

The local site signs in against **`txgisday-dev`**, a development Auth0 tenant kept apart from
production's (#1623). Its accounts are test accounts, and nothing in it can reach production users.
`environment.local.ts` holds its public settings and `apps/gisday-nest/local.env.sample` the API's.

`scripts/gisday-auth0-dev.ps1` builds the tenant and can rebuild it at any time:

- the API `gisday.dev.api`, with every permission the GIS Day API checks, which users may skip consenting to;
- the six roles the site knows, with GIS Day Admin holding every permission;
- the application "GIS Day (local development)", which returns only to `http://gisday.local.test:4201` and
  `http://localhost:4201`, so the port cannot change;
- a post-login action that puts a user's roles in the `geoservices.prod/roles` claim the site reads;
- a test admin, `claude-test-admin@txgisday-dev.test`, with a new password each run.

It runs on Windows, in PowerShell, by someone with a dashboard account in the tenant. It asks for the
Client ID and secret of the tenant's "GIS Day dev setup" machine-to-machine application (the secret
in a hidden prompt), and talks only to `txgisday-dev.us.auth0.com`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\gisday-auth0-dev.ps1
```

It writes `auth0-dev.local.env` in `GISDAY_LOCAL_DIR`, outside the repository, with the API's
development credentials and the test admin's password. Restart the API with `scripts/gisday-local.sh
api` to use them. A developer who cannot run the script is given that file: it holds development-tenant
credentials only, never a production secret.

It says which tenant and which application it is about to change before it changes anything, refuses any tenant but
`txgisday-dev` (the `geoservices` tenant has an application with the same name), and ends by reading the application
and the API back, saying setting by setting whether each is as intended. It never prints the client secret or its
token.

### Sign in at gisday.local.test, not localhost

**Open <http://gisday.local.test:4201>, not <http://localhost:4201>, to sign in.** Auth0 never skips its "Authorize
App" consent screen for a page served from `localhost` or `127.0.0.1`, even with "Allow Skipping User Consent" on for
the API, so every sign-in at localhost stops at that screen
([#3136](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3136)). `gisday.local.test` is the
same site under another name, which the tenant treats as an ordinary address and lets a user sign in to without it.
`.test` is reserved for testing, so it can never be a real host.

The name has to point at this machine. Add this line to `C:\Windows\System32\drivers\etc\hosts`, editing it as an
administrator:

```text
127.0.0.1 gisday.local.test
```

**The browser also has to treat that address as secure.** The sign-in library (`auth0-spa-js`) needs
`crypto.subtle`, which a browser gives only to a secure page: `https`, or `localhost` and `127.0.0.1`. At plain
`http://gisday.local.test:4201` the page stays empty of its menus and the console says `auth0-spa-js must run on a
secure origin` (checked on 16 November 2026, #3136). In Chrome or Edge, open `chrome://flags` (`edge://flags`), set
**Insecure origins treated as secure** to `http://gisday.local.test:4201`, enable it and relaunch. Playwright does the
same with full Chromium, which honours the flag where its default headless shell does not:

```js
chromium.launch({ channel: 'chromium', args: ['--unsafely-treat-insecure-origin-as-secure=http://gisday.local.test:4201'] });
```

So set up, a sign-in there through the login form and a second page opened in the same browser both reached
`/admin/dashboards/rsvps` with no consent screen (16 November 2026).

Nothing else changes: the `web` step serves the same site at both addresses (its dev server allows the name in the
`local` configuration's `allowedHosts`, and nginx and `gisday-site` answer to any name), the page returns from sign-in
to its own address, and the API is reached through the page's own address either way. `web` reminds you if the hosts
file does not have the line; it never edits it. localhost still works, with the consent screen.

## Things that look broken

- The site compiles and listens on 4201, but the first page stays blank, and the log stops at
  `[vite] (client) [optimizer] bundling dependencies...` with only a `deps_temp_*` folder in
  `.angular/cache/<version>/gisday-angular/vite/`: the dev server was started without
  `UV_THREADPOOL_SIZE=64`. `--poll=2000`, which the bind mount needs, keeps Node's 4 default
  file-system threads busy, and the dependency optimizer waits behind them for good. `scripts/gisday-local.sh web`
  sets it; a dev server started by hand needs `-e UV_THREADPOOL_SIZE=64` too. Remove the container and
  `.angular/cache`, then start it again (#1955). `bash scripts/gisday-local.test.sh` checks the script still sets it.
  If it still stalls there, as it has on Node 24 with the thread pool set, use
  [`web --static`](#a-build-instead-of-the-dev-server), which serves a build and needs no dev server (#2057).
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
- A **production** `gisday-nest` image (`ghcr.io/tamugeoinnovation/gisday-nest:<tag>`), run locally on
  `apps/gisday-nest/local.env.sample`, exits at once with `Error: Management service configuration is missing required
  parameters.`, even though the sample sets `AUTH0_MANAGEMENT_DISABLED=true`. Only the local build reads that switch: its
  start-up log shows `disabled: undefined` in a production image, whose configuration requires all three
  `AUTH0_MANAGEMENT_*` values. It only checks that they are there; it makes no network call for them at start-up. So pass
  placeholders, which are not credentials:

  ```
  AUTH0_MANAGEMENT_DOMAIN=placeholder.invalid
  AUTH0_MANAGEMENT_CLIENT=placeholder
  AUTH0_MANAGEMENT_SECRET=placeholder
  ```

  Anything that reads or changes Auth0 users then fails when it is used rather than at start-up. Run by hand rather than
  through `scripts/gisday-local.sh`, the image also needs `TYPEORM_PASSWORD`, which the sample leaves blank for the
  script to fill: without it, it stops even earlier, with `Missing db environment variables`
  ([#2133](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2133)).
