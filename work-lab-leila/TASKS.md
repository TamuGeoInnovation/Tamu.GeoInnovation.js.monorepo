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

## Batch 5 (20 October 2026, 11:35 PM Central) — the release tier on tonight's dev build

From `home`, which directs again. **Expected: about 15 minutes of tier on this machine, plus the wait for the deploy.**
Write `Next update by HH:MM Central` in your `STATUS.md` and push it before you start, as `DIRECTOR.md` says.

**Decided** (the maintainer, 11:30 PM): he is releasing the build from **`b789426316d1cd4e857849823569b26cc6c1bcf0`**
(`development`'s head) to dev now, and this machine runs its testing. This build is going to production, so it is the
**release** tier, not quick: twenty-six pull requests have merged since `prod-2026-10-20` (`8463ac6af`).

1. **The release tier on dev** (report on: #1935)
   - **Start when Azure lists a release whose build is from `b78942631` with `GIS-1D Development` succeeded, and dev
     serves a `main-*.js` other than `main-IORMDVQQ.js`** (the bundle dev serves now). If you cannot read Azure, the
     bundle change alone is the signal; say which you used. Push `work-lab-leila: started` first.
   - From a checkout at `b78942631`: `test/smoke/aggiemap/run-local.sh development release`. Nothing else heavy beside it.
   - **Expect it clean against dev**: the seven maps `map-layers.spec.ts` fails on production are all fixed in this build.
     Any failure is news: say what failed and why, per test.
   - **Tag only on a clean pass**: `scripts/tag-build.sh dev b789426316d1cd4e857849823569b26cc6c1bcf0`, then
     `git push origin <tag>`. A failure, or a flake you cannot explain, means no tag; report it.
   - No production stage, no approval of anything in Azure. Report the bundle you tested, and the release number.

## Do this now, then ask Dan to restart you (20 October 2026, 9:35 PM Central)

**Pause batch 4 at the next safe point and do this first.** You spent two and a half hours on batch 3 stopped
at approval prompts, and nothing elsewhere could tell. The fix is merged and you do not have it yet.

1. **Get it into your main checkout**, which is where this session reads its settings from:

   ```
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo fetch origin
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo checkout development
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo pull
   ```

2. **Check the file is actually there** and say what you see:

   ```
   git -C C:/TAMU/Tamu.GeoInnovation.js.monorepo show --stat HEAD -- .claude/settings.json
   head -5 C:/TAMU/Tamu.GeoInnovation.js.monorepo/.claude/settings.json
   ```

   It arrived in `2c1651c9b`, "Check in Claude permissions, so a machine is not stopped by prompts"
   ([#2017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2017)). If it is not
   there, say so plainly rather than carrying on — a restart will not help and Dan needs to know.

3. **Then tell Dan, out loud in your reply, that he should quit and reopen the app on this machine.** He is
   next door and cannot paste commands to you, so say it as a sentence he can act on without typing
   anything. A session does not re-read that file by itself, and until it is restarted you will keep being
   stopped.

4. **After the restart**, carry on with batch 4 from wherever you were - your own `STATUS.md` says where.
   Push a fresh `Next update by HH:MM Central` when you resume.

**Also still owed from the earlier note:** roughly how many prompts you hit during batch 3 and **which
commands**. The allowlist was written from what the batches appear to run, not from evidence, and you are the
only machine that knows. Anything that should be in it will be added; anything that should never have been
auto-approved comes out.

Good work on batch 3 - all three branches came back complete, and the pull requests are being opened now.

## Two things, before your next report (20 October 2026, 9:00 PM Central)

### 1. Say how many approval prompts you hit, and on what

The maintainer could not make progress on this machine earlier for approval popups, and **nothing anywhere
else could tell**: a session stopped at a prompt and a session working quietly on a long build look
identical from outside — no commits either way.

A checked-in allowlist is now on its way ([#2017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2017),
`.claude/settings.json`), covering git, Docker, this repository's scripts, read-only `gh`, `node`,
`npx tsc`, `python` and file reading — and **denying** what must always stop and ask: `git push origin`,
force pushes, `gh pr merge`, `gh workflow run`, `gh release`, `kubectl`, `az`.

**That list was written from what the batches appear to run, not from evidence.** You are the only machine
that knows what actually prompted. In your next status or report, say roughly how many prompts you hit and
**which commands** — even approximately. A pattern that is missing will be added; one that should never have
been auto-approved will be taken out. Please do not work around a prompt by rephrasing a command to slip
past the rules: say what tripped it.

### 2. Say when you will next be heard from

New rule in `DIRECTOR.md`, [Saying when you will next be heard from](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/CLAUDE.md), and it applies from your next batch:

- when you start, write **`Next update by HH:MM Central`** in your `STATUS.md` and **push it before you
  begin the work**;
- move it on when you push progress, remove it when you report;
- if you need longer, push a new one with a line saying why. **Running late is not a failure and saying so
  costs nothing** — a missed deadline with no explanation is the only thing that reads badly.

The point is that a stuck machine cannot report being stuck, so the deadline has to be set before you can
get stuck. A branch watcher was tried for this and was no good: three false alarms in two days and nothing
real caught, because from outside, stuck and busy are the same thing.

**Your batch 3 has no deadline because it predates the rule.** Add one now for whatever is left of it.

## Correct your own capability list (20 October 2026, 8:45 PM Central)

**Do this before your next report; it takes a minute and it is actively misleading the director.**

Your `STATUS.md` **Cannot** list still says:

- *"no `gh` CLI, so no pull requests, issue comments or GraphQL from here"* — **no longer true.** `gh` is
  installed and you have already used it to file
  [#2015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2015). **You open your
  own pull requests from now on**, as `home` does.
- *"SSH pushes depend on the maintainer's Git Bash `ssh-agent` staying alive"* — you disproved this in batch
  2 by pushing `check/2026-10-20-three-parking-fixes`. Keep it only if you still think it is a risk, and say
  why; drop it if not.

That section is the first thing the director reads before writing you a batch. While it says you cannot open
pull requests, you will keep being given work that ends in a report — which is the opposite of what
installing `gh` was for.

**When you do open one**, follow `CLAUDE.md` exactly: the issue first with `Closes #N`; the body built
**from `.github/pull_request_template.md`**, not freehand; before and after images committed under
`docs/screenshots/<slug>/` and linked by raw URL pinned to a full commit SHA; an entry in
`docs/releases/unreleased.md` and a row in *What to test on dev*; and every field set — assignee
`danielgoldbergtamu`, the issue's labels, project **Pending Approval**. Check the raw image URLs return 200
before posting; a branch-name URL rots and a `development` one 404s until merge.

**So batch 4 changes slightly:** finish `feat/1975-tailgating-kiosk` and **open its pull request yourself**.
#1969 stays a report — it is an investigation, and there is nothing to open until it has an answer.

### #2015 is yours later, not now

The maintainer has set it **Medium** and **queued** it: two urgent issues the team filed today are in
flight, and the runbook costs an afternoon only when a machine joins. Good issue — it named the gap and
spotted that `python` is described the same way, which is the part that makes it worth doing once properly
rather than patching the one line about `gh`.

Worth you knowing why it matters: **three of today's documentation issues came from you joining** — #2005,
#2009 and #2015. That is not three paper cuts, it is one finding: `CLAUDE_SETUP.md` had never been run by a
machine that was not already set up. You are the only machine that has run it cold, so when that work is
scheduled it will probably come to you.

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
