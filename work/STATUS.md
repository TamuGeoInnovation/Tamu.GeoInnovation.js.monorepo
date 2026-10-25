# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. Clock times are read from PowerShell, not estimated.

Last written **4:45 PM Central, 25 October 2026**. **This machine directs AggieMap again**, taken back at
4:45 PM: it was handed to `home` on 23 October for the weekend and `home` never picked it up - no AggieMap
commit since, and work had already flagged it silent on the 23rd. GIS Day and security direct from here too.

## Running now

Nothing. **Last batch done: 24.** Watching the branch.

## AggieMap, 23 October: what this machine did before handing over

**The athletics maps on dev are the one live problem.** #2143 merged (`6a567ae8c`) and dev serves it, but
**8 of the 11 athletics maps list a layer that draws nothing**: the republished dev views carry a different
schema from production's services, so the column each definition filters on is not there. 16 columns across 9
maps. Production is healthy, which is exactly why the views must not be promoted. The maintainer decided the
GIS team adds the columns back rather than the definitions moving to the new schema.

- **[#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209)** (Bug, High) -
  the per-layer list of what each dev view needs, and the decision.
- **[#2210](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2210)** (Task, Low),
  **merged as PR 2213** at 6:48 PM: `docs/athletics-dev-views.md`, the file to send the GIS team, plus a
  pointer from `docs/map-layers.md`. Every layer of all eleven views read from both servers' REST, against the
  SQL expression each map applies. It ends in five questions for them, and nothing moves until they answer.
- **[#2214](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2214)** (Task, Medium) -
  the UES Operations release pipeline, repaired. Its artifact filter required a build tag that
  `templates/jobs/buildTags.yml` excludes, so every build was rejected and the release had no artifact.
  Release-514 then put build `20261023.40` on the dev site, confirmed by the deployed bundle loading in the
  browser. Addresses and host names are on the maintainer's handoff page, not on this public branch.

**Do not capture #2143's "after" screenshots.** Dev draws the broken state; capturing now would put eight
half-empty maps into the release notes. All 38 visual baselines live on this machine, so a full capture set
can only be taken here when the time comes.

**Compare a service's fields per layer, never per service.** A definition filters one layer, so the column has
to exist on that layer. The first pass at #2209 unioned each service's fields across its layers and reported
two columns as missing on production that were present.

## Batch 24 finished, 7:37 AM Central, 23 October

`work/reports/2026-10-23-3.md`. **Branch `ci/2118-security-scan` at `1d5359faa`** on the fork, from
`origin/development` at `35581d017`. **Now [PR 2130](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2130), and it belongs to the security chat** - do not open another. 7 files, +2,833 lines, LF checked.

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

## Security work moved out of this chat, 23 October

From about 8:20 AM Central, **all security and vulnerability work in this repository is directed by a separate
chat on this machine**, `js.monorepo - Security - CSA 305 Desktop`: dependency audits and security updates
(#2112), vulnerability scanning of packages and images (#2118), the security parts of the standing sweep
(#1146), Dependabot/CodeQL/secret-scanning alerts, committed credentials, and any issue whose main purpose is
security.

**For every machine on this branch:**

- **Do not start or continue security work**, and do not queue it in a batch. If you find a vulnerability while
  doing something else, **file the issue** with every field as `CLAUDE.md` requires and say in your report that
  it is **for the security chat**. Do not fix it.
- **`package.json` and `package-lock.json` are shared ground.** Say in your report before changing either, so
  two chats do not edit the lock at once. A version bump whose reason is a security fix is the security chat's.
- **Leave `C:\TAMU\wt-2118` and the Docker volume `trivy-cache` alone** on the work machine; the security chat
  is using them.

Handed over with it: #2118 (PR 2130), #2111, #2107, and three issues this chat had decided to file but did not
- the missing forensic trail, `geoservices-nest` having no `ValidationPipe`, and `multer` 1.4.4 being a direct
  dependency that pulls `busboy` 0.2.5 and `dicer`.

**Still directed from this chat:** AggieMap generally, #2127 (the `arc.ts.tamu.edu` paging refusals - a service
availability fault, not security), the #1745 GIS-team list, and the listeners' batches.

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

### 25 October, afternoon

- **PR 2376 (#912) merged** as `392be39db`: the Visit Maps row now renders on every Maps page through
  `MapsPageHeaderComponent`, rebuilt from closed PR 928's design. All six map-type pages verified by reading
  the live DOM - the same six tiles on a production host, seven with Code Maroon on a development host.
  **Campus Maps is correctly ungated** (#1490 put the satellite campuses on production); Code Maroon is the
  only development-only tile, which the maintainer confirmed.
- **PRs 562, 691 and 928 closed as superseded**, each crediting its author; #2369 and #912 carry what was
  worth keeping. That clears every dangling pull request.
- **The maintainer started a dev build from `392be39db`** at about 4:40 PM. Batch 148 clears it: the quick
  tier, tagging **only** if the failures are exactly #2209's known eight (his decision 1A).
- **`tamu-js-dev-nm` is repaired.** It was two dependency changes stale and failed any build with
  `Can't find stylesheet to import: 'glightbox/dist/css/glightbox.min'` plus a misleading `TS2339`. Nothing
  was running against it - no `aggiemap-dev` container existed - so it was reinstalled from `development`'s
  lock: 949 packages, `glightbox` and `maplibre-gl` present, and the build that failed on it now completes
  in 74 s. **It goes stale again every time the lock moves**, which while the security chat's queue is
  running is most days.


### 25 October, direct to this chat while `home` directs AggieMap

**Three old pull requests and the bus routes question.** Decisions 1A, 2A and 3 are the maintainer's.

- **PR 562 closed as superseded** (`jameslee-debug`, Dec 2025): `test/joonseo-validation/`, a parallel
  Playwright tree of 30 placeholders and one real spec that hard-coded production, swallowed every error
  and asserted only that one of three words was visible. `test/smoke/aggiemap/` now holds 37 specs
  reading `environments.json`. The directory never reached `development`, so nothing was removed.
- **PR 691 closed as superseded** (`sloneearly`, Mar 2026) by that author's own **#802** (`848695a72`,
  May 2026). Campus Stops already has a **richer** popup than the branch proposed
  (`MarkdownWDirectionsPopupComponent`, so it offers directions), and #802 deliberately set
  `labelsVisible: false` on Route Stop/Start Points, which the branch would have switched back on.
- **#2369 filed (Feature, High)** for the two parts of 691 that never landed and are worth having:
  `additionalContent` on the markdown popup components with `popup-content.utils.ts` behind it, and the
  bus route map link on Campus Stops. Neither exists on `development`. **691's label mechanism is not
  wanted as written** - it put ~128 lines in the shared `event.service.ts` hard-coding
  `TS_MAIN_PARKING_EVENT_ID = 'ts-main-parking'` and building a private `GraphicsLayer` for one map.
- **Bus routes on production: no new issue.** #1189 already covers it and was already Priority **High**;
  filing another would have duplicated it. The maintainer decided **option 1 - wait for the #1174 data
  fix and go live with every route drawing correctly**, recorded on #1189 with the other two options
  struck through. **Mobile is now a checklist item on #1189** rather than its own issue: the bus entry
  point is commented out in `map.component.html`, so a go-live would otherwise be desktop-only.
- **#1745 now leads with Transportation**, because its first two rows are the whole of what keeps bus
  routes off production: **#1191** (publish `TS/Bus_Routes` on a production GIS server, **Urgent** -
  until it lands, going live points production at the development server) and **#1174** (correct the bus
  stops' `Route` codes, **High**). Row count unchanged at 25; the sections were reordered, nothing
  duplicated or dropped.
- **The maintainer is sending the GIS team one message** covering the athletics views (#2209) and those
  two bus rows.


- **23 October, 6:55 PM: the maintainer is going home, and `home` directs AggieMap for the weekend.**
- **23 October, ~8:20 AM: security and vulnerability work belongs to its own chat** ("js.monorepo - Security -
  CSA 305 Desktop"). Do not start or continue it; a vulnerability found while doing something else becomes an
  issue with every field and the note that it is for the security chat, not a fix. `C:\TAMU\wt-2118` and the
  `trivy-cache` volume are theirs.
- **23 October: a full screenshot set can only be taken on this machine** until the visual tests move to
  Kubernetes; all 38 baselines are in `C:\TAMU\visual-baselines`.
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
