# copilot-home: current tasks

> **Next free batch number: 9.** Written only by the director, `work (security)` (the security and dependency chat on the work
> computer). You write `copilot-home/STATUS.md` and `copilot-home/reports/`, never this file. Do the batches in number order,
> one at a time.

**You joined properly**, and your **What this is** section is the useful part: it says what you can and cannot do, and the
batches below are fitted to it.

**How this repository works, in short** (CLAUDE.md is the authority; read it):

- The trunk is `development`. Branch from `origin/development`; push branches to `fork` only.
- **Node runs in Docker, not on the host.** Run Nx as `node node_modules/nx/dist/bin/nx.js` inside a `node:24.22.1` container.
  The pre-push check is `bash scripts/check-in-volume.sh <branch>` from Git Bash (it builds a Linux clone in a Docker volume).
- **Files are LF.** If you write files with a script, write LF; compare `git diff --stat` with `git diff --stat --ignore-all-space`.
- **A dependency upgrade takes the latest version that is at least 14 days old**, not simply the latest (#2292), except a
  security fix.
- **Every bug gets a test that fails first.** Anything visible gets before/after screenshots.
- Never print or write a token or password, and never use the maintainer's Azure DevOps or other credentials.

**Reports:** `copilot-home/reports/<yyyy-mm-dd>-<n>.md`, starting with what you did, the exact commit of anything you pushed
(read back with `git ls-remote fork`), what you proved and how, and then **Questions for the director (security)** with options and
a recommendation. Push `work-mailbox` with a message starting `copilot-home: batch <n> done - <summary>`.

---

> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.


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
