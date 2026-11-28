# Home machine: current tasks

## Batch a81 (aggiemap: the nightly smoke run — the only thing watching for breakage without a release; 27 November 2026, from `work (aggiemap)`) (High) — **now**

a80 is accepted, both branches are open as PRs 3905 and 3906, and **Q-a80-1 is option A**: 3906 closes #1501, and
the other 24 maps are now **#3907**, with your count table as its scope. #1727's closure stands.

Three issues, one investigation: **#2784**, **#1748**, **#2397**.

### Why this cluster matters more than its size

Nothing in the pull request checks notices when a map breaks **without a release** — the maps draw from hosted GIS
services, so a layer can stop working with no commit and no build. The nightly full-tier run is the only thing that
does, and **it has not passed since 29 September 2026**. Worse, a run killed by its own `timeout-minutes: 120` opens
no health issue, because the workflow opens one *on failure* and a cancelled job never reaches that step. So on those
nights nothing was checked and nothing said so.

### #2784 and #1748 are the same fault, filed twice

Read both before touching either. #1748 (filed 13 October) and #2784 (filed 9 November) both describe the 120-minute
cap and the silent timeout, from different evidence. **Do not fix it twice.** Decide which number carries the work and
close the other as a duplicate of it, saying so on both. My reading, which you should check rather than accept:
#1748 has the fuller run-by-run table and names the 6 October jump; #2784 names the silent-health-issue path, which is
the part with a code fix behind it. If they are genuinely the same, the older number usually carries it.

### What I most want to know, in this order

1. **Is two hours too short, or is something hanging?** These look identical from outside, and #2784 says so. The
   nightly's own artifacts carry per-test timings — `gh run list --workflow=aggiemap-smoke.yml`, then
   `gh run download <id>` for a cancelled run and a completed one. **Take the measurement before changing the cap**:
   a cap raised on a guess hides a hang for another seven weeks.
2. **Where the time goes.** 891 tests on 4 workers. If a handful of maps account for most of it — #2397 names
   indoor-track, timed-parking, maintenance-parking and service-loading each failing to draw inside 240 s on the
   runner while passing locally in 60 to 66 s — then the answer is about those maps or that poll, not the cap.
3. **The silent timeout, which is a fix regardless of the above.** The health-issue step runs on failure only. A job
   killed by `timeout-minutes` ends as `cancelled`, so it is skipped. Whatever shape you choose, the requirement is:
   **"the nightly did not finish" must be as loud as "the nightly failed"**, because it is the stronger signal.

### Scope, and what to leave alone

- **A workflow change is in scope**; a schedule change is not. Do not change how often it runs.
- **Do not open or close a health issue yourself.** Only a GitHub workflow run does that (`CLAUDE.md`), and a manual
  one would be the fault this cluster is about.
- **Do not run the full tier here to measure it.** It is the nightly's job, it needs GitHub's runners to be the
  measurement that matters, and it would hold this machine for hours. If you need a local number for comparison, run
  **one** of #2397's named maps with `one`, and say which.
- **The sixteen failures are not in scope** (#2784's point 4). If your reading of a recent run's log says which are
  known ones and which are not, put that in the report — a real regression hiding among known failures is what a run
  nobody reads produces — but file rather than fix.

### Worth knowing

- `test/smoke/aggiemap/environments.json` holds each environment's allowed failures; a poll or timeout belongs with
  the suite's own settings, not in a hand-written `docker run` (`CLAUDE.md`).
- `docs/testing.md` carries the dated counts, and **its numbers are a measurement refreshed at a release, not a tally
  kept by hand** — leave them alone, including the Total (#2002).
- If the honest answer to #2397 is "run the nightly on our own agents", say so as a recommendation with what it would
  take; that is the maintainer's decision and I will put it to him.

**Branches** to the fork, one per issue that gets a fix. `check-in-volume.sh`, then `pre-pr-check.sh`, and give me its
last line. A workflow-only change takes `--label no-visible-change`. Body text in the report with a `Title:` line.

**Report** `home/reports/2026-11-27-a81.md`. Questions `Q-a81-<n>`. **Open no pull request** — I open them.
