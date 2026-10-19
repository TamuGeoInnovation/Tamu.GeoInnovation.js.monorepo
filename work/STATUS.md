# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. The home session reads it before writing a batch or asking the maintainer anything.

Last written **11:10 AM Central, 19 October 2026**. **This machine now directs** (handed over by home at 7:47 AM);
it still does its own testing job, and this file still says what it is doing. Clock times here are read from PowerShell or from a
commit timestamp, not estimated.

**Last batch done: 13 (its queue is done).** **Batch 9 — the final test — is running now.**

## Running now

**Batch 9, step 2: dev's screenshot set as production renders it.** Started **9:32 AM Central**, 100 of 848 at
9:50, 0 failed, about 150 minutes left.

| | |
| --- | --- |
| Container | `vb-dev-8951a6364-as-prod` |
| Command | `capture.mjs --env development --as production --release 8951a6364` |
| Build | `main-5IW7YA32.js` on dev — Release-484 |
| Release key | the commit, not a `dev-*` tag: 5B means no tag until a rerun is clean |
| Then | `review.mjs` against **`prod-2026-10-16-corrected`** |

Also running, all light: the AVP poller, the listener watchdog, the branch watcher.

## Home has done both its batches

- **Batch 1:** `fix/1952-qualified-field-deep-links` (`e8507c433`) and `fix/1953-draw-event-view-and-flash`
  (`6185cf308`), both pushed to the fork, both red-first proven, both checked `exit 0`. Reviewed here: the matcher
  is backwards compatible, the `.catch` is scoped to the lookup alone, and the new `lot-links.spec.ts` asks the
  service for its object ids rather than hard-coding them, so it survives a republish.
- **Batch 2:** the release notes updated to Release-484's tier (`498a24076`), #1935 commented. The notes branch
  stays on home and is not pushed; home owns that file.

Both pull request bodies are drafted here **from the template file**, with `Closes #1952` and `Closes #1953` and
no other closing keyword, waiting on screenshots and checks.

## The director's queue, waiting for the capture to finish

Home's two branches are ready and **nothing heavy runs beside the capture**, so these are queued rather than
started — the rule added to `DIRECTOR.md` this morning:

1. `scripts/check-in-volume.sh` on each branch, as CI does.
2. Before/after screenshots for both (they stay on this machine until the Kubernetes visual compare exists).
3. Release-notes entries and *What to test on dev* rows.
4. Open both pull requests from the template.

Reviewed in the meantime, which is light: both diffs read, and the matcher change is **backwards compatible** —
`'LotName'.split('.').pop()` is `'LotName'`, so the thirteen services that already worked still match.

## codex-home is withdrawn, presumed stopped

Never took batch 2 (pushed about 7:50 AM), did not answer the 9:05 AM ask, 97 minutes silent at 9:40. Batch 2 is
replaced with `## Withdrawn — presumed stopped`, so a late-waking agent stops instead of doing work that may have
moved. **Nothing is lost:** it was chosen as abandonable work and was never on the release path, and it has not
been given to another machine — home has more important work. The watchdog no longer watches it; the branch
watcher catches it if it wakes.

## Issues filed today

| | |
| --- | --- |
| #1951 | **High** — Transportation Services' server, with the query matrix as evidence |
| #1952 | **Medium** — the deep-link matcher, with the 14-service audit |
| #1953 | **Medium** — `drawEvent` losing the view and flash |
| #1954 | **priority not set** — a `?lot=` link can select a feature the map's filter excludes (home's finding; it suggests Medium, and the maintainer decides) |

## work: the nine contaminated failures were this machine's, proven

**`maps.spec.ts` re-run alone: 74 passed, 0 failed, exit 0, 17.3 minutes.** Every map that failed or went flaky in
the tier passed, `/map` included — the one that had failed all three attempts.

So of the tier's eleven failures and flakes, **ten were contention this machine caused** by running a browser loop
and query matrices beside the tier, and **one is real**: the AVP popup, #1951, Transportation Services' server.

## work: finished — batch 9's full tier on Release-484

**880 passed, 2 failed, 7 flaky, 30 skipped of 919, 1.1 hours, exit 1.** Commit `8951a6364`, Release-484.
**Not tagged** (the maintainer's decision 5B: no tag until a rerun is clean).

### The one failure that is real

`directions.spec.ts:72` — the AVP feature popup, `/parking/avp-parking/map?feature=AVP-parking-lots:26135`:
*"did not open its popup"*, three attempts. **Transportation Services' server**, confirmed on production
independently: their `AnyValidPermitParking` service fails about half its queries, and the same deep link on
production opened its popup on only **4 of 8 loads**. Nothing in this release causes it; production has it too.

### The rest are this machine's fault, not the release's

**While the tier was running, this machine ran an 8-load Playwright browser loop against production and several
query matrices**, to answer the maintainer's questions. Every other failure falls inside that window:

| | |
| --- | --- |
| Failures at tests | 75, 96, 129 (the AVP one, before the window) — then 688, 690, 691, 693, 695, 696, 698, 704, 729 |
| The window | roughly tests 670-730 |
| Their shape | all `maps.spec.ts:226` "loads and serves its layers", each **2.1-2.3 minutes**, a timeout rather than a broken layer |
| Their spread | `/map`, `/operations/construction-map`, `/parking/baseball-parking`, `/events/womens-basketball` — nothing in common |

Six of them recovered on a retry and are reported as flaky; **`/map` failed all three attempts**, and all three fell
inside the window. One `search-sources.spec.ts` test was flaky in the same stretch.

**This machine warned in writing that two runs would contend, then ran browser work beside the tier anyway.** The
rule it needs, and which belongs in `DIRECTOR.md`: nothing heavy runs on a machine while a tier or capture runs
there; questions wait, or go to another machine.

**So the tier's verdict is not yet usable.** `maps.spec.ts` is re-running alone to settle it.

## work: checked development exit 0

**`8951a6364` passes, every project.** This is the real check; the `affected` attempt before it ran nothing (see
below), so this is the one that counts.

| Target | Result |
| --- | --- |
| lint | **Successfully ran for 113 projects** |
| test | **Successfully ran for 106 projects** |
| build | **Successfully ran for 14 projects** |

`scripts/check-in-volume.sh chk/development all`, Node 24.22.0, volume `tamu-js-chk-development`. Lint, test and
build took about six minutes between them after `npm ci`. Log:
`C:/TAMU/wt-chkdev/check-tamu-js-chk-development-all.log`.

**`ui-kits-ngx-forms` ran and passed**, both `lint` and `test` — so the one assertion that failed on
`chore/1479-vitest` at `b77b61426` is not failing in what is merged. The branch result this machine pushed at
7:05 AM stands as it was reported, and is now superseded by this.

**So batch 9's first condition is met.** It now waits only on Azure listing a release at `8951a6364` or later with
its dev stage succeeded.

## The `affected` attempt that ran nothing

Kept here because the instruction that produced it is still in batch 13. **The first `CHECK development` exited 0
having run no task at all**: `affected` compares against `origin/development`, and the branch being checked *is*
`origin/development`, so nothing was selected.

```
=== affected lint  ...   NX   No tasks were run
=== affected test  ...   NX   No tasks were run
=== affected build ...   NX   No tasks were run
```

Two minutes, almost all `npm ci`, and an `exit 0` that was about to be reported as clearing the final build.
**`CHECK development` has to be `all`.** A branch has something to be affected against; `development` does not.

## Batch 13 — open, nothing running

**`CHECK refactor/1478-zoneless` never started.** It was added and withdrawn within the same watch, so there is
nothing part-done and nothing to finish: no branch was fetched, no volume clone made, no check run. Waiting for
`CHECK chore/1479-vitest`.

Read at 6:30 AM Central. This machine now takes the **pre-merge full checks**. The batch's queue holds no `CHECK`
line yet, so nothing has been run. Each one will be `scripts/check-in-volume.sh <branch>` (full affected) after
fetching the branch from the maintainer's fork and `git fetch origin`, with
`work: checked <branch> exit <code>` pushed here the moment each finishes, failing targets included.

The machine is idle and nothing competes for it: no suite, no capture, no dev server. The Docker volume's Nx
cache is warm from yesterday's checks.

## The overnight rehearsal did not happen

**No release at `33da307ff` or later reached dev overnight**, so batch 9's rehearsal never started, exactly as its
condition says. Azure at 6:27 AM Central is unchanged from 10:10 PM:

| Release | Build | Commit | Dev stage | Qualifies for the rehearsal? |
| --- | --- | --- | --- | --- |
| Release-483 | 20261018.37 | `af33dc01e` (18 Oct, 17:40) | succeeded | **No** — older than `33da307ff` (20:55) |
| Release-482 | 20261018.33 | `70f0e424b` | succeeded | No — batch 8 ran on this |

The Azure watcher is still running and still tests ancestry rather than release number.

## Queued

**Batch 9 (#1849) — the final release, waiting on its build.** The 19 October revision replaces the rehearsal and
every earlier hold: it runs on **the release of `8951a6364` or later**, as soon as Azure lists it with the dev
stage succeeded **and `CHECK development` has passed**, and **it tags** if the full tier passes outright.

Two conditions, and both are tracked here:

| Condition | State at 7:20 AM Central |
| --- | --- |
| `CHECK development` at `8951a6364` passes | **running** — see above |
| Azure lists a release at `8951a6364` or later, dev stage succeeded | **not yet**; the newest is Release-483 at `af33dc01e`, which is older |

**The Azure watcher was retargeted from `33da307ff` to `8951a6364`.** It had been set for last night's rehearsal,
and `33da307ff` is an ancestor of `8951a6364`, so it would have fired on an intermediate build and started the
final test on the wrong release. It still tests ancestry rather than release number.

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
