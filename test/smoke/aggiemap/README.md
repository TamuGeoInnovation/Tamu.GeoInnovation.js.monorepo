# AggieMap smoke suite

Loads every map in a deployed environment and checks that each layer actually resolves and returns
data. It exists because nothing else notices when a map breaks *without* a release: the maps draw
from hosted GIS services, so a layer can stop working because a service was republished or
unpublished — no commit, no build, no signal.

It found the Gameday Parking bike layers drawing the wrong data (#1036) within its first run.

See #1034 for the full plan. Companion tool: [`tools/builder-inventory`](../../../tools/builder-inventory/README.md),
which covers the eleven maps that cannot be reached by URL.

## What it checks

Per map, generated from the routes the environment actually lists:

1. The document is served and Angular renders.
2. The map probe is present — its absence means the build predates it, reported separately from a
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
offers directions, both ways. `maps.spec.ts` also checks no map offers directions where they are
unavailable. When routing returns to production, set `directionsAvailable` to true there.

`development-only.spec.ts` checks development-only work stays off production, both ways, from each
environment's `developmentSectionsVisible`. The sections listed in `development-only.ts` (Directions,
Bus Routes, Experiments) must be offered on dev and absent on production (#1090). The GIS services
listed in `DEVELOPMENT_ONLY_SERVICES` must be requested on dev and never on production (#1229). The
main map and an event map with Aggieland saved as the basemap are both loaded, and every request is
recorded. A service with no production counterpart goes on that list. It comes off only when it is
published for production, together with the code's gate.

`bus.spec.ts` checks every bus route the bus panel lists draws its line and one stop marker for each
stop it lists, and that choosing a route expands it and draws its stops (#1175, for #1174). It reads
what the bus layer drew from the map probe's `graphicTypes`. Routes known to fail are listed per
environment under `allowedBusRouteFailures`, tied to their issue. Where bus routes are not offered yet,
or the deployed build's probe predates `graphicTypes`, it skips.

## Running it

**From a workstation, use the script.** It runs the suite in the Playwright container with the same
settings as the scheduled workflow:

```bash
test/smoke/aggiemap/run-local.sh development   # dev.aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh local-production  # the local dev server as production renders it (127.0.0.1)
test/smoke/aggiemap/run-local.sh production    # aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh local         # a dev server in the aggiemap-dev container
```

Anything after the environment goes to `playwright test`, for example `--grep "gameday"`. It needs
only Docker and bash (Git Bash on Windows). The first run downloads the Playwright image, about 2 GB.

**Each environment's settings live in [`environments.json`](environments.json)**: its address, the
Google Analytics id it should report to, and the layers it is allowed to fail. The workflow and the
script both read that file, so a change there applies to scheduled, manual and local runs alike.
Change expectations there, not in a command line.

The commands below are what the script runs, for reference or for running without it. Node runs in
Docker here, so Playwright runs in a container.

**Against dev or production:**

```bash
docker run --rm -v "$PWD:/work" -w /work \
  -e AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu \
  -e AGGIEMAP_EXPECTED_GTAG_ID=G-71VY0QZS5P \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test --config=playwright.aggiemap-smoke.config.ts
```

Production uses `https://aggiemap.tamu.edu` and `G-GNS4JMVEZW`.

On Windows, prefix with `MSYS_NO_PATHCONV=1` and give the mount as a Windows path.

**Against a local dev server**, share the dev server container's network namespace so the browser
reaches it on `localhost`. The script's `local` environment does this for you:

```bash
docker run --rm --network container:aggiemap-dev -v "$PWD:/work" -w /work \
  -e AGGIEMAP_SMOKE_BASE_URL=http://localhost:4200 \
  -e AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES="Dining Locations" \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test --config=playwright.aggiemap-smoke.config.ts
```

`localhost` rather than a Docker gateway address, for two reasons that each cost an hour to find:

1. **The Angular dev server rejects unknown `Host` headers** — and serves "Invalid Host header" with
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
| `AGGIEMAP_SMOKE_ANALYTICS` | `block` | `allow` lets analytics requests through for a deliberate run |

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
