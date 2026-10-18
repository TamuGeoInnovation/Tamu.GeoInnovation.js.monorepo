# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **2:05 PM Central, 18 October 2026**.

## Running now

**Nothing.** The machine is idle and free for the next batch. No suite, no capture, no containers of this
machine's running.

## Finished since the last report

- **Batch 3 (#1849)** — the release tier on **Release-479, build 20261018.12, `86893756c`**: 523 passed, 0
  failed, 3 flaky, 29 skipped of 555, 41.6 minutes. **Tagged `dev-2026-10-18-2` and pushed.** Report
  `work/reports/2026-10-18-3.md`.
- **Batch 4 (#1716)** — the three flaky tests run alone, against dev and against production. All passed on the
  first attempt except `basemap-zoom.spec.ts` against production, which cannot pass there at all. Posted on
  #1716. Report `work/reports/2026-10-18-4.md`. **It was run by a different method from the one batch 4
  specifies** — see that report before reading the numbers as a failure rate.
- **Two issues filed from those measurements**, each with every field set:
  [#1889](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1889) (Medium — 3D on the
  vector basemap takes 5.5 minutes alone against 2.0 on the raster one) and
  [#1890](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1890) (High — the suite
  cannot run against production until production has ArcGIS 5.0, and the failure reads as a production fault).

## Not started

- **Batch 5** — capture production's complete `tools/visual-baselines` set as tonight's "before", about two
  hours. **Not started.** The maintainer asked this machine to wrap up instead. It is ready to start on a word,
  and nothing else is running against production, so the tool's "never while a suite runs against the same
  environment" rule is satisfied right now.
- **Batch 4's own method** — three attempts per test per commit with `--retries=0`. Not run; what was run
  establishes that a first attempt alone succeeds, not a failure rate.

## Told directly

- **18 October, early afternoon** — the production-stage cancellations are **deliberate**; the maintainer is
  holding production. Release-474 to 479 showing `Production = canceled` is not a pipeline fault. Recorded in
  `eb6318c2a`; nothing to investigate.
- **18 October, early afternoon** — file the 3D vector-basemap slowness as **Medium**. Done: #1889.
- **18 October, early afternoon** — file the production/ArcGIS-5.0 suite mismatch as **High**. Done: #1890.
- **18 October, after batch 3** — run the three flaky tests against both commits (batch 3's decision 2A). Done,
  by a different method; see the batch 4 report.
- **18 October, morning** — `AZURE_DEVOPS_PAT` was added to this machine, read-only (Release and Build). **The
  note in batches 4 and 5 that this machine has no token is out of date**: releases, build numbers and stage
  status are readable from here, and batches 2 and 3 used them.
- **18 October, morning** — tag the build if the tier passes. Done for batch 1 (`dev-2026-10-18`) and batch 3
  (`dev-2026-10-18-2`); batch 2 was held because of #1857, as that batch directed.
