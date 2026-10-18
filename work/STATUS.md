# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **2:05 PM Central, 18 October 2026**.

Last batch done: 6 (failed; nothing tagged). Batch 5 still running.

## Running now

**Batch 5: production's visual-baselines set**, started **1:48 PM Central, 18 October**.

| | |
| --- | --- |
| Container | `vb-prod-2026-10-16` |
| Command | `capture.mjs --env production --release prod-2026-10-16 --out /out` |
| From | a worktree at `447d403e6` (`origin/development`) |
| Confirmed | build `main-TK2R62YY.js`, which is what production serves |
| Scale | **848 shots**, 424 routes x 2 viewports, 0 already on disk |
| Out | `C:/TAMU/visual-baselines/production/prod-2026-10-16` |
| Expected | about two hours, so roughly 3:50 PM |

It resumes if interrupted, so a restart costs only what it had not reached. Nothing else should run
against production while it does.

## work: started — batch 7 (#1867)

**Why `/campus/dc-bush-school` never finished drawing on Release-480**, started **3:44 PM Central**, from
the worktree at `98c2056be`. Batch 5's capture is **paused again** (at 375 of 848) for the same reason as
batch 6: these are measurements, and a loaded machine would make a slow page look like a broken one.

Running, in order: `one "dc-bush-school" --retries=0` twice against dev, once against production, then a
probe run on dev recording `drawing`, updating layer views with feature counts, and failing or unfinished
requests every 10 seconds for three minutes.

## work: finished — batch 6 (#1867)

**The quick tier on Release-480, build 20261018.27, `98c2056be` failed. Nothing tagged.**
246 passed, **1 failed**, 1 flaky, 5 skipped of 253, 14.5 minutes, exit 1. Posted on #1867; report to
follow.

- **#1901 works.** All three `@heavy` tests passed on their **first attempt** — `basemap-zoom.spec.ts:19`,
  `popup.spec.ts:109`, `perspective.spec.ts:96`. The first two had failed first attempt in every tier they
  had run in. That is #1716's first proof, and it held on a build that is also an ArcGIS major step.
- **The failure is `popup.spec.ts:79`, `/campus/dc-bush-school`**, three attempts out of three: *"the map
  on /campus/dc-bush-school never finished drawing"*. Not contention — the contended tests passed in the
  same run. Either ArcGIS 5.1 under software WebGL (#1867, #1897 warned of exactly this) or that campus's
  known service problems (#1247, #1464, #1248). **This run does not establish which.**
- `map-coordinates.spec.ts:91` was flaky once.

**Batch 5's capture was paused 3:15–3:30 and is running again**, from 350 of 848.

## Waiting on a build

**Batch 6 (#1867)** — the quick tier on the first ArcGIS 5.1 build. `c03c56144` (#1894) is on
`development`, and `development`'s head is now `6ca6eb7e7`, but **Azure lists no release for either**:
the newest is Release-479 at `86893756c`. Watching for one, as the batch says. Nothing started.

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

- (Batch 5 is now running; see above.)
- **Batch 4's own method** — three attempts per test per commit with `--retries=0`. Not run; what was run
  establishes that a first attempt alone succeeds, not a failure rate.

## For the home session: a protocol gap, found the hard way

**This machine offered the maintainer work that was not in any batch, and he stopped it.** After batch 4
it noticed that two complete production sets would exist once batch 5 finishes - `prod-2026-10-06-2`,
842 shots, and `prod-2026-10-16` - ten days apart, covering what the 8, 12, 13 and 16 October releases
did to production's appearance. Nobody has run that comparison. This machine put it to him as "want me
to run it when the capture finishes?".

**He said no: he will direct it from the home computer, and this machine should not start it.** He also
asked that this be written down here so the two machines' rules can be tightened.

The rule already existed - "Do only this batch, then report and stop. Don't start other work, **or offer
to**" - and this machine reported *and then offered*, which is the half that was missed. His reason is
worth recording in full, because it is about more than one comparison: **work begun off-protocol is
invisible to the other machine.** It duplicates effort, it competes for the same environment, and it
leaves him approving things piecemeal instead of deciding which machine does which piece.

What he asked for instead: **make notes and file issues freely, and wait for instructions before doing
anything.**

Worth the home session's attention when it next writes `TASKS.md`:

1. **The rule needs to bite in both directions.** It is written for this machine. Nothing says what the
   home session does when *it* spots work this machine is better placed for.
2. **There is no channel for "this is possible" that is not also a request.** `STATUS.md` has *Running
   now*, *Finished*, *Not started* and *Told directly* - all about work already chosen. A findings
   section, read but never acted on without a batch, would have caught this: the comparison would have
   been recorded for him to direct, and never offered.
3. **"Not started" is ambiguous.** It currently holds both "a batch this machine has not reached" and
   "an idea nobody has approved". Those should not share a heading.

The comparison itself is parked, not dropped: both sets will be on disk, `review.mjs` produces it in
minutes, and it is his to direct from the home machine.

## Told directly

- **18 October, 3:42 PM** — **a new batch in `work/TASKS.md` is this machine's instruction: start it
  without waiting to be asked.** Keep a background watcher on the branch at all times, as `DIRECTOR.md`
  says, so new batches start on their own. (Batch 7 started on this basis.)

- **18 October, 2:40 PM** - do not start the production-vs-production baseline comparison; he will direct
  it from the home computer. Make notes and file issues from what is found, but **wait for instructions
  before doing things**. See the section above.

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
