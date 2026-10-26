# copilot-home: current tasks

> **Next free batch number: 23.** Written only by the director, `work (security)` (the security and dependency chat on the work
> computer). You write `copilot-home/STATUS.md` and `copilot-home/reports/`, never this file. Do the batches in number order,
> one at a time.

**You joined properly**, and your **What this is** section is the useful part: it says what you can and cannot do, and the
batches below are fitted to it.

**How this repository works, in short** (CLAUDE.md is the authority; read it):

- The trunk is `development`. Branch from `origin/development`; push branches to `fork` only.
- **Node runs in Docker, not on the host.** Run Nx as `node node_modules/nx/dist/bin/nx.js` inside a `node:24.22.1` container.
  The pre-push check is `bash scripts/check-in-volume.sh <branch>` from Git Bash (it builds a Linux clone in a Docker volume).
- **Files are LF.** If you write files with a script, write LF; compare `git diff --stat` with `git diff --stat --ignore-all-space`.
- **A dependency upgrade takes the latest version that is at least 7 days old**, not simply the latest (#2292, #2333), except a
  security fix.
- **Every bug gets a test that fails first.** Anything visible gets before/after screenshots.
- Never print or write a token or password, and never use the maintainer's Azure DevOps or other credentials.

**Reports:** `copilot-home/reports/<yyyy-mm-dd>-<n>.md`, starting with what you did, the exact commit of anything you pushed
(read back with `git ls-remote fork`), what you proved and how, and then **Questions for the director (security)** with options and
a recommendation. Push `work-mailbox` with a message starting `copilot-home: batch <n> done - <summary>`.

---

> **STOP: batches 4, 5 and 6 are WITHDRAWN - do not do them** (from `work (security)`, 26 October 2026, about 12:45 AM Central). Batch 6's chart.js 4 has merged
> (PR 2332); 4 and 5 were withdrawn on 25 October. If you have started batch 6, stop, push a one-line status saying so, and end. **Batches 7 to 17 are all done.
> Batches 18 and 19 are new (26 October, 7:10 AM Central): do them now.** Thank you: 11 batches tonight, five of them now pull requests.


> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.


> **25 October 2026, 7:50 PM Central, from `work (security)`: batches 4 and 5 are withdrawn** (got 16 merged in PR 2339; `@types/bull` is in PR 2386).
> **Start batch 7 now, then batch 8.** Thank you for the silence report: it is right, and the director is changing how you are started so it cannot recur.

## Batches 20, 21 and 22 (security: #2122 - remove what nothing builds, tests or ships; three branches; 26 October 2026, about 7:30 AM Central, from `work (security)`)

**The maintainer decided (26 October): remove all three, each as its own branch and pull request.** Your batch 19 is the
evidence. Do them in order; each is a branch from the latest `origin/development`, pushed to `fork`, with a `.pr-body.md`
draft as its last commit (title `chore(<project>): ...`; the director opens the PR and files its issue).

- **Batch 20, branch `chore/remove-signage`:** delete `signage-angular` and its five libraries; remove them from
  `tsconfig.base.json` paths, the `EXCLUDED_PROJECTS` lists in `build.yml`, `lint.yml` and `test.yml`, and anywhere else
  that names them; `@angular/platform-browser-dynamic` goes too if nothing else imports it.
- **Batch 21, branch `chore/remove-gisday-competitions-apps`:** delete the apps `gisday-competitions-angular` and
  `gisday-competitions-nest` **only**. Their libraries stay: `gisday-angular` and `gisday-nest` use them. Same clean-up of paths and
  lists.
- **Batch 22, branch `chore/remove-unused-libraries`:** delete `libs/geoprocessing/v4` and `libs/maps/feature/feature-highlight`
  and their paths.

For each: `git grep` for every name afterwards (none may remain outside `docs/releases/`), then
`bash scripts/check-in-volume.sh <branch> all` must exit 0. In the report: what was deleted, the grep, the exit code and the
pushed commit (`git ls-remote fork`). Push `copilot-home: batch <n> done - ...` after each.

## Batch 19 (security: #2122 - evidence for each file knip calls unused; read only; 26 October 2026, about 7:10 AM Central, from `work (security)`)

Do this after batch 18. Knip, configured with each project's entry points in PR 2389, reports about 40 files as unused on
`origin/development`. **Before anyone deletes them, each one needs evidence.**

1. Worktree at the latest `origin/development`. Run knip as the repository configures it (PR 2389), in a `node:24.22.1`
   container, and save its list of unused files.
2. For each file, look for anything knip cannot see: a path string in a `project.json`, a jest or vite config, a lazy or
   dynamic `import()`, a template or stylesheet reference, a script under `scripts/` or `.github/`, a `docs/` page that tells
   people to run it.
3. Report one table: file, project, **verdict** (`unused`, `used by <what>`, or `unsure: <why>`), and the evidence. Group by
   project. End with which projects would lose every file (a hint the whole project may be dead) and **Questions for the
   director (security)**.

Read only: no branch, no pull request. Report `copilot-home/reports/2026-10-26-19.md`, then `copilot-home: batch 19 done - ...`.

## Batch 18 (security: a check that the restarted agent-runner works; read only; 26 October 2026, about 7:10 AM Central, from `work (security)`)

A short test, so the maintainer can see you running before he leaves for the day.

1. Push `copilot-home: started batch 18` (and `tools/heartbeat.sh copilot-home "running batch 18" 30`).
2. On the latest `origin/development`, in a `node:24.22.1` container, run `npm audit --package-lock-only --json` and
   `npm audit --package-lock-only --omit=dev --json`; record the counts by severity for each.
3. Run `npm view fast-uri time --json` and `npm view serialize-javascript time --json`; record the newest version of each and
   when it was published, in US Central (convert with PowerShell, as CLAUDE.md says).
4. Write `copilot-home/reports/2026-10-26-18.md` with the commit of `development` you used, the two tables and the two
   versions, then push `copilot-home: batch 18 done - <counts>`. Then go straight on to batch 19.

## Batch 17 (security: #2122 - the cosmetic leftovers your batch 13 found after PRs 2383 and 2386; a branch; 25 October 2026, about 10:25 PM Central, from `work (security)`)

**Start after batch 16**, in number order as before. **Expected: 30 minutes.** Your batch 13 review is good. Finding 1 (`session/expired` in UES Operations' front
end) is the AggieMap lead's decision; **do not touch it**. Do findings 2 and 3 only:
1. Branch `chore/2122-stale-references` from `origin/development`.
2. `nx.json` line 247: remove `"libs/oidc/client/**/*"` (the folder is gone). `libs/common/ngx/auth/README.md` line 65 and `libs/common/types/src/lib/auth-types.ts`
   line 3: point at `@tamu-gisc/common/types`, not `libs/oidc/client`. `tools/security-findings/README.md` line 97: `better-sqlite3` is gone (PR 2386); reword or drop
   the line, and check the rest of that README for `better-sqlite3`. Leave `.gitignore`'s `oidc-client-config.*` (a deploy machine may still hold one).
3. `bash scripts/check-in-volume.sh chore/2122-stale-references`. Commit (`chore(workspace): Drop references to libraries and packages that are gone`, `Part of #2122`,
   Co-Authored-By), push to `fork`. No PR.

## Batch 16 (security: #2388 - the two workflow script injections, and actionlint on PRs; a branch; 25 October 2026, about 8:10 PM Central, from `work (security)`)

**Start after batch 15**, and keep going in number order as before. **Expected: 60 minutes.** Your batch 8 report is good: thank you. **Two corrections:**
its finding 1 is wrong: `.github/dependabot.yml` already has a `github-actions` ecosystem (line 126; you read only the first 30 lines). And the release-age rule
is **7 days** now, not 14 (#2333). Your branch is PR 2387.
1. Branch `ci/2388-workflow-injection` from **`fork/ci/2335-least-privilege`** (it builds on your pins).
2. In `main.yml` and `build.yml`, pass `github.ref_name` and `github.head_ref` (and any other `${{ github.* }}` or `${{ inputs.* }}` used inside a `run:` script)
   through `env:`, and use `"$VAR"` in the script. Search all 14 workflows for the same pattern.
3. Add a check, in `tools-tests.yml` or a new small workflow on `pull_request` paths `.github/workflows/**`: `actionlint` from a pinned image (by digest), failing
   on any finding. It must pass on the branch (red first: run it on `fork/ci/2335-least-privilege` and record its warning).
4. `bash scripts/check-in-volume.sh ci/2388-workflow-injection`. Commit (`Closes #2388`, Co-Authored-By), push to `fork`. No PR.

## Batch 15 (security: #2341 - plan the move to PublishPipelineArtifact for release builds; read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 14**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `templates/jobs/build.yml` publishes release builds with `PublishBuildArtifacts@1` (8 to 9 minutes for `development`); `PublishPipelineArtifact@1`
is faster. Release definition 13 ("AggieMap") takes the build artifact `js-monorepo-<buildType>`. From Microsoft's documentation and this repository's
pipeline files: what changes in `build.yml`, what the maintainer must change in the classic release's artifact source, how to switch without a gap (both
for one build?), and how to check one release end to end on dev. A plan only; no edits, and no Azure DevOps calls.

## Batch 14 (security: #1896 - Geoservices' response viewer and partner page: the evidence for removing them; read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 13**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `ResponseViewerComponent` is used only inside commented-out blocks in four Geoservices API pages (address-processing,
census-intersection, geocoding, reverse-geocoding), and the partner page and form are not routed (lab report 2026-10-25-135). For each: every reference,
its history (`git log -S`), what it was for, and whether anything outside comments uses it. List exactly what a removal would delete. No edits; the decision
is the maintainer's.

## Batch 13 (security: a second review of PR 2383 (UES Operations API and openid-client deleted); read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 12**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 30 minutes.** Review PR 2383 against `origin/development`: anything still importing from the deleted `libs/oidc`, `libs/ues/common/nest` or the
removed `libs/ues/common/ngx` auth folders; `tsconfig.base.json` paths left pointing at deleted folders; workflow, `nx.json` or `azure-pipelines.yml` references
to `ues-operations-nest`; and whether `ues-operations-angular` (which stays: it is deployed) still builds without what was removed. Report findings with file
and line. No edits.

## Batch 12 (security: a second review of PR 2386 (unused dependencies removed); read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 11**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 30 minutes.** Review PR 2386 (`fork/chore/2122-remove-unused`) against `origin/development`: for each removed package, search the whole
repository (code, configs, workflows, Dockerfiles, `project.json`, Jest and Vitest configs, ESLint configs) for anything that loads it by name, including
`require`, dynamic `import()`, plugin strings and presets. The lab found one removal wrong (`@eslint/js`, needed by `@nx/eslint-plugin` without being declared);
look for any other such case. Report each package: safe, or not and why. No edits.

## Batch 11 (security: #2351 - the raster basemap view-limit test that fails everywhere; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 10**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 60 minutes.** `test/smoke/aggiemap/services.spec.ts`, *campus basemap services › the view limit matches the raster basemap cache*, fails on
production and dev alike: *the raster basemap service was not found in basemaps.definition.ts*. Find where the raster basemap is defined now (see #1700),
and make the test read it from there; if the view limit no longer depends on it, say so and propose removing the check instead. Prove it with
`bash test/smoke/aggiemap/run-local.sh production one "view limit matches"` (red before, green after) - this needs Docker and reaches the public production
site, read only. Branch `fix/2351-raster-basemap-test`. Commit (`Closes #2351`, Co-Authored-By), push to `fork`. No PR.

## Batch 10 (security: #2379 - the logo upload-limit test that times out under load; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 9**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `libs/gisday/platform/data-api`'s *OrganizationController upload limits: answers 413 for an organization logo over the shared
file-size limit* posts 5 MiB to a real local Nest server under Jest's 5-second default; under the full check's load it took 5,248 ms and failed. Branch
`fix/2379-upload-limit-timeout` from `origin/development`: give that spec (and any sibling upload-limit specs) an explicit timeout that fits a 5 MiB upload,
or make the oversized body cheaper (a stream that is cut off past the limit), so it cannot sit on the edge. Run the spec 10 times under load (for example
alongside two other projects' tests) and report the times. `bash scripts/check-in-volume.sh fix/2379-upload-limit-timeout gisday-platform-data-api`. Commit
(`Closes #2379`, Co-Authored-By as above), push to `fork`. No PR.

## Batch 9 (security: #2385 - give knip a configuration with each project's entry points; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 8**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 2 hours.** knip 6.42.0 (pinned; the newest release at least 7 days old) flags every app's `main.ts` as unused because it does not find the Nx projects'
entry points (lab report 2026-10-25-135 on this branch). Branch `chore/2385-knip-config` from `origin/development`: a root `knip.json` naming each project's
entries (apps' `main.ts`, the `project.json` targets' files, `tools/**`, `scripts/**`, Jest and Vitest configs), or knip's Nx plugin if it covers our executors.
Prove it: rerun knip; sample 20 of what it still calls unused files and say for each whether it really is. **Change no package.json or lock** (no package
removals here). `bash scripts/check-in-volume.sh chore/2385-knip-config`. Commit (`chore(workspace): Configure knip with each project's entry points`,
`Part of #2385`, `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to `fork`. No PR.

## Batch 8 (security: #2335 - what every CI token can reach; read only, a report; 25 October 2026, 9:12 AM Central, from `work (security)`)

**Start after batch 7.** **Expected: 90 minutes.** Read `.github/workflows/*.yml`, `azure-pipelines.yml`, `templates/**`, `tools/build-agent/**` and
`publish.yml`'s registry steps. For each workflow and job: its `permissions:` (or the default it gets), its triggers (flag `pull_request_target` and
`workflow_run`), the secrets it reads, and the third-party actions it uses with how each is pinned (tag or commit SHA). For Azure Pipelines: what the
pipeline's own files say about fork builds and secrets. **Do not** call any admin API, read any secret, or change a setting; what only an admin can
see, list as a question. Report a table and, for each, the least it needs. Then a branch `ci/2335-least-privilege` with only the safe file changes
(`permissions: contents: read` defaults, per-job widening, SHA pins with the tag in a comment), `bash scripts/check-in-volume.sh <branch>`, push to
`fork`. No PR. Never print or write a token.

## Batch 7 (security: #2334 - which behaviour-based malware scanner, if any; read only, a report; 25 October 2026, 9:12 AM Central, from `work (security)`)

**Start now** (after you restart). **Expected: 60 minutes.** Research and compare what scans npm dependencies for malicious behaviour (not only known
advisories), for a **public** GitHub repository: for example Socket, Aikido, Phylum, and OSV-Scanner with the OpenSSF malicious-packages data. For
each: cost for a public repository, what it checks (a pull request's lock changes, a daily scan), how it reports (a check, a comment), what it needs
(a GitHub App and its permissions, a token), how noisy it is by its own docs, and how it would fit `lint.yml` and the daily security scan we already
run (`tools/security-findings/`). Recommend one or none, with reasons. Report only: no branch, nothing installed.

**Batch 6 is withdrawn** (chart.js 4 has merged, PR 2332). Batches 4 and 5 still stand; do them after 7 and 8.

## Batch 6 (security: #1218 - a second review of the chart.js 4 branch; read only; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start after batch 5.** **Expected: 30 minutes.** Review `fork/chore/1218-chart-js-4` against `origin/development` (three-dot, as before).
It moves `chart.js` 2.9.4 → 4.5.1 (pinned `~4.5.1` because 4.6.1 was days old), drops `chartjs-plugin-colorschemes` (its palette re-implemented as
`applyChartColors` in the charts library's container), `@types/chart.js` and `moment`, and registers only the chart pieces each component uses.
Look for: charts that would lose a scale, legend, tooltip or title because it was not registered; colour rules that differ from the old plugin's
(read the plugin's source in `node_modules` on `development`); anything else still importing `moment` or `chartjs-plugin-colorschemes`; and the
lock beyond those packages. Check every published date against the 14-day rule. Report only.

## Batch 5 (security: #2311 - remove the deprecated @types/bull stub; a code job and a branch; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start after batch 4.** **Expected: 30 minutes.** `@types/bull` is a deprecated stub ("bull provides its own type definitions"); the repository
installs `bull` 4.16.5, which ships its own types. Dependabot's PR to bump it was closed in favour of removing it (#2311).
1. Branch `chore/2311-remove-types-bull` from `origin/development` in a worktree `C:\TAMU\copilot-home-bull`.
2. Remove `@types/bull` from `package.json`'s `devDependencies`. **The lock: delete its entries, do not regenerate it**: remove the
   `node_modules/@types/bull` key (and any key nested under it) from `package-lock.json` with a small script, then in Docker
   `docker run --rm -v <worktree>:/w -w /w node:24.22.1 npm install --package-lock-only --ignore-scripts`. Compare the lock with
   `origin/development` key by key: only `@types/bull` (and anything only it needed) may disappear; no other version may change. Report the list.
3. `git grep` for anything importing types from `@types/bull` or relying on it (`/// <reference types="bull"`), and fix any to `bull`'s own.
4. `scripts/check-in-volume.sh chore/2311-remove-types-bull` with Git Bash (full affected; it builds every API that uses `bull`). Commit
   (`chore(workspace): Remove the deprecated @types/bull stub`, `Closes #2311`, `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to
   `fork`. No pull request.

## Batch 4 (security: #1218 - a second review of the got 16 branch; read only; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start now.** **Expected: 30 minutes.** Your batches 1 to 3 were good: your `marked` age finding is applied (PR 2314 pins 18.1.0), your README fix is
PR 2305, and your `ngx-datatable` empty-row finding goes to the lab's next batch. Answers: batch 2's question 1 **(a), leave line 256**; batch 3's
question about the themes: **leave it**. Review `fork/chore/1218-got-16` against `origin/development` (three-dot). It moves `got` 11 → 16.0.0
(ESM-only; Node 24's `require(esm)` loads it from our CommonJS bundles), adds behaviour specs with stand-in servers for the three mail calls, and
moves the mailroom helper's upload to the platform `FormData`/`Blob`. Look for: anything that changes what the three calls send or how they handle
errors (the specs record today's behaviour, so read them against the code); the `Blob` built from `file.buffer` (a copy, not a view?); ESM loading
in the production bundles (`webpack` output); and the lock beyond `got`'s own tree. Check `got` 16.0.0's publish date against the 14-day rule.
Report only.

## Batch 3 (security: #1218 - a second review of the ngx-datatable 25 branch; read only; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start after batch 2.** **Expected: 30 minutes.** The same kind of review as batch 1, for `fork/chore/1218-ngx-datatable-25`
(`@swimlane/ngx-datatable` 20 → 25; AggieMap's building directory and GIS Day's submission review list; the two components' shared
table styles moved to `libs/sass/components/_datatable.scss`). Diff it against `origin/development`; ignore what is already on
`development`. Look especially for: inputs or outputs removed in 21 to 25 that our two templates still bind; styles that no longer reach
25's markup (it lays the table out with CSS grid); and anything in the lock beyond `@swimlane/ngx-datatable`. **Do not edit, commit
or push code.** Report findings with file, line and how sure you are.

## Batch 2 (security: can this machine run the repository's checks, and a small real fix; a branch; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start after batch 1.** **Expected: 45 minutes.**

1. **Docker:** in Git Bash, `docker version` and `docker run --rm node:24.22.1 node --version`. Report both. If Docker is not running
   or your account cannot use it, say so and stop step 3's check (do the edit, push, and say the check was not run).
2. **The fix:** `tools/build-agent/README.md`'s "Guard rails" section still says the agent runs with `--memory 24g --cpus 16`. The
   scripts and the README's own "How many agents fit" section say **12 GB and 5 CPUs** since #2252 (four agents on the lab). Make
   "Guard rails" match, and check the rest of the README for any other 24g / 16 / three-agent wording that #2252 made stale. Change
   nothing else. Branch `docs/build-agent-readme-sizes` from `origin/development`.
3. `bash scripts/check-in-volume.sh docs/build-agent-readme-sizes` from Git Bash in `C:\TAMU\copilot-home` (commit first; it checks
   only what is committed). It should exit 0 with *No tasks were run* (the README belongs to no project) and then run the smoke
   suite's typecheck. Report its exit code and last lines.
4. Commit (`docs(workspace): Give the build agent's guard rails its current size`, a short body, and the line
   `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to `fork`. **No pull request**; the director files the issue and
   opens it.

## Batch 1 (security: #1218 - a second review of the marked 18 branch; read only; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start now.** **Expected: 30 minutes.** The director prepared `fork/ready/1218-marked-18` (commit `088b31413`) and will open its pull
request when the lock queue reaches it. You are the second pair of eyes before it goes.

1. `git fetch origin development` and `git fetch fork ready/1218-marked-18`, then review `git diff origin/development...fork/ready/1218-marked-18`.
   **Ignore anything already on `development`**: the branch carries merges, so read the three-dot diff.
2. What it does: the npm package `marked` 9 → 18 (ESM-only from 12; `marked()` is typed `string | Promise<string>` in 18). The markdown
   pipe, `libs/common/ngx/pipes/src/lib/parsing/markdown-parse.pipe.ts`, calls `marked(value, { async: false })` and returns a plain
   string, so Angular's `[innerHTML]` sanitises it (#2258 made that change; keep it). One Jest config,
   `libs/gisday/platform/ngx/core/jest.config.ts`, adds `marked/` to `transformIgnorePatterns`.
3. Look for: bugs; anything that weakens the sanitising (the pipe must not return trusted HTML); callers of the pipe that could break
   on the return type; other places that import `marked`; and lock-file changes beyond `node_modules/marked` itself.
4. **Do not edit, commit or push code.** Write the report with each finding's file, line, what you think is wrong, and how sure you are
   (certain / likely / a question). "No findings" is a fine answer if that is what you find; say what you checked.
