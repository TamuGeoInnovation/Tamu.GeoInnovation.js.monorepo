# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. Clock times are read from PowerShell, not estimated.

Last written **8:08 AM Central, 23 October 2026**. **This machine directs AggieMap and GIS Day**, taken at
8:05 AM. It is no longer a listener; it writes every other machine's `TASKS.md` and is the only session that
asks the maintainer anything.
## Running now

Nothing. **Last batch done: 24.** Watching the branch.

## Batch 24 finished, 7:37 AM Central, 23 October

`work/reports/2026-10-23-3.md`. **Branch `ci/2118-security-scan` at `1d5359faa`** on the fork, from
`origin/development` at `35581d017`. No pull request - home opens it. 7 files, +2,833 lines, LF checked.

Daily scan at 06:42 College Station plus `workflow_dispatch`; the publish gate blocks a **critical** not
in `.github/security/accepted-advisories.json`, before the push rather than after.

**Proven, not asserted:** the first run is quiet - 576 findings, 576 accepted, 0 new, exit 0, run through
the real checker over today's real scan output. Removing one entry makes it exit 1 naming that finding.
The comparison's test was proven red by mutation: matching on the advisory id alone turns it red with
"the same CVE on another package was treated as accepted".

`actionlint` 1.7.7: `security-scan.yml` clean; `publish.yml` has 4 shellcheck infos that are
**pre-existing** (my diff is purely additive), left alone.

**Neither workflow has run, and cannot be**: a schedule cannot fire from a branch and the gate only runs
on a publish. The comparison is proven; the YAML around it is not. **The first real publish is the first
test of the gate** - worth knowing before it merges. Three questions in the report.

## Batch 23 finished, 7:35 AM Central, 23 October

`work/reports/2026-10-23-2.md`. Trivy 0.76.1, scanning only; nothing changed.

**The Angular front ends carry 4 critical and 27 high OS findings each, and rebuilding will not fix them.**
Both were built this week and both are **Alpine 3.16.3**, because `nginx-base:latest` is Alpine 3.16.3 and
**was built on 11 November 2024**. Scanned on its own, the base has exactly the same 4 and 27. The base is
the finding.

**`geoservices-nest` in production runs `:latest` from 15 March 2026** - Alpine 3.21.2, 2 critical and 23
high, all in libcrypto3/libssl3/musl/zlib. **The same service built today as `sha-35581d0` is Alpine 3.24.3
with zero.** A deployment, not a rebuild, removes all 25. The maintainer runs rollouts; this machine does not.

Every other image is clean at OS level. Two of the batch's table entries were not what production runs, so
eight images were scanned rather than six; both sets are in the report.

Three questions for the director, the third being that this is the **third `:latest` problem in two days**.
A summary comment is on #2111.

## Batch 22 finished, 6:35 AM Central, 23 October

`work/reports/2026-10-23-1.md`. Read-only `kubectl` only; nothing changed.

**No compromise indicators - and no evidence either way.** Every pod has `restartCount: 0`, so no exit 139 or
134 anywhere, and the `geoservices-nest` pods have run unrestarted since 27 August. That part is a real
negative. The log part is not: **the APIs log startup only** (geoservices-nest has written 11 lines in 57
days, spanning 43 ms), **ingress retention is about 22 hours** so nothing covers 14-21 October, the ingress
format records **no request headers** so `Content-Encoding: br` is invisible, and its client field holds one
value for all 3,049 requests, so nothing can be attributed to an address.

**Two of #2107's five APIs are not on this cluster at all** - `mailroom-nest` and `mailroom-helper-nest`.
`geoservices-nest` is deployed as `gsvcs-nest` in `gsvcs`, on `:latest`, unrestarted since 27 August.

Three questions for the director are in the report. A short, address-free summary is on #2107.

## Handed over to `home`, 23 October

What was in flight when direction moved, so nothing is lost:

- **[PR 2106](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2106)** is open and
  unmerged: #2101's service-completeness check, from `work-lab-leila`'s batch 10 branch with `development`
  merged in. Checked here: `tsc` exit 0, and `services.spec.ts` on production 161 passed, 1 flaky.
- **`work-lab-leila` reported batch 11 at 4:13 PM yesterday** (`reports/2026-10-22-3.md`), the re-measure of the
  paging refusals after the server reboots. **Nobody has read it.** It decides whether an issue is filed against
  the GIS team for intermittent paging refusals on `gis.tamu.edu` and `arc.ts.tamu.edu`, which the maintainer had
  already agreed to file as **High** and to add to #1745 - that agreement was given *before* he said the reboots
  might explain it, so it should not be acted on without reading the re-measure first.
- **PR 2106's body says the rate "is being measured again"**; if batch 11 settles it, that paragraph wants
  updating before the PR merges.

## Merged today

`8e505e2fd` #1981, `9ee3b97e8` #1987 and #1988, `aff56e810` #1986's `map-layers.spec.ts`, `cbacc6aa7` #2002's
`testing.md` rule, `418553c8c` #2009's dev-server settings. Plus PRs 1983, 1984, 1985, 1994 and 1999 merged by
the maintainer.

**22 October afternoon:** `fb57f5567` #2089 (the Aerial Imagery date slider on production), `7342c64e3` #2098
(a forced `prod-*` tag now takes a reason and says `(FORCED)`; the 21 October notes corrected to name
`36b962a04`), `c2248563a` #2100 (`featureCountError`, so a failed count stops reading as "not applicable").

## Waiting on the maintainer

Nothing. Every field is set on every issue and pull request opened today.

## In flight

- **Three parking fixes**, branches on the fork with `development` merged and the combined check passed:
  `fix/1991-vendor-parking-lots` (`9979ff57d`, #1991), `fix/1992-accessible-parking-sports-maps` (`248ef407e`,
  #1992 and #1993), `fix/1992-legend-multi-value-class` (`e5a66b132`, #2004). `work-lab-leila` is taking the
  images and writing the notes; this machine opens the pull requests.
  **They will conflict with each other** in `unreleased.md` — each adds an entry and a *What to test* row at the
  same two insertion points. The maintainer merges one at a time and this machine fixes up the next. Agreed, not
  a surprise.
- **`home` batch 12**: #2008, tagging Maintenance and Service Parking `@heavy`.
- **Transportation Services note**: drafted and given to the maintainer, covering both unpublished-`LotType`
  services and the three stale portal renderers. Not sent; his to send.

## The production tag is deliberately not set

**Production carries `36b962a04`, which has no `dev-*` tag, so `scripts/tag-build.sh prod` refuses it —
correctly.** `dev-2026-10-21` is on `61161ce1b`, the commit before the three GIS Day changes, and that is
what the release tier cleared. The delta was checked by reading it, not by running it: three GIS Day pull
requests whose only shared-code change was an added barrel export and a CSS variable with an unchanged
default, neither reachable from AggieMap, all passing Build / Affected and both Azure production builds.

So the honest position is: **we shipped `36b962a04`; we tier-tested `61161ce1b`.** The maintainer chose to
resolve it by evidence rather than by paperwork — run the production tier against what is actually serving
users, and tag `prod-2026-10-22` only if it passes. No retrospective `dev-*` tag, and no forcing the guard.

**Done:** #1778 closed with its five-item mapping, all five live as of Release-490.

**Still to do, in order:** the production tier (batch 9, `work-lab-leila`) → `prod-2026-10-22` on a clean
pass → amend the 21 October notes to record that production carries `36b962a04`, not the `61161ce1b` they
name.


## Findings

- **The lab machine is five to ten times faster than this one for test work.** Batches 1 and 2 took ten minutes
  each, against hours here: 24 CPUs and 64 GB against this machine's contention. `map-layers.spec.ts` ran in
  3.8 minutes there. Worth deciding deliberately whether tiers, captures and combined checks move there.
- **`fix/1991` was broken on its own**, not only merged — `declared-layers.generated.json` was missing
  `vendor-parking-vendor-plus-only-lots` since #1986 merged. `home` had the information and recorded it as a
  merge-order note; `work-lab-leila` read the file across all three branches and drew the right conclusion. Fixed
  on the branch (`9979ff57d`).
- **The 240-second settle limit measures spare CPU, not map speed** (#2008). Maintenance Parking: 41.5 s on 24
  CPUs, 134 s on a loaded machine. `home` is tagging it and Service Parking `@heavy`.
- **`prod-2026-10-20` baselines are complete**: 424 desktop, 424 phone, in `C:/TAMU/visual-baselines`.

## Told directly

- 7:40 AM: this machine directs; home is the worker.
- 10:25 PM and 11:05 PM: hand the director role to home.
- **11:35 PM: the maintainer is running a dev build from `b78942631` and wants a worker to start the
  testing when he gets home.** He left before it finished, so **nobody has tagged it and nobody has been
  given the batch.** What that needs, for whoever picks it up:
  - **The `release` tier, not `quick`.** Twenty-six pull requests have merged since production
    (`prod-2026-10-20`, `8463ac6af`), ten of them user-visible AggieMap fixes. `quick` covers the core
    plus what changed since the last `dev-*` tag and is for clearing a dev build; this build is going to
    production, which is what `release` is for.
  - **`work-lab-leila` should run it.** It is five to ten times faster at test work than this machine —
    ten minutes a batch against hours, `map-layers.spec.ts` in 3.8 minutes against 10–11. A release tier
    here is about thirty-seven minutes.
  - **Tag only if it passes**: `scripts/tag-build.sh dev <full sha>`, then push the tag to `origin`.
  - **The release notes are a real piece of work this time.** `unreleased.md` holds **56 entries**, and
    the collation script landed tonight (#2037): the release pull request runs
    `node scripts/collate-release-notes.mjs --check` then `--write`, and deletes the entry files. The
    directory is empty so far, so this release collates nothing and is the first test of the path.
  - **`map-layers.spec.ts` will fail on production** until this build is deployed — seven maps, all known
    (#1991 is fixed on dev but not production, and #1992/#1993/#2004 are now merged). Against **dev** it
    should be clean.

## Findings, 22 October

- **#2080 is withdrawn, not fixed by anyone.** It was filed while `FCOR/ADA_120717` was failing about half its
  queries - the fault behind every failure in lab batch 9. It recovered the same afternoon: 20 of 20 queries
  succeed, paging past 1,000 returns the remaining 524, and the production map holds all 1,524 features. Its
  row is off #1745 with that said. **The suite did catch the outage**, through `queryError`; an earlier claim
  here and in #2080 that nothing noticed was wrong and is corrected on the issue.
- **#1860 Ring Day is fixed and closed.** `Hosted/Ring_Day_view` republished: `start_date` 5 and 6 November,
  `end_date` 6 November.
- **#2101: comparing a layer view's feature count with its service's does not work.** Measured on production:
  healthy layers read 97%, 99%, 37% and 10%. Written up in lab batch 10 so nobody re-derives it.
- **The dev server on this machine serves the shell but never boots the app** - empty body, no console errors,
  no failed requests, with `UV_THREADPOOL_SIZE` and `NX_WORKSPACE_DATA_DIRECTORY` set as CLAUDE.md requires.
  Not chased, not filed. It blocks local smoke runs here.
