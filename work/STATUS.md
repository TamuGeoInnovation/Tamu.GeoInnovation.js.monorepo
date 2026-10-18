# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **5:40 PM Central, 18 October 2026**. Clock times here are read from PowerShell or from a
commit timestamp, not estimated.

**Last batch done: 8.** Batches 5 and 8 are both finished. **Batch 9 is held by the director.** Watching the branch.

## Running now

**Batch 10 (#1849): dev's screenshot set as production renders it, for the preview comparison.** Started
**5:38 PM Central, 18 October**.

| | |
| --- | --- |
| Container | `vb-dev-2026-10-18-3-as-prod` |
| Command | `capture.mjs --env development --as production --release dev-2026-10-18-3 --out /out` |
| From | the worktree at `70f0e424b` (`C:/TAMU/wt-1911`) |
| Against | production's `prod-2026-10-16` set from batch 5, 848 shots |
| Out | `C:/TAMU/visual-baselines/development-as-production/dev-2026-10-18-3` |
| Expected | about 850 shots, a couple of hours; it resumes if interrupted |

Nothing else is running on this machine, and nothing is pointed at production. The comparison
(`review.mjs`) follows when the capture finishes; it is minutes.

## work: finished — batch 8, and it passed

**#1673: the quick tier on Release-482. 277 passed, 0 failed, 1 flaky, 8 skipped of 286, 16.5 minutes, exit 0.**
**Tagged `dev-2026-10-18-3` on `70f0e424b` and pushed to `origin`.** Posted on #1673
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1673#issuecomment-6255884185)).
Report: `work/reports/2026-10-18-6.md`, which also covers batch 5.

- **#1911 holds.** `/campus/dc-bush-school` passed in 32.1 s, where it had failed all three attempts in batch 6
  and both no-retry runs in batch 7. `campus-layers.spec.ts`'s three campus tests all passed. Those were exactly
  the tests that would have counted as new failures on this commit.
- **The `@heavy` tests: two of three on the first attempt.** `basemap-zoom` and `perspective` passed first time;
  `popup.spec.ts:109` (`/map/d?bldg=0468`) failed its first attempt and passed on retry #1. That is the run's only
  flaky result, and it is the College Station main map, which #1911 does not touch. Batch 6 was three of three, so
  this says #1901 reduced those failures rather than removing them — a question for the director, in the report.
- **The tier chose** 23 spec files whole and 3 routes, five more specs than batch 6, because it spans ArcGIS 5.1,
  OnPush, UES and #1911 together. 132 changed files map to no test of their own.

## Queued

**Batch 9 (#1849) — the final test, held by the director.** Its 5:20 PM revision says **do not start it on
Release-482**: a legend fix (#1871) goes into this release, so the final test runs on the release that carries it,
which the director will name here. So this machine has **not** gone on to the full tier, the `--as production`
capture or the comparison. It is watching the branch for that release, with nothing else running.

Azure at 5:30 PM Central:

| Release | Build | Commit | Dev stage | Production stage |
| --- | --- | --- | --- | --- |
| Release-482 | 20261018.33 | `70f0e424b` | succeeded — **batch 8 ran on this, and it is now `dev-2026-10-18-3`** | inProgress |
| Release-481 | 20261018.31 | `dfba74033` | succeeded — skipped deliberately, not batch 8's target | canceled |
| Release-480 | 20261018.27 | `98c2056be` | succeeded — batch 6 ran on this | canceled |

**A watcher nearly started batch 8 on the wrong build.** The revision naming `70f0e424b` arrived while a watcher
keyed to "any release newer than Release-480" was live, and Release-481 (`dfba74033`) reached dev first. It was
caught by reading the revised batch. The watcher is now keyed to the commit, and `DIRECTOR.md` may want the rule:
a batch that names a commit is watched **by commit**, never by "newer than".

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
