# Builder destination inventory

Eleven AggieMap maps cannot be reached by URL. `/events/:eventId` redirects to
`builder/accommodations`, and `/events/:eventId/map` redirects straight back until a selection has
been made — so the smoke suite has nothing to test on them and times out.

Each of those maps does offer a **share URL** once it loads, which encodes the chosen settings. This
tool walks every combination of every builder and records where each one lands, so those share URLs
become stable targets the smoke suite can load directly.

It is a generator, not a test. It lives outside `test/smoke` so scheduled runs never execute it. Run
it by hand when a builder's choices change.

## Output

| File | Purpose |
| --- | --- |
| `builder-inventory.generated.json` | machine-readable baseline, consumed by the smoke suite |
| `BUILDER-INVENTORY.md` | the same data as tables, for reading and reviewing in a pull request |

Both are rewritten after every destination, so progress is visible during a run and a crash keeps
whatever was gathered.

For each path it records the steps taken, **every choice offered at each step**, the share URL, and
the destination's layers. The `offered` lists are what make a renamed or removed choice show up as a
diff instead of a silent change.

## Running it against a deployed environment

```bash
AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu \
  npx playwright test --config=tools/builder-inventory/playwright.config.ts
```

It needs `test/smoke/aggiemap/map-manifest.generated.json` to know which routes exist, which the
smoke suite's global setup writes. Run the smoke suite once against the same environment first, or
set `BUILDER_INVENTORY_ONLY`.

The map probe (`window.__tamuGiscMapProbe`) must be present in the deployed build, or layer data comes
back empty and only the share URLs are captured.

## Running it against a local dev server

Node runs in Docker here, so Playwright runs in a container and the dev server runs in another. Use
`--network container:` so the browser shares the dev server's network namespace and reaches it on
`127.0.0.1`:

```bash
docker run --rm --network container:aggiemap-dev \
  -v "C:\TAMU\Tamu.GeoInnovation.js.monorepo:/work" -w /work \
  -e AGGIEMAP_SMOKE_BASE_URL=http://127.0.0.1:4200 \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test --config=tools/builder-inventory/playwright.config.ts
```

`127.0.0.1` rather than a host gateway address, for two reasons that both cost an hour to find:

1. **The Angular dev server rejects unknown `Host` headers** — and serves "Invalid Host header" with
   status **200**, so a status check passes while the page contains no application at all.
2. **The dining API's CORS allowlist names specific origins.** `http://127.0.0.1:4200` is on it; a
   Docker gateway address is not, so `Dining Locations` fails to fetch on every map. That layer is in
   the shared main layer set, so it affects every destination, and it is not a real fault.

Sharing the network namespace satisfies both without touching the API's allowlist.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `AGGIEMAP_SMOKE_BASE_URL` | `https://aggiemap.tamu.edu` | environment to walk |
| `BUILDER_INVENTORY_ONLY` | — | comma-separated routes, for iterating on one builder |
| `BUILDER_INVENTORY_CONCURRENCY` | `4` | concurrent walks; each holds a browser context and an Esri map |
| `BUILDER_INVENTORY_MAX` | `600` | per-map safety cap on destinations |

## A caution about curl

`curl` defaults to `Accept: */*`, and `connect-history-api-fallback` only rewrites requests that
accept `text/html`. So every deep link appears to 404 under curl while working perfectly in a
browser. Pass `-H "Accept: text/html"` when probing routes by hand.
