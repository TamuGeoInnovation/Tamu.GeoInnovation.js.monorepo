# Visual baselines

A complete set of screenshots of every map AggieMap serves, for one environment, at one release.

A change like [#1497][1497] or [#1508][1508] can move the symbology of every drawn map at once.
Nothing in the pull request checks notices that, and two screenshots cannot answer it. The only
honest way to see what moved is a complete before and after — which only exists if the "before" was
captured when it was still true.

## Capturing a set

```bash
MSYS_NO_PATHCONV=1 docker run -d --name vb-<release> -m 8g \
  -v "C:/TAMU/Tamu.GeoInnovation.js.monorepo:/repo" \
  -v "C:/TAMU/visual-baselines:/out" \
  -w /repo mcr.microsoft.com/playwright:v1.64.1-noble \
  node tools/visual-baselines/capture.mjs --env production --out /out
```

| Flag | What it does |
| --- | --- |
| `--env` | An entry in `test/smoke/aggiemap/environments.json`, so addresses and gating are the ones every other check reads |
| `--release` | The release tag. Defaults to the newest `prod-*` or `dev-*` tag |
| `--routes-only` | Skip the 363 builder destinations; about 60 pages instead of 421 |
| `--only` | Comma-separated substrings, for asking a narrow question |
| `--concurrency` | Pages at once (default 3) |
| `--as production` | Open every page with `?as=production` (#1722): a development host then uses production's GIS services and hides its development-only features, so its set can be compared with production's. The "acting as production" control is hidden, since production has none. Kept apart, under `<environment>-as-production/` (#1885) |
| `--force` | Overwrite a release whose bundle no longer matches — deliberate only |

A run **resumes**: a shot already on disk is skipped, so an interrupted crawl costs only what it had
not reached. A full set is about 850 shots and takes a couple of hours.

## How a set is named

```
<out>/<environment>/<release>/manifest.json
<out>/<environment>/<release>/desktop/<slug>.png
<out>/<environment>/<release>/phone/<slug>.png
```

**The release is the key**, because that is the question people actually ask — what did Construction
look like in the second 6 October release — and because a tag is shared between machines and outlives
any one capture. Environment first, so the same release can be compared across environments.

**A tag is a claim; the bundle hash is the proof.** Nothing in the browser says which commit an
environment is serving: the build banner prints unsubstituted placeholders on dev and production,
because token substitution runs only in the Dockerfile and those are served by IIS ([#1306][1306]).
So the manifest records both — the release tag, the commit it names, and the bundle content hash
actually served. Re-capturing a release whose bundle has changed is **refused**: either the tag is
wrong or the environment moved under it, and both matter more than the capture does.

## Where they live

Outside the repository, under `<repo>/../visual-baselines` by default, or `AGGIEMAP_BASELINES`.

A set is hundreds of megabytes, and there is one per release per environment. That is not what git is
for, and committing them would make every clone pay for them forever. A set captured on a
workstation is therefore **per machine**: one captured at work is not available at home.

**The shared copy is on the cluster** ([#1533][1533]): captures started there land on one disk that every
machine can see, at `https://visual-baselines.geoservices.tamu.edu/` from Texas A&M networks. How to start
one, and the cluster's side of it, is in the private cluster configuration repository.

## GIS Day

`--app gisday` takes the same pictures of the GIS Day site ([#1980][1980]): every public page reachable
from its home page, one detail page of each kind (a session, a presenter), at the same two viewports.
Each shot is the **whole page**, because GIS Day's pages scroll and a map does not. Its environments
are in `test/e2e/gisday/environments.json`: `production` (txgisday.org) and `local` (port 4201).

```bash
MSYS_NO_PATHCONV=1 docker run --rm -m 8g   -v "C:/TAMU/Tamu.GeoInnovation.js.monorepo:/repo" -v tamu-js-smoke-nm:/repo/node_modules   -v "C:/TAMU/visual-baselines:/out"   -w /repo mcr.microsoft.com/playwright:v1.64.1-noble   node tools/visual-baselines/capture.mjs --app gisday --env production --release sha-0f69d3b --out /out
```

- **Where sets go:** under `gisday-<environment>/<release>/`, beside AggieMap's.
- **The release name:** GIS Day has no release tags until it has a dev site ([#1525][1525]), so pass
  the image tag production runs as `--release`.
- **The local site:** add `--network container:gisday-dev` to reach it. It builds without content
  hashes, so its manifest records `unknown-build`.
- **Not captured:** admin and signed-in pages, which need a sign-in.

## Comparing two sets

```bash
node tools/visual-baselines/review.mjs <beforeDir> <afterDir> <diffDir> <out.html>
```

It writes a page with before, after and changed pixels for each route, sorted by how much moved, with
a toggle for "only what changed". That page is what the decision to delete 95 hard-coded renderers
was actually made on: 30 pages, 9 changed, 21 identical as a control.

When `<out.html>` is `<baselines>/compare/<name>/index.html`, the home page below lists it: `review.mjs`
writes a `summary.json` beside the page with the two sets and how many pages changed.

## Browsing the sets

```bash
node tools/visual-baselines/index.mjs <baselines>
```

It writes the pages for browsing a whole baselines folder ([#2345][2345]):

- **`<baselines>/index.html`**, the home page: every set by kind (production, development, development as
  production, GIS Day), newest first, with when it was captured (US Central), the commit and bundle from its
  manifest, and how many shots it has against how many it should. Then every comparison, with how many
  pages changed, and two drop-downs that give the command for comparing any two sets.
- **`<baselines>/<kind>/<release>/index.html`**, each set as a gallery: desktop or phone, a filter by route,
  each picture opening full size, and a link to the live page it shows.

Run it again after anything changes; on the cluster every capture, comparison and clean-up does. It reads
only what is on disk, so a folder of older sets works too.

**The pages use the repository's shared styles**, not their own: `pages.scss` brings in `libs/sass` (the
`.button`, the `floating-table`, spacing and fonts) and All Maps' `discover-shared.scss` (the page shell,
section headings and `.chip` labels), and `page.mjs` compiles it into each page, for `review.mjs` too. So
writing a page needs the repository's `sass` package; the tests pass their own styles and need nothing.

**Why not an Angular app.** These pages are written by a script beside the two that write the sets, from the
same files they read, and need no build, image or deployment. That costs the Angular components (the copy
field, for example). **Decided 25 October 2026: keep it a static page for now, and consider promoting it to
an Angular app in the monorepo when there is time**, if it grows past browsing (starting a capture, say).

## Two things that will catch you

**Wait for the right signal.** `probe.ready` means the layers have settled, about six seconds in.
`probe.drawing === false` means the view has stopped painting, about twenty. Capturing on `ready`
photographs a map fourteen seconds from finished — it produced a 45% "difference" between two builds
that was really one side caught mid-load, twice, before the tool waited for both.
[`docs/testing-maps.md`](../../docs/testing-maps.md) has the full table.

**Do not capture while a suite is running against the same environment.** On 6 October a capture
started 13 seconds after the production suite, both pointed at production, and thirteen tests timed
out. Neither run meant anything and both had to be thrown away.

[1306]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306
[1497]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1497
[1508]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1508
[1525]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525
[1980]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1980
[1533]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1533
[2345]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2345
