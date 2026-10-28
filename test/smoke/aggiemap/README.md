# AggieMap smoke suite

Loads every map in a deployed environment and checks that each layer actually resolves and returns
data. It exists because nothing else notices when a map breaks *without* a release: the maps draw
from hosted GIS services, so a layer can stop working because a service was republished or
unpublished - no commit, no build, no signal.

It found the Gameday Parking bike layers drawing the wrong data (#1036) within its first run.

See #1034 for the full plan. Companion tool: [`tools/builder-inventory`](../../../tools/builder-inventory/README.md),
which covers the eleven maps that cannot be reached by URL.

## What it checks

Per map, generated from the routes the environment actually lists:

1. The document is served and Angular renders.
2. The map probe is present - its absence means the build predates it, reported separately from a
   slow map so the two are not confused.
3. Every layer settles, none reports a load error, and at least one returns features.
4. No uncaught page errors and no 5xx responses.

`analytics.spec.ts` separately checks that the Google Analytics tag loads, reports to the property
expected for that environment, and that a builder selection still produces an application-level
event.

`retired.spec.ts` checks that no retired map (`status: 'retired'` in its definition, #1098) is
offered: searching All Maps for each one finds nothing, and no listing page links it. The exception is
dev's All Events list, which keeps every event, working or not; the spec checks that it still lists
them, each with a Retired label. It also opens each retired map's link, bare and `/map`, and checks it
lands on the "has ended" page with no map loaded. Retired maps are read from the definitions as text by `retired.ts`. The crawl uses it to leave
retired maps out of the maps it tests, and `services.spec.ts` to skip services only retired maps use.

`search-sources.spec.ts` exercises every search source the main map defines, each the way a visitor
reaches it (#1138). Typed sources must answer their term under their own heading and open real
details. Deep-link sources (`?bldg=`, `?BldgAbbrv=`, `?poi=`, `?busstop=`) must open theirs. Sources
used only by the Directions tab are checked at their layer: it must be the layer the row expects,
have every field the source's query, where clause and display use (read from `search-sources.ts`),
and answer the source's own query (#1167). A guard fails if
`search-sources.ts` gains a source with no row. Known failures per environment are listed under
`allowedSearchSourceFailures` in `environments.json`, each tied to an issue.

`directions.spec.ts` checks directions are offered only where routing works (#1003). Routing is
unpublished, so the Directions tab and every "Directions To Here" button are development-only: hidden
on production, shown on dev and localhost. Each environment's `directionsAvailable` in
`environments.json` says which, and the spec checks the main map's tab and one popup of each kind that
offers directions, both ways. It also opens the trip planner at `/map/d/trip`, which a link still reaches
with the tab hidden: the from and to boxes where directions are available, the maintenance message
elsewhere and with `?as=production`. `maps.spec.ts` also checks no map offers directions where they are
unavailable. When routing returns to production, set `directionsAvailable` to true there.

`development-only.spec.ts` checks development-only work stays off production, both ways, from each
environment's `developmentSectionsVisible`. The sections listed in `development-only.ts` (Directions,
Bus Routes, Experiments) must be offered on dev and absent on production (#1090). The GIS services
listed in `DEVELOPMENT_ONLY_SERVICES` must be requested on dev and never on production (#1229). Each
service lists the pages that use it (the main map, Visitor Parking with Aggieland saved as the
basemap, the Tailgating map), every one of those pages is loaded and every request recorded. On dev a
page must request the services that list it; a service one map alone uses is not required of the
others (#1460). On production no page may request any of them. A service published only on the
development GIS server (`developmentGisServer`, the Women's Basketball map's new version, #2001) is
required only where that server is read: dev, but not `local`, since localhost reads production's GIS
server. A service with no production counterpart goes on that list. It comes off only when it is
published for production, together with the code's gate.

`blank-map.spec.ts` loads `/map/d` plainly, six times, each in its own test with retries off, and fails
each load whose map canvas stays blank (#2487). The probe reports a blank map as ready with every layer
drawable, so only the picture shows it, and a fault that blanks one load in four would otherwise look like a
flaky test and be retried into a pass. Each load is read for three good frames and once more five seconds
later, so a map that draws and then empties fails too. `AGGIEMAP_SMOKE_BLANK_LOADS` sets how many loads.

`bus.spec.ts` checks every bus route the bus panel lists draws its line and one stop marker for each
stop it lists, and that choosing a route expands it and draws its stops (#1175, for #1174). It reads
what the bus layer drew from the map probe's `graphicTypes`. Routes known to fail are listed per
environment under `allowedBusRouteFailures`, tied to their issue. Where bus routes are not offered yet,
or the deployed build's probe predates `graphicTypes`, it skips.

`framing.spec.ts` checks every map opens where it opens on production: the same zoom (within 0.05) and
center (within 0.0001 degrees, about ten metres) as recorded in
[`framing-baseline.json`](framing-baseline.json), at the suite's viewport (#1380). It covers every
listed map plus every builder destination in `tools/builder-inventory`, by its direct link, so a map
framed per builder choice (Ring Day days, Fish Camp sessions, Move-In halls) is checked per choice.
It exists because of #1379: after the ArcGIS 4.27 upgrade those choice-framed maps opened at the
default campus zoom on dev while every layer loaded and drew, so nothing else here noticed. A route
in only one of the baseline and the environment is reported in the output and annotations, not
failed. Framing is read from the map probe's `framing`, or on builds whose probe predates it, from
Esri's own list of views.

**The maps behind a builder are checked at the destinations `tools/builder-inventory` recorded**, by
`maps.spec.ts` and `map-layers.spec.ts`, one per distinct layer set (`builder-destinations.ts`, #2467). The
inventory is crawled on dev. **On any other environment it is borrowed, not ignored** (#1134): its destinations
are paths, which reach the same maps on production once a release is there. The log names the inventory used,
with where and when it was crawled, and a borrowed destination that does not reach its map is skipped with a
note rather than failed, since builder choices can differ between environments between releases.

**A release check opens one route per map** (#1426): every listed map, and for a map behind a builder
its first recorded destination only, about 70 routes on dev instead of about 420. The rest are the same
maps opened with different builder choices, and the scheduled run on GitHub still opens every one of
them each day. `run-local.sh` sets `AGGIEMAP_SMOKE_FRAMING=release`; use the `full` tier to open every
route locally. A baseline refresh always opens every route, since it drops the ones it does not visit.

**The baseline must come from production**, the known-good reference; captured from dev it would
record the build under test. Refresh it after a deliberate framing change reaches production, and
review the diff (one line per route):

```bash
UPDATE_FRAMING_BASELINE=1 test/smoke/aggiemap/run-local.sh production framing.spec --workers=4
```

Update mode refuses any environment but production. A full capture is about 430 map loads.

## Running it

**From a workstation, use the script.** It runs the suite in the Playwright container with the same
settings as the scheduled workflow:

```bash
test/smoke/aggiemap/run-local.sh development   # dev.aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh local-production  # the local dev server as production renders it (127.0.0.1)
test/smoke/aggiemap/run-local.sh production    # aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh local         # a dev server in the aggiemap-dev container
```

**One spec or one test**, to prove a check red before a fix and green after it, without a tier:

```bash
test/smoke/aggiemap/run-local.sh development one legend.spec.ts
test/smoke/aggiemap/run-local.sh development one "a layer that loads hidden is listed once it is switched on"
```

A name ending `.spec.ts` runs that file. Anything else runs every test whose name contains the text,
matched literally, so brackets, dots and parentheses in a name need no escaping. It works with every
environment, `local` included.

**Stop at the first failure, or run them all.** A run continues through every test when one fails,
which is the default and what a release tier wants: the report lists everything that is wrong. Add `-x`
to stop at the first test that fails for good instead, when one failure already answers the question:

```bash
test/smoke/aggiemap/run-local.sh development release -x
```

`-x` is Playwright's `--max-failures=1`. A test counts once it has failed all its retries, so a flaky test
that passes on a retry does not stop the run. `--max-failures=<n>` stops after `n`.

Anything after the environment and tier goes to `playwright test`, for example `--grep "gameday"`. It
needs only Docker and bash (Git Bash on Windows). The first run downloads the Playwright image, about
2 GB.

### One suite, two ArcGIS versions

Dev and production can serve different major versions of ArcGIS: dev has 5.0 (#1859), production stays
on 4.34 until it is promoted. The map's own buttons have different markup in each, so a spec finds the
zoom, locate and compass controls through `controls.ts`, which matches either (#1890). A new check that
clicks or looks for one of them uses it rather than a selector of its own, or it times out against
whichever environment it was not written on and reads as a broken map.

### Seeing dev as production

`?as=production` on any address of a development host makes it behave as production for that browser
tab: development-only features off, and production's GIS services (#1722). `?as=development` turns it
off. Every page of a development host carries a control for it. This is for looking by hand; the suite
checks it in `development-only.spec.ts`, and still runs production's own expectations against
production and against `local-production`.

### The three tiers

The suite is run at one of three sizes. They answer different questions, and running a bigger one than
the question needs is how a dev release came to wait hours on a suite (#1717).

| Tier | Command | What runs | Time | Run it | Do not run it |
| --- | --- | --- | --- | --- | --- |
| **quick** | `run-local.sh development quick` | A fixed core, plus the tests for what changed since the last `dev-*` tag | 6 to 10 minutes | After every build reaches dev. **It is what clears a build for its `dev-*` tag** | To clear production. To look for a map that broke with no release: it only loads what changed |
| **release** | `run-local.sh development release` (the default when no tier is named) | Every map once: every spec, with one framing route per map | about 30 minutes | Once, on the build that is going to production, before the release notes merge | On every dev build. After a change that the quick tier already covers and that is not going to production yet |
| **full** | `run-local.sh development full`, or the scheduled workflow | Everything: every map and every framing route, on both environments | about an hour per environment on GitHub | Nightly, by the schedule. By hand when a hosted GIS service was republished or moved, or after a change to how every map frames itself | To clear a dev build or a release. Nobody waits on it; it opens and closes the health issues by itself |

**What the quick tier is.** `scope.ts` decides it and `scope.spec.ts` tests the decision, so it is
never worked out by hand:

- **The core, every time:** the build banner, the ArcGIS runtime, analytics, the GIS hosts, retired
  maps, development-only features, the blank-canvas detector, one page of each kind at phone width,
  the coverage floor, and three maps loaded end to end: the main map, Main Campus Parking and Gameday
  Parking.
- **What changed:** a changed map definition adds that map's own tests (it loads and serves its
  layers, its event dates, its framing). Changed feature code adds the spec files that check that
  feature: the basemap adds the services, deepest-zoom and satellite-campus checks; popups add the
  popup, directions and search-source checks; and so on, as the table in `scope.ts` lists. A changed
  smoke spec runs whole.
- **What it could not map:** a changed file that table does not know is covered by the core alone,
  and the run prints its name. Read that list. If something on it deserves its own check, add a line
  to the table in `scope.ts` in the same pull request.

It compares the checkout with the newest `dev-*` tag (`prod-*` against production), so **the checkout
must be at the commit that was built**. `AGGIEMAP_SMOKE_BASE` names another base.

**What the quick tier is not.** It samples; it does not prove. A layer that breaks on a map nobody
touched is found by the release tier or the nightly run, not by quick. So a `dev-*` tag means
"deployed to dev, and what changed was checked there", and production still waits for the release
tier.

**When in doubt, name the tier.** "Smoke test dev" after a build means quick. "Clear this for
production" means release. Nobody asks for full; it runs by itself.

**It does not use the checkout's `node_modules`** (#1459), so a checkout or worktree that was never
installed can run it. The suite needs two packages, `@playwright/test` and `pngjs`,
and the script keeps them in the Docker volume `tamu-js-smoke-nm`, mounted over `/work/node_modules`.
The first run installs them at the versions `package-lock.json` records, which takes a few seconds,
and any run after those versions change installs them again. A full `npm ci` is 2,594 packages and,
bind-mounted, can take 40 minutes. The Playwright image's version comes from `package.json`, and the
script stops if the lock records a different one. Docker leaves an empty `node_modules` folder behind
in a checkout that had none.

**Each environment's settings live in [`environments.json`](environments.json)**: its address, the
Google Analytics id it should report to, and the layers it is allowed to fail. The workflow and the
script both read that file, so a change there applies to scheduled, manual and local runs alike.
Change expectations there, not in a command line.

`allowedLayerFailures` tolerates a layer by title on every map. A layer known to fail on particular maps
only goes under `allowedMapLayerFailures` instead, by map path and then by layer title, each with its issue,
so the same layer failing on any other map still fails (#2350). `map-layers.spec.ts` records each one it
suppresses, and says when one passes again so its entry can go.

**A local run uses six workers; the workflow uses four** (#1426). Each test still gets a fresh browser
context, but the ArcGIS SDK is downloaded once per worker and served from memory after that
([`fixtures.ts`](fixtures.ts)), so a spec that opens a page imports `test` and `expect` from
`./fixtures`, not from `@playwright/test`. A context a spec makes by hand with `browser.newContext()`
does not get the cache; it still works, and downloads the SDK itself.

**A few tests run last, two at a time** (#1716). A test tagged `HEAVY` (from [`fixtures.ts`](fixtures.ts))
drives one map through many slow steps: 3D on every campus basemap, zooming to the deepest level, popup
after popup. Sharing the machine with five other map loads, each step slows until the test's own clock
runs out, and three such tests failed their first attempt in every release tier on 18 October while
passing first time alone. So the config runs them in a `heavy` project after every other test has
finished, whether those passed or not, with at most two at once. A run's list shows them as `[heavy]`,
at the end, and still run after `-x` has stopped the rest. `one` runs a spec or test as asked, with
nothing held back (`--no-deps`). Tag a test only
when it has failed a tier's first attempt and passes alone; a test that is slow alone is not heavy, it
is slow.

The commands below are what the script runs, for reference or for running without it. Node runs in
Docker here, so Playwright runs in a container. They take the packages from the `tamu-js-smoke-nm`
volume, so run the script once first; or drop that mount to use the checkout's own install.

**Against dev or production:**

```bash
docker run --rm -v "$PWD:/work" -v tamu-js-smoke-nm:/work/node_modules -w /work \
  -e AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu \
  -e AGGIEMAP_EXPECTED_GTAG_ID=G-71VY0QZS5P \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  npx playwright test --config=playwright.aggiemap-smoke.config.ts
```

Production uses `https://aggiemap.tamu.edu` and `G-GNS4JMVEZW`.

On Windows, prefix with `MSYS_NO_PATHCONV=1` and give the mount as a Windows path.

**Against a local dev server**, share the dev server container's network namespace so the browser
reaches it on `localhost`. The script's `local` environment does this for you:

```bash
docker run --rm --network container:aggiemap-dev -v "$PWD:/work" -v tamu-js-smoke-nm:/work/node_modules -w /work \
  -e AGGIEMAP_SMOKE_BASE_URL=http://localhost:4200 \
  -e AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES="Dining Locations" \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  npx playwright test --config=playwright.aggiemap-smoke.config.ts
```

`localhost` rather than a Docker gateway address, for two reasons that each cost an hour to find:

1. **The Angular dev server rejects unknown `Host` headers** - and serves "Invalid Host header" with
   status **200**, so a status check passes on a page containing no application at all.
2. **The dining API's CORS allowlist names specific origins.** `http://localhost:4200` is on it; a
   gateway address is not, so `Dining Locations` fails to fetch. That layer is in the shared main
   layer set, so it appears to break every map.

**And `localhost` rather than `127.0.0.1`**, which also passes both of the above: `isTesting` keys off
the host containing `dev` or `localhost`, so `127.0.0.1` makes the application take its **production**
path. It then lists production's maps, without the dev-only ones such as the satellite-campus maps,
and a local run skips them while still passing (#1114).

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `AGGIEMAP_SMOKE_BASE_URL` | `https://aggiemap.tamu.edu` | environment to check |
| `AGGIEMAP_EXPECTED_GTAG_ID` | unset | asserts the environment reports to its own analytics property; skipped when unset |
| `AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES` | none | layer titles whose failure is expected here; still reported in annotations |
| `AGGIEMAP_SMOKE_MIN_MAPS` | `55` | floor below which discovery is treated as broken |
| `AGGIEMAP_SMOKE_BLANK_LOADS` | `6` | how many plain loads of `/map/d` `blank-map.spec.ts` makes |
| `AGGIEMAP_SMOKE_ANALYTICS` | `block` | `allow` lets analytics requests through for a deliberate run |
| `UPDATE_FRAMING_BASELINE` | unset | `1` makes `framing.spec.ts` record `framing-baseline.json` instead of comparing; production only |
| `AGGIEMAP_SMOKE_FRAMING` | `full` (`release` from `run-local.sh`) | `release` makes `framing.spec.ts` open one route per map; ignored when refreshing the baseline |
| `AGGIEMAP_SMOKE_TIER` | unset | `quick` runs only the quick tier's set. Set by `run-local.sh <environment> quick`, with `AGGIEMAP_SMOKE_CHANGED`, the changed files, comma-separated |
| `AGGIEMAP_SMOKE_BASE` | the newest `dev-*` tag (`prod-*` for production) | What the quick tier compares the checkout with |

## Analytics is blocked by default

The suite loads every map daily. Left unblocked that is synthetic traffic in the analytics property
every day, indistinguishable from real visitors, contaminating the data anyone would check.
`analytics.spec.ts` is the single place that deliberately allows it, because observing the requests
is how it verifies the tag works.

## Scheduled runs

`.github/workflows/aggiemap-smoke.yml` runs this daily against dev and production as separate jobs,
and on demand via **Run workflow**. A passing run leaves nothing but a green check; a failing one
uploads the report and opens one issue per environment, which closes itself on recovery.

Scheduled workflows run from the default branch, so changes here take effect once merged to
`development`.

## Caution when probing by hand

`curl` defaults to `Accept: */*`, and the SPA fallback only rewrites requests that accept
`text/html`. Every deep link therefore appears to 404 under curl while working perfectly in a
browser. Pass `-H "Accept: text/html"`.
