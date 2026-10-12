# Load timing

Measures a page's first load, so a change meant to make it faster can be shown to have done it (#1454).
Three small scripts, run in the Playwright container the smoke suite uses.

| Script | What it does |
| --- | --- |
| `measure-load.js <url> <label> <runs> [mobile]` | Loads the page in a fresh browser each run and prints the median and every run as one line of JSON: first and largest contentful paint, when the map probe reports the map ready, requests, and the application's own JavaScript. `mobile` emulates a mid-range phone on Fast 4G (4x CPU, 1.6 Mbps, 150 ms), Lighthouse's mobile preset. |
| `serve-and-measure.js <dist dir> <label> <runs> <path to measure-load.js>` | Serves a production build from a folder, gzipped, and measures `/map` at desktop and phone settings. Use it to compare two builds on the same machine. |
| `bundle-breakdown.py <stats.json> <file name fragment>...` | Says what each named output file is made of, by library, from a build made with `--stats-json`. |

## Comparing two builds

Build each with `nx build aggiemap-angular --configuration=production --stats-json`, then for each:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "<checkout>:/work" -v "<checkout>/dist/apps/aggiemap-angular:/dist:ro" \
  -v tamu-js-smoke-nm:/work/node_modules -w /work mcr.microsoft.com/playwright:v<version>-noble \
  node tools/load-timing/serve-and-measure.js /dist <label> 5 tools/load-timing/measure-load.js
```

Run the pair twice, alternating, on a machine doing nothing else: a smoke run alongside changes the
numbers. A build served from `localhost` uses the production GIS services, so map-ready times include
their response times; the paint times and the JavaScript sizes are the build's own.

Results go in [`docs/build-times.md`](../../docs/build-times.md), under *Page load*.
