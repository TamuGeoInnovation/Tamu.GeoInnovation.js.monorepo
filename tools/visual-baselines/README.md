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
  -w /repo mcr.microsoft.com/playwright:v1.63.0-noble \
  node tools/visual-baselines/capture.mjs --env production --out /out
```

| Flag | What it does |
| --- | --- |
| `--env` | An entry in `test/smoke/aggiemap/environments.json`, so addresses and gating are the ones every other check reads |
| `--release` | The release tag. Defaults to the newest `prod-*` or `dev-*` tag |
| `--routes-only` | Skip the 363 builder destinations; about 60 pages instead of 421 |
| `--only` | Comma-separated substrings, for asking a narrow question |
| `--concurrency` | Pages at once (default 3) |
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
for, and committing them would make every clone pay for them forever. The consequence is that
baselines are **per machine**: a set captured at work is not available at home.

## Comparing two sets

```bash
node tools/visual-baselines/review.mjs <beforeDir> <afterDir> <diffDir> <out.html>
```

It writes a page with before, after and changed pixels for each route, sorted by how much moved, with
a toggle for "only what changed". That page is what the decision to delete 95 hard-coded renderers
was actually made on: 30 pages, 9 changed, 21 identical as a control.

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
