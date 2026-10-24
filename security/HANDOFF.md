# Security director: hand-off

Written by `work (security)` at 11:15 PM Central, Friday 23 October 2026, for whichever machine directs the security and
dependency work next (the home machine, this weekend). The maintainer keeps the merge button; nothing here merges itself.

## The lock queue: one pull request at a time

Every one of these changes `package-lock.json`. Merge **one**, then bring the next up to date and push it. Each is
**already prepared and fully checked** (`scripts/check-in-volume.sh`, full `affected`) **on top of the one before it**, on
the fork under a `ready/` name, so after each merge the next step is a quick re-merge and a push, not a rebuild.

| Order | Pull request / branch | State at 11:15 PM |
| --- | --- | --- |
| 1 | PR 2238 small majors | **Merged** |
| 2 | [PR 2240](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2240) `uuid` dropped | **Pushed after 2238 merged (`34f7d4e9a`); CI building on the lab.** Merge when green |
| 3 | GLightbox, [#2246](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2246) (no PR yet) | Prepared: `fork/ready/2246-glightbox` (`0d8c4b33e`), with its release-notes file; checked: lint 104, test 100, build 14 |
| 4 | maplibre, [#2247](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2247) (no PR yet) | Prepared: `fork/ready/2247-maplibre` (`1a68c1312`), with its release-notes file; checked: lint 104, test 100, build 14 |

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
| 2 | [PR 2252](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2252), Node in the agent image and room for four agents (#2251) | **Pushed, CI building.** Merge when green |
| 3 | batch 89, a warm read-only git mirror (checkout 63 s to 1.4 s) | Stacked on 2252: `fork/ready/2212-git-mirror` (`7f908c179`). After 2252 merges: merge `development` in (identical files; keep the stacked side), push to `ci/2212-git-mirror`, file an issue, open its pull request |

**After 2252 and 89 merge, give the maintainer the commands to rebuild the image and reinstall the agents** (`lab-1` to `lab-4`,
12 GB / 5 CPUs) from report `2026-10-23-75`, using the main checkout's `tools/build-agent`, when no build is running.

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
