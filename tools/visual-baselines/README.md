# Visual baselines

A complete set of screenshots of every map AggieMap serves, for one environment, at one release.

A change like [#1497][1497] or [#1508][1508] can move the symbology of every drawn map at once.
Nothing in the pull request checks notices that, and two screenshots cannot answer it. The only
honest way to see what moved is a complete before and after - which only exists if the "before" was
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
| `--force` | Overwrite a release whose bundle no longer matches - deliberate only |

A run **resumes**: a shot already on disk is skipped, so an interrupted crawl costs only what it had
not reached. A full set is about 850 shots and takes a couple of hours.

## How a set is named

```
<out>/<environment>/<release>/manifest.json
<out>/<environment>/<release>/desktop/<slug>.png
<out>/<environment>/<release>/phone/<slug>.png
```

**The release is the key**, because that is the question people actually ask - what did Construction
look like in the second 6 October release - and because a tag is shared between machines and outlives
any one capture. Environment first, so the same release can be compared across environments.

**A tag is a claim; the bundle hash is the proof.** Nothing in the browser says which commit an
environment is serving: the build banner prints unsubstituted placeholders on dev and production,
because token substitution runs only in the Dockerfile and those are served by IIS ([#1306][1306]).
So the manifest records both - the release tag, the commit it names, and the bundle content hash
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

It writes a page with before, after and **what changed** for each route, sorted by how much moved, with
a toggle for "only what changed". The third column is drawn by `review.mjs` itself ([#2357][2357]), into
`<diffDir>`: the after shot dimmed, with every pixel that moved more than rendering noise in pink. A page
whose size changed (a GIS Day page that grew) gets no picture, since its pixels do not line up. That page is what the decision to delete 95 hard-coded renderers
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

## Capturing each release by itself

```bash
node tools/visual-baselines/poll.mjs --out <baselines> [--dry-run]
```

On the cluster a CronJob runs this every 15 minutes ([#2355][2355]). It reads the newest `dev-*` and `prod-*`
tag in its checkout, and if one has no finished set, it captures it, compares it with the previous set of
the same kind (dev with the last dev, production with the last production) and rebuilds the pages. So a
release gets its set and its comparison with nobody starting them.

**Tags, not the sites**, decided 25 October 2026: a `dev-*` tag is pushed only after the build passes its
quick tier, and a `prod-*` tag after the deploy, so only tested builds are photographed, under their own
names. A site's `main-*.js` can keep its name across builds whose changes are only in lazy chunks.

**When it will not start**, so it never photographs an environment while a smoke run tests it:

| Rule | Why |
|---|---|
| Not until 60 minutes after the tag (`--wait-minutes`) | the release tier runs on dev after its tag (step 3b of the release sequence) |
| Not between 02:30 and 08:30 US Central (`--quiet`) | the nightly smoke run starts at 6:17 AM, and a capture on the cluster takes about 3.5 hours |
| Not while any set is being captured, by anyone | two captures share the cluster's workers and slow each other until pages time out; a set unfinished and written to in the last 15 minutes is running |

**Every set gets its comparison, however it was captured** ([#2364][2364]). On each run, for each kind of set,
the newest finished set is compared with the one before it if that comparison is missing, or was made
before the newer set finished (from a capture still running). So a set captured by hand with
`start-capture.ps1` needs no `start-compare.ps1` afterwards. A comparison touches neither environment, so
it is not held back by the hour's wait or the quiet window, only by a capture running. A run makes its
comparisons **before** starting a capture, and the capture's own after it, so a build that has just finished
is compared within 15 minutes rather than after the next capture's three hours.

`--dry-run` prints what it would do and why, one line per tag. A set whose capture finished counts as done
even if some shots failed (its log names them), so one page that keeps failing is not retried forever.

## Unfinished maps, and one session per shot

**A map that does not finish is retried once, then photographed and recorded** ([#2346][2346]). A shot counts
as unfinished when its layers are still loading after 60 seconds, it is still drawing after another 60, or
a visible layer never loaded. The manifest lists each one under `unsettled` with the reason, the next run of
the same set takes it again, the comparison page marks a pair with either side unfinished, and the home page
and gallery count and mark them. Until 25 October 2026 such a shot was saved as if it were finished, and the
parking maps in `production/prod-2026-10-20` were compared as if their layers had disappeared.

**Every shot has its own browser session** ([#2347][2347]), except when signed in, where the session is the
sign-in. AggieMap remembers some choices between visits (an event map highlights the last choice made on it),
so with one shared session the phone shot of `/events/big-event` showed whichever choice the desktop shots had
visited last.

## Two things that will catch you

**Wait for the right signal.** `probe.ready` means the layers have settled, about six seconds in.
`probe.drawing === false` means the view has stopped painting, about twenty. Capturing on `ready`
photographs a map fourteen seconds from finished - it produced a 45% "difference" between two builds
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
[2355]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2355
[2346]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2346
[2347]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2347
[2357]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2357
[2364]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2364
