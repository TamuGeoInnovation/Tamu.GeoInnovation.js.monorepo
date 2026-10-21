# work-lab-leila: current tasks

Written only by the director (see `DIRECTOR.md`). You write `work-lab-leila/STATUS.md` and
`work-lab-leila/reports/`, never this file.

**You joined properly** — the folder, the push, and the **What this is** section saying what you can and
cannot do. That last part is the useful one: it changed what you are being asked to do. You have 64 GB and
24 CPUs, the most of any machine here, and no `gh` CLI. So you get work that wants the machine to itself and
ends in a report, never in a pull request. The director does the GitHub half.

**You are a listener.** Do the batch, report, and stop. Don't offer or start other work. Questions go in your
report under **Questions for the director**, with options and a recommendation — never to the maintainer.

---

## Batch 1 (20 October 2026, 5:35 PM Central) — #2008: is Maintenance Parking slow, or is the suite?

**[#2008](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2008)** (filed today).
`/parking/maintenance-parking` fails `map-layers.spec.ts`'s 240-second settle limit when the suite runs with
6 workers, and passes when run alone — twice on 20 October, on two different machines and two different
builds. Nobody knows yet whether the map is slow or the measurement is.

**This is your batch because of the hardware, not in spite of it.** On the testing machine 6 workers is
heavy contention; on 24 CPUs it is not. That difference is the experiment.

### What to run

Against **production** (`https://aggiemap.tamu.edu`), which is serving `prod-2026-10-20` / `8463ac6af`:

1. `test/smoke/aggiemap/run-local.sh production one map-layers.spec.ts --retries=0` — the whole spec, the
   default worker count. Record how long Maintenance Parking took and whether it passed.
2. The same again with `--workers=6`, to match the runs that failed.
3. `run-local.sh production one maintenance-parking --retries=0` — that map alone, as a control.

Record for each: pass or fail, the map's own settle time, the worker count, and what else was running on the
machine (nothing, ideally — see **Nothing heavy beside a run** in `DIRECTOR.md`; this batch is measuring
timing, so a second container ruins it).

### What the answer looks like

- **It passes on 24 CPUs at 6 workers** → the limit is tracking machine load, not the map. The suite is
  wrong to express "too slow" as a fixed wall-clock number that depends on who else is using the CPU. Say so,
  and suggest what it should do instead.
- **It fails here too** → the map really is too slow, and it belongs with
  [#1897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1897)'s family of maps
  that load every parking space on campus. Say roughly how slow, and whether Service Parking behaves the same.

Either answer is a result. **Don't fix anything** — this batch is a measurement, and which fix is right
depends on which answer you get.

### Also worth a line in your report

Your `STATUS.md` mentions a fix on `fork/docs/aggiemap-dev-server-env` for `CLAUDE_SETUP.md` Phase 5 hanging
without `UV_THREADPOOL_SIZE` and `NX_WORKSPACE_DATA_DIRECTORY`. **That is a real finding and it has no issue
behind it**, which in this repository means the work does not exist. Say in your report what the symptom was,
what the two settings change, and whether it is specific to your machine or would bite anyone — and the
director will file it and open the pull request. Don't open either yourself.

### House rules that will catch you out

- **Times are US Central**, read from PowerShell. `TZ=America/Chicago date` silently returns UTC on these
  machines and labels it `GMT`. `CLAUDE.md` has the conversion.
- **Never pipe `nx` output into `tail`, `head` or `grep`** — the pipeline's exit code hides the task's.
  Redirect to a file, capture the exit code, then filter.
- **A tag is a claim; the bundle hash is the proof.** When you report a run against production, say which
  bundle it served, read from the page — not which tag you expected.

---

## Batch 2 (20 October 2026, 5:50 PM Central) — the three parking fixes, checked **together**

**Do this after batch 1, not beside it.** Batch 1 is a timing measurement; a build running next to it would
make its numbers meaningless. Finish #2008, push the report, then start this.

Three branches are about to become three pull requests. Each one has been checked on its own and each is
green. `CLAUDE.md` asks for one more thing before a batch of pull requests is merged, and **nobody has done
it for these**:

> Before a batch is merged, check all of its PRs merged together: two PRs can each pass CI and still fail
> together.

That is this batch. It matters more than usual here, because these three are not independent: two of them
change **shared libraries** (`maps-esri`, `maps-feature-legend`) and one moves a helper into
`common.definitions.ts`, which other maps import. Separately green, together broken is exactly the shape
this produces.

### The branches, on the fork, already merged with the latest `development`

| Branch | Head | Closes |
| --- | --- | --- |
| `fix/1991-vendor-parking-lots` | `155f074a1` | #1991 |
| `fix/1992-accessible-parking-sports-maps` | `248ef407e` | #1992, #1993 |
| `fix/1992-legend-multi-value-class` | `e5a66b132` | #2004 |

Use those exact commits. Documentation and screenshot commits may be added on top while you work — they do
not change any code, so do not re-fetch chasing a moving head.

### What to do

1. **Merge all three onto the latest `origin/development`**, in a worktree of its own, in the order above.
   Report any conflict and what it was in, even if it is trivial to resolve — a conflict between two fixes is
   itself a finding, and the director needs to know before deciding merge order.
2. **Push that combined branch to the fork** as `check/2026-10-20-three-parking-fixes`. This is deliberate:
   your `STATUS.md` says SSH pushes depend on the maintainer's `ssh-agent` staying alive, and it is better to
   discover that on a throwaway branch than on work somebody is waiting for. **If the push fails, say so in
   your report with the exact error and carry on** — the rest of the batch does not need it.
3. **Run the full affected check** on the combined branch:
   `scripts/check-in-volume.sh check/2026-10-20-three-parking-fixes`. Not a narrow project list: two shared
   libraries change, so the point is everything they affect. Report the exit code and the per-target counts
   (`Successfully ran target lint for N projects`), not just "passed".
4. **Build it for production and run `map-layers.spec.ts` against that build**, the way home did for each
   branch alone. The four maps the three fixes touch — `/parking/vendor-parking`,
   `/events/womens-basketball`, `/parking/indoor-track-parking`, `/parking/softball-parking` — must all pass,
   **and so must the other 60-odd**. A fix to a shared legend library that fixes four maps and quietly breaks
   a fifth is the thing this batch exists to catch.
   Expect `/parking/maintenance-parking` to be the one known failure, which is batch 1's subject.

### What a good report says

- The exit code and counts for the check, and whether anything conflicted when merging the three.
- `map-layers.spec.ts` on the combined build: passed, failed, skipped, and **every failure named with its
  map**, compared against home's result for the same spec on its own combined build: **57 passed, 12 skipped,
  1 failed** (Maintenance Parking).
- Whether the push worked.
- Anything that passed alone for home and fails here, which is the whole point.

**Don't fix anything, don't open anything.** If something fails together that passed apart, that is the
result — report it and stop. The director decides what happens next.

---

## Batch 3 (20 October 2026, 6:25 PM Central) — the before and after images for the three parking fixes

Both of your reports were exactly what a report should be, and batch 2 found something neither of the other
two machines did: that `fix/1991` fails `ts-events-ngx:test` **on its own**, not only merged. Home had the
information and recorded it as a merge-order note; you read the file across all three branches and drew the
right conclusion. That commit is now on the branch.

This batch plays to the same strength: you have the dev server and the CPU, and you cannot open pull
requests. So **you take the images and write the notes; this machine opens the three pull requests.**

### Branch heads to use

| Branch | Head | Closes |
| --- | --- | --- |
| `fix/1991-vendor-parking-lots` | **`9979ff57d`** (has the snapshot commit — re-fetch) | #1991 |
| `fix/1992-accessible-parking-sports-maps` | `248ef407e` | #1992, #1993 |
| `fix/1992-legend-multi-value-class` | `e5a66b132` | #2004 |

### The images

**Take every "before" from production** (`https://aggiemap.tamu.edu`), which still carries all four faults
and will until the next production deploy. **Record the bundle hash you saw**, as you did in batch 1 — a
"before" nobody can date is worth very little. Take every "after" from a local production build of that
branch. Same viewport for both — 1440x900 — or the pair cannot be compared.

Commit each into `docs/screenshots/<slug>/` **on its own branch**:

| Branch | Slug | Shots |
| --- | --- | --- |
| `fix/1991` | `1991-vendor-parking-lots` | Before: a lot clicked, showing the **wrong** popup (the campus "Lot 050" one), and the legend. After: both layers drawn and listed, and a lot's **vendor-notes** popup |
| `fix/1992` | `1992-accessible-parking-sports-maps` | Before and after on **both** maps: Women's Basketball and Indoor Track — the wheelchair markers and the legend entry, plus Indoor Track's magenta Team Bus Parking area |
| `fix/2004` branch | `2004-legend-multi-value-class` | Softball's legend, before (the Accessible Parking Spaces entry empty) and after |

The #1991 pair is the important one and the easiest to get wrong: **the lots look right on production**,
because a hidden map-image layer has drawn them server-side since February. The fault is that they cannot be
clicked. So a plain screenshot of each map proves nothing — the before must show the wrong popup open.

### The notes and the test rows

Home drafted both in its report 9; use that text. On each branch add to `docs/releases/unreleased.md`:

- its entry under `## Summary`, above the GIS Day entries, with the two images linked as
  `../screenshots/<slug>/<file>.png`;
- its row in **What to test on dev**, at the top of that table.

**`docs/testing.md`: add no row and change no number, including the Total.** That rule landed today as
[#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002) — three pull
requests conflicted on that one line in an afternoon, the check never reads the counts, and they are
refreshed at release from a measured run. None of these three adds a spec anyway.

### Then

Push all three branches and say **"branches ready for PRs"** with each head. Name, for each one, the exact
image files you committed and the bundle you photographed production at. This machine opens the three pull
requests from there.

**Don't open anything, don't merge anything, and don't re-run the checks** — batch 2 already proved these
three together, and the only code change since is the snapshot commit you identified.

### One thing to watch

Your batch 2 build was `nx serve --configuration=production`, which is the dev server with production
settings rather than the deployed artefact — you said so, which was right. For screenshots that distinction
matters more than it did for the test run, because the sidebar and gating differ between a dev host and a
production one. Serve the **built output** (`nx build` then a static server with an SPA fallback), or use
`local-production` so `127.0.0.1` is treated as production. Say which you did.

---

## Batch 4 (20 October 2026, 8:25 PM Central) — #1975's kiosk map, and #1969's intermittent race

**After batch 3.** Two jobs, both chosen because they end in something you can produce: a branch and a
report. **You still cannot open pull requests** - no `gh` - so both come back to the director, who opens
them. `home` opens its own from now on; you do not.

### 1. #1975 — the Football Tailgating kiosk map

**[#1975](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1975).** A branch has
been sitting ready since this morning and never got its images: `feat/1975-tailgating-kiosk` (`9bfb6a3e9` on
the fork), written by `home`. It needs finishing, not writing:

1. Fetch it, merge the latest `development` (it is a day behind and several things have merged), resolve
   anything that conflicts and **say what conflicted** - a conflict between this and the day's parking work
   would be worth knowing about.
2. Run the check. Say which projects and the per-target counts, not just the exit code.
3. **Images.** It is a new map, so "before" is not a picture of the same page - there is nothing there yet.
   Take the after shots that show what it adds: the kiosk as it opens, and whatever the issue says it must
   show. If a meaningful before exists (for example the ordinary Football Tailgating map beside it), take
   that too and say what the pair is showing. Commit to `docs/screenshots/1975-tailgating-kiosk/`.
4. The `unreleased.md` entry and the *What to test on dev* row, as you did in batch 3.
5. **`docs/testing.md`: add a row only if you add a spec**, and change no number either way ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).

The kiosk maps have a spec already (`kiosk.spec.ts`, from #1392): a kiosk opened by direct link draws its
locations, has no sidebar, and holds none of the main map's layers. If this map should be covered by it and
is not, that is worth saying - and it is the kind of gap that let #1981 and #1987 reach production.

### 2. #1969 — a `?lot=` link opening the wrong map's feature, intermittently

**[#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969).** Seen twice,
on two different maps, on two different runs, always passing on retry: `?lot=100j` on Visitor Parking opened
the **main map's** Lot 100j on the first attempt, and the same symptom appeared on Motorcycle Parking. The
hypothesis in the issue is a race - before the event map's layers have loaded, the lookup falls through to
the main map's parking-lot search source and matches there first.

**This is yours because it is intermittent and you have 24 CPUs.** On the testing machine it appears once in
a while and cannot be studied. Here you can run `lot-links.spec.ts` many times over, and vary the thing the
hypothesis names - how loaded the machine is, and therefore how long the event map's layers take.

What is wanted is **an answer, not a fix**: does it reproduce, how often, and does load change the rate? If
you can make it happen reliably, say exactly how - that is what lets someone write a red-first test. If it
will not reproduce at all on 24 CPUs, that is also an answer and it points at the same cause.

**Do not fix it in this batch.** The fix depends on what you find, and a fix without a reproduction cannot
be shown to work.

### When you are done

Say **"branch ready: feat/1975-tailgating-kiosk"** with its head, and report #1969 separately. Name the
production bundle for anything you ran against production.
