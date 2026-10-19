# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **10:15 PM Central, 18 October 2026**. Clock times here are read from PowerShell or from a
commit timestamp, not estimated.

**Last batch done: 12.** Batches 5, 8, 10, 11 and 12 are finished. **Batch 9 is still held.** Nothing running; watching.

## Running now

Nothing. The branch watcher only.

## work: finished — batch 12, a corrected copy of production's set

**#1937.** Posted on #1937
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1937#issuecomment-6258040495)).
Report: `work/reports/2026-10-18-9.md`. Nothing moved, nothing deleted.

| | |
| --- | --- |
| Corrected set | `C:/TAMU/visual-baselines/production/prod-2026-10-16-corrected` — 848 shots |
| Original | `prod-2026-10-16` unchanged, mid-load shots included, confirmed after the copy |
| New page | `C:/TAMU/visual-baselines/compare/dev-2026-10-18-3-vs-prod-2026-10-16-corrected/review.html` |

Each replaced shot's checksum was checked against the re-take. The copy's manifest carries a `correction` block
naming the four shots, why, and that production served `main-TK2R62YY.js` for both captures.

- 23 Aug Rudder (accessible): **29.87% to 1.63%**. 23 Aug Clements: **15.70% to 1.54%**.
- **Nothing above 10% on the corrected page is a difference in the software.** The top is now the three dev 404s
  at 83.12%, which cannot be re-taken, then marker re-rendering and a hover state.
- **Batch 9's comparison will use `prod-2026-10-16-corrected` as its "before"**, as directed.

## Queued

**Batch 9 (#1849) — now an overnight rehearsal, waiting on a build.** The 9:40 PM revision: if a release at
**`33da307ff`** or later reaches dev tonight, run the whole batch on it as a rehearsal — full tier, capture,
comparison — **and do not tag it**, because it is not the build that ships. The final clearance runs again in the
morning on the release carrying the layer-order fix (#1939), as its own batch. If nothing new reaches dev
tonight, wait.

**No qualifying release yet.** Azure at 10:10 PM Central:

| Release | Build | Commit | Dev stage | Qualifies? |
| --- | --- | --- | --- | --- |
| Release-483 | 20261018.37 | `af33dc01e` | succeeded | **No** — 17:40, older than `33da307ff` (20:55), and the director said to do nothing with it |
| Release-482 | 20261018.33 | `70f0e424b` | succeeded | No — batch 8 ran on this, tagged `dev-2026-10-18-3` |

**The watcher tests ancestry, not release number.** Release-483 is a higher number than Release-482 and an older
commit, so a "newer than" watcher would have fired on exactly the build that was excluded — the same mistake that
nearly started batch 8 on `dfba74033`. It now asks git whether `33da307ff` is an ancestor of each release's
commit, and only then whether the dev stage succeeded.

## Finished

### Batches 6 and 7 — report `work/reports/2026-10-18-5.md`. Nothing tagged by either.

- **Batch 6 (#1867)**: the quick tier on Release-480, `98c2056be` — 246 passed, **1 failed**, 1 flaky, 5 skipped
  of 253, exit 1. **#1901 works: all three `@heavy` tests passed first attempt**, which is #1716's first proof.
- **Batch 7 (#1867)**: the failure is **ArcGIS 5.1, not that campus's services**. Two dev runs failed, one
  production run passed, no retries — and both environments draw that campus from the same `gis.tamu.edu`
  services, so the ArcGIS version is the only difference. `drawing` stays true about **100 seconds** then stops;
  `ready` at 21 s, so the painting runs long, not the layers. The cause is now **#1910**: the satellite campus
  maps load all 26 College Station layers.

### Earlier today

- **Batch 1** — tagged `dev-2026-10-18`. **Batch 2** — held because of #1857, as that batch directed.
- **Batch 3 (#1849)** — the release tier on **Release-479, build 20261018.12, `86893756c`**: 523 passed, 0
  failed, 3 flaky, 29 skipped of 555, 41.6 minutes. **Tagged `dev-2026-10-18-2` and pushed.** Report
  `work/reports/2026-10-18-3.md`.
- **Batch 4 (#1716)** — the three flaky tests run alone, against dev and against production. All passed on the
  first attempt except `basemap-zoom.spec.ts` against production, which cannot pass there at all. Report
  `work/reports/2026-10-18-4.md`. **It was run by a different method from the one batch 4 specifies** — see that
  report before reading the numbers as a failure rate. Batch 4's own method (three attempts per test per commit
  with `--retries=0`) was not run.
- **Two issues filed from those measurements**, every field set:
  [#1889](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1889) (Medium — 3D on the
  vector basemap takes 5.5 minutes alone against 2.0 on the raster one) and
  [#1890](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1890) (High — the suite
  cannot run against production until production has ArcGIS 5.0, and the failure reads as a production fault).

## Findings

Recorded, not requests. Nothing here is started without a batch.

- **`/campus/dc-bush-school`'s ~100 s paint is fixed.** #1911 shipped in Release-482 and batch 8 saw the page
  pass in 32.1 s. Closed by measurement, not by argument.
- **`/map/d?bldg=0468` failed its first attempt again in batch 8**, after batch 6 was the one run where it did
  not. Two anecdotes pointing opposite ways: #1901 looks to have reduced those failures rather than removed them.
  A question for the director, with options, in `work/reports/2026-10-18-6.md`.
- **The 100 s has no 4.34 counterpart.** One three-minute run on production would give it; not run.
- **The probe "sees no layers" finding is withdrawn.** Batch 8 says the probe does list all 26 layers from a
  browser; batch 7's script read the wrong field. The suite's layer assertions are not vacuous.
- **The production-vs-production baseline comparison** (`prod-2026-10-06-2`, 842 shots, against
  `prod-2026-10-16`) remains parked for the maintainer to direct from the home machine. Both sets will be on
  disk; `review.mjs` produces it in minutes.

## For the home session: a protocol gap, found the hard way

**This machine offered the maintainer work that was not in any batch, and he stopped it.** After batch 4 it
noticed that two complete production sets would exist once batch 5 finishes — `prod-2026-10-06-2` and
`prod-2026-10-16`, ten days apart, covering what the 8, 12, 13 and 16 October releases did to production's
appearance. It put that to him as "want me to run it when the capture finishes?".

**He said no: he will direct it from the home computer, and this machine should not start it.** He also asked that
this be written down here so the two machines' rules can be tightened.

The rule already existed — "Do only this batch, then report and stop. Don't start other work, **or offer to**" —
and this machine reported *and then offered*, which is the half that was missed. His reason is worth recording in
full, because it is about more than one comparison: **work begun off-protocol is invisible to the other machine.**
It duplicates effort, it competes for the same environment, and it leaves him approving things piecemeal instead
of deciding which machine does which piece.

What he asked for instead: **make notes and file issues freely, and wait for instructions before doing anything.**

Worth the home session's attention when it next writes `TASKS.md`:

1. **The rule needs to bite in both directions.** It is written for this machine. Nothing says what the home
   session does when *it* spots work this machine is better placed for.
2. **There is no channel for "this is possible" that is not also a request.** A findings section, read but never
   acted on without a batch, would have caught this. This file now has one; it should be in `DIRECTOR.md`.
3. **"Not started" was ambiguous**, holding both "a batch not reached yet" and "an idea nobody has approved".
   Those are now separate: *Queued* and *Findings*.

## Told directly

- **18 October, 3:42 PM** — **a new batch in `work/TASKS.md` is this machine's instruction: start it without
  waiting to be asked.** Keep a background watcher on the branch at all times, as `DIRECTOR.md` says, so new
  batches start on their own. (Batches 7 and 8 started on this basis.)
- **18 October, 2:40 PM** — do not start the production-vs-production baseline comparison; he will direct it from
  the home computer. Make notes and file issues from what is found, but **wait for instructions before doing
  things**. See the section above.
- **18 October, early afternoon** — the production-stage cancellations are **deliberate**; the maintainer is
  holding production. Release-474 to 479 showing `Production = canceled` is not a pipeline fault. Recorded in
  `eb6318c2a`; nothing to investigate.
- **18 October, early afternoon** — file the 3D vector-basemap slowness as **Medium**. Done: #1889.
- **18 October, early afternoon** — file the production/ArcGIS-5.0 suite mismatch as **High**. Done: #1890.
- **18 October, after batch 3** — run the three flaky tests against both commits (batch 3's decision 2A). Done,
  by a different method; see the batch 4 report.
- **18 October, morning** — `AZURE_DEVOPS_PAT` was added to this machine, read-only (Release and Build). **The
  note in batches 4 and 5 that this machine has no token is out of date**: releases, build numbers and stage
  status are readable from here.
- **18 October, morning** — tag the build if the tier passes. Done for batch 1 and batch 3.
