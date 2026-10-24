# Security director: hand-off

Written by `work (security)` at 11:15 PM Central, Friday 23 October 2026, for whichever machine directs the security and
dependency work next (the home machine, this weekend). The maintainer keeps the merge button; nothing here merges itself.

## Ready to merge, morning of 24 October (all green; merge order notes in brackets)

**Lock queue, one at a time:** [PR 2253](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2253) GLightbox (then the director pushes maplibre, `marked` 18, `ngx-datatable` 25, `ngx-highlightjs` 14 in turn).

**No lock change, any order:**

| PR | What | Closes |
| --- | --- | --- |
| [2260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2260) | the markdown pipe lets Angular sanitise (security; **before `marked` 18**) | #2258 |
| [2255](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2255) | warm read-only git mirror for lab checkouts (then rebuild and reinstall the agents) | #2254 |
| [2257](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2257) | the flaky date-picker test, fixed | #2244 |
| [2266](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2266) | the select spec typechecks | #2256 |
| [2268](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2268) | the directory's Abbreviation column (visible, release notes) | #2262 |
| [2269](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2269) | ArcGIS types path in the spec tsconfigs | #2264 |
| [2270](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2270) | five type errors only spec typechecking showed | #2265 |
| [2272](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2272) | the POI popup's console TypeError | #2259 |
| [2279](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2279) | AggieMap's animations to CSS transitions (first part of #2278; then the toasts, `fork/chore/2278-notification-animations` `afa4e57cc`, stacked on 2279, closes #2281; then geoservices, lab batch 109) | #2280 |
| [2273](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2273) | geoservices' Result tab shows a failed sample (visible, release notes) | #2267 |
| [2274](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2274) | ArcGIS types path in the library tsconfigs | #2271 |

**Questions for the maintainer:** #2258's priority (set Medium); the lab's "second security observation" (report `2026-10-23-78`); #2263, whether spec tsconfigs are typechecked in CI (no rush).

## The lock queue: one pull request at a time

Every one of these changes `package-lock.json`. Merge **one**, then bring the next up to date and push it. Each is
**already prepared and fully checked** (`scripts/check-in-volume.sh`, full `affected`) **on top of the one before it**, on
the fork under a `ready/` name, so after each merge the next step is a quick re-merge and a push, not a rebuild.

| Order | Pull request / branch | State at 11:15 PM |
| --- | --- | --- |
| 1 | PR 2238 small majors | **Merged** |
| 2 | PR 2240 `uuid` dropped | **Merged** |
| 3 | [PR 2253](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2253) GLightbox (#2246) | **Opened 11:52 PM after 2240 merged; CI building.** Merge when green |
| 4 | maplibre, [#2247](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2247) (no PR yet) | Prepared on 2253: `fork/ready/2247-maplibre` (`ba338ad93`), with its release-notes file; checked: lint 104, test 100, build 14 |

| 5 | `marked` 9 → 18 (lab batch 91, `fork/chore/1218-marked-18`, `9b8e3d45a`; no issue or PR yet) | Checked on `development` (3,177 texts render the same). **Its jest config adds `marked/` to `gisday-platform-ngx-core`'s `transformIgnorePatterns`, the same line GLightbox removes `lightgallery` from**: after GLightbox merges, resolve that line to keep `marked/` without `lightgallery` |
| 6 | `@swimlane/ngx-datatable` 20 → 25 (lab batch 93, `fork/chore/1218-ngx-datatable-25`, `7aee83bdf`; no issue or PR yet) | Checked on `development`; the tables look the same (the shared styles moved to `libs/sass/components/_datatable.scss`). No release notes needed |
| 7 | `ngx-highlightjs` 6 → 14 (lab batch 95, `fork/chore/1218-ngx-highlightjs-14`, `05b99e5ef`; no issue or PR yet) | Checked on `development`. **Visible**: geoservices' code samples, plain grey text on `development` today, become highlighted with line numbers; **needs a release-notes file** (screenshots in `docs/screenshots/ngx-highlightjs-14/`). Also makes geoservices provide its own `HttpClient`, which ngx-highlightjs 6 used to supply |
| 8 | `angulartics2` 13 → 14 (lab batch 103, `fork/chore/1218-angulartics2-14`, `35b544b73`; no issue or PR yet) | Checked; the version and the lock only (14 has no API change for us); the same analytics before and after |
| 9 | `chart.js` 2 → 4.5.1 (lab batch 104, `fork/chore/1218-chart-js-4`, `52651b825`; no issue or PR yet) | Checked; drops `chartjs-plugin-colorschemes` (its palette kept), `@types/chart.js` and `moment`. `~4.5.1` on purpose: 4.6.1 was two days old; move to `^4.6.1` after 5 November. The only chart is in signage, which does not build (#2276); no release notes |
| 10 | `got` 11 → 16.0.0 (lab batch 105, `fork/chore/1218-got-16`, `de62e0b70`; no issue or PR yet) | Checked, with new behaviour specs (stand-in servers) passing on 11 and 16; the mailroom helper builds a native `FormData`. `~16.0.0` on purpose (16.1.0 was 11 days old) |
| 11 | mail calls time out after 10 s, the helper's errors handled (#2277; lab batch 107, `fork/fix/2277-mail-timeouts`, `6e36cebec`, **stacked on `got` 16**; no PR yet) | Checked, red first. Push right after `got` 16 merges (identical files; keep the stacked side). `MAILROOM_TIMEOUT_MS` overrides the 10 s (accepted on the lab's recommendation; tell the maintainer) |
**After each merge, for the next one:**

1. `git fetch origin development fork`, a worktree of the prepared `ready/` branch, `git merge origin/development`.
2. **`package-lock.json` and `package.json` will conflict, and that is expected:** the squash merge rewrote the commits the
   prepared branch already contains. Check that `development`'s lock is byte-identical to the previous branch's
   (`git show origin/development:package-lock.json | sha1sum` against the previous `ready/` branch's). If identical, keep
   the prepared side (`git checkout --ours package-lock.json package.json`), commit.
3. Push it to the pull request's own branch (`git push fork HEAD:chore/1218-drop-uuid` for 2240), or for GLightbox and
   maplibre push `HEAD:chore/1218-glightbox` / `HEAD:chore/1218-maplibre` and open the pull request from the repository's
   template (`Closes #2246` / `Closes #2247`; GLightbox is AggieMap's board, maplibre GIS Day's). Each has a visible change:
   the release-notes file and before/after screenshots are already in the branch.
4. While its CI builds, prepare the one after it the same way.

`ui-kits-ngx-forms`' date-picker test (#2244) fails now and then under load. A rerun of that one project
(`scripts/check-in-volume.sh <branch> ui-kits-ngx-forms`) has passed every time. Say so in the pull request.

## Not in the lock queue (merge any time when green)

| Order | Pull request / branch | State at 12:25 AM, 24 October |
| --- | --- | --- |
| 1 | PR 2249, one network per agent | **Merged** |
| 2 | PR 2252 Node in the image, four agents | **Merged** |
| 3 | [PR 2255](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2255) git mirror (#2254) | **Opened; CI building.** Its Azure run tests the no-mirror fallback (the agents run the old scripts). Merge when green |

**After 2252 and 89 merge, give the maintainer the commands to rebuild the image and reinstall the agents** (`lab-1` to `lab-4`,
12 GB / 5 CPUs) from report `2026-10-23-75`, using the main checkout's `tools/build-agent`, when no build is running.

## Security finding, 24 October, 1 AM: ask the maintainer

- **[#2258](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2258): the markdown pipe bypasses Angular's HTML sanitiser.**
  Text rendered through it (GIS Day pages, AggieMap POI/bonfire/dining popups) is inserted unsanitised; the dining text comes from
  another department's API. Nothing harmful is in it today. **Priority was set to Medium by the director; confirm it with the
  maintainer.** **The fix is [PR 2260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2260)** (lab batch 96): red first, then 0 visible changes on all 3,177 texts. No lock change; **merge it before `marked` 18**, which then needs `return marked(value, { async: false });` in the pipe.
- **work-lab-leila's report `2026-10-23-78` mentions "a second security observation, unrelated to marked"** that it would not write in
  the public mailbox and says it gave the maintainer directly. **Ask him what it is**, and file it (privately if needed).

## The dev build

The maintainer queued Monorepo build **5692** (`20261023.89`) on `development` at `cee61ef2f` (everything through #2252) at
11:53 PM. Next, per `docs/releases/README.md`: release to `GIS-1D Development` (the maintainer), confirm dev serves it, then
`test/smoke/aggiemap/run-local.sh development quick` and, if it is the build going to production, `release`; tag `dev-*` only if the
quick tier passes.

## Decided today (23 October), and where it is recorded

- **Lab always** runs the pipeline's heavy jobs (#2245, merged). Fork builds cannot list agent pools, so there is no automatic
  fallback; `useLab: false` in `azure-pipelines.yml` sends everything hosted. Proven on a fork PR: build 5685 on `lab-1` to
  `lab-3`, lint and builds 3 to 5 times faster than hosted.
- **Fork secrets are off** (#2216). The build services have Reader on `Linux-Build`.
- **Lab agents:** `lab-1` to `lab-3` run hidden at the maintainer's logon on the lab machine, each on its own network behind
  the egress proxy (#2224, #2220, #2229).
- **#1218 (latest everything):** the survey and the plan are on the issue. `lightgallery` → GLightbox; `mapbox-gl` →
  `maplibre-gl` on the university's campus basemap; the Mapbox token in history stays (not the maintainer's account).
- **Deferred by the maintainer:** how to stop lock pull requests building two or three times ([#2241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2241)). Don't ask
  until he raises it.

## The lab (work-lab-leila)

Queued: **batch 88** (Node in the agent image, room for a fourth agent; the maintainer installs `lab-4`) and **batch 89**
(a warm, read-only git mirror for checkouts). Then, still to decide with the maintainer: a `node_modules` cache, which needs a
trusted second pool with a branch-control check (report `2026-10-23-74`). Keep it at least two batches ahead; candidates are
the rest of #1218's planned pull requests (`marked`, `ngx-datatable`, `ngx-highlightjs`, `angulartics2`, `chart.js`, `got`;
`auth0` 7 and `jwks-rsa` need the maintainer for a real sign-in), and #2243 / #2244.

## Monday

Dependabot's weekly run is Monday 6:00 AM Central. Each of its npm pull requests joins the lock queue. One that cannot pass
needs an open `dependencies` issue whose body says `Tracks PR #<n>` (CLAUDE.md).
