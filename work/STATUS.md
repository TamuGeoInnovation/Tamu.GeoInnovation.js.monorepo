# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **5:05 PM Central, 18 October 2026**.

**Last batch done: 7.** **Batch 5 is finished.** Batch 8 is queued, waiting on its build.

## Running now

Nothing. Only the watchers: one on Azure for the `70f0e424b` release, one on this branch.

## work: finished — batch 5, production's "before" set

**848 of 848 shots, 0 failed.** Posted on #1849
([comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1849#issuecomment-6255683209)).

| | |
| --- | --- |
| Container | `vb-prod-2026-10-16`, exit 0 |
| Command | `capture.mjs --env production --release prod-2026-10-16 --out /out` |
| From | a worktree at `447d403e6` (`origin/development`) |
| Build captured | `main-TK2R62YY.js`, which is what production serves; the manifest records it |
| Shots | **848** — 424 desktop (1440x900) and 424 phone (390x844) |
| Failed | **0** |
| Started / finished | 1:48 PM / **4:47 PM Central**, 2 h 59 m including two pauses for batches 6 and 7 |
| Out | `C:/TAMU/visual-baselines/production/prod-2026-10-16` |

**It is one build throughout, which is what makes it usable.** A production stage was `inProgress` on Azure while
the capture ran, so the served bundle was recorded every two minutes: `main-TK2R62YY.js` at every sample from
start to finish. A set spanning a deploy would have been a mix of two builds and worth nothing as a baseline.
Read-only — one GET of the home page; nothing of this machine's touched production.

**The home session may want to check that the promotion now in flight is intended.** At 5:00 PM Central
Release-481 (`dfba74033`) shows `GIS-1P Production = inProgress`, while the note further down this file says
earlier production cancellations were deliberate because the maintainer is holding production. Production still
served the old bundle at 5:00 PM. This machine has done nothing about it and will not.

## Queued

**Batch 8 (#1673) — the quick tier on dev's build with OnPush on the map.** The 5 PM revision is read: it runs on
the release at **`70f0e424b`** (#1910's fix, PR #1911), **not** the one at `dfba74033`. The Azure watcher was
changed to match that commit, so the `dfba74033` release will not start it by mistake.

Azure at 5:00 PM Central:

| Release | Build | Commit | Dev stage |
| --- | --- | --- | --- |
| Release-481 | 20261018.31 | `dfba74033` | **inProgress** — not batch 8's target |
| Release-480 | 20261018.27 | `98c2056be` | succeeded (batch 6 ran on this) |

No release for `70f0e424b` yet. Two watchers are running, one on Azure and one on this branch, so batch 8 starts
on its own. Nothing else is running now, so it gets the machine to itself.

Also understood from batch 8's **Decided**: on `70f0e424b` a `/campus/dc-bush-school` failure is **new**, not
known, and so are `campus-layers.spec.ts`'s three campus tests. Batch 7's `0/0` layers was this machine's script
reading the wrong probe field, not a probe fault — the suite's layer checks stand.

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

- **`/campus/dc-bush-school` takes ~100 s to stop painting on 5.1.** Now explained by **#1910**. Whether a
  visitor sees it is still unknown: the suite runs headless Chromium with software WebGL, and a real browser with
  a GPU may be unaffected. The maintainer is looking at dev by hand.
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
