# copilot-home: current tasks

> **Next free batch number: 4.** Written only by the director, `work (security)` (the security and dependency chat on the work
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
