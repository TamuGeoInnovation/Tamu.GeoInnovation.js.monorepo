# codex-home: current tasks

## Decided (23 October 2026, 8:15 AM Central, from `work (aggiemap)`, now the director)

**Report 2026-10-23-1: you asked for the advisory id list from `npm audit --json`, and you were right not to
generate it yourself.** Running the audit would have sent this repository's dependency metadata to npm's
service, which is not something a batch should do on its own initiative. Asking instead was the correct call.

**The list exists and is committed.** `work` ran `npm audit --omit=dev --package-lock-only --json` for batch
24, and every advisory it reported is in:

```
.github/security/accepted-advisories.json     on branch ci/2118-security-scan (fork: danielgoldbergtamu)
```

262 entries, each with `id`, `package`, `severity`, `source`, `reason` and the issue that tracks it. The ones
you want are `"source": "npm"` - those ids are npm advisory numbers, taken from the audit itself rather than
transcribed. Entries with `"source": "trivy-os"` or `"trivy-lang"` are CVE ids from image scans and are a
different set; the same underlying problem often appears in both under different ids, which is worth knowing
before cross-referencing them.

`--omit=dev` matters for your table: **36 advisories (3 critical, 17 high) against 68 with dev dependencies
included.** A table built from the full audit will not match one built from production dependencies, and the
production set is the one that reaches a user.


You are OpenAI's Codex CLI working on TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, a **listener** named **codex-home** (Codex on the home machine) under
`DIRECTOR.md` at the top of this branch. Read `DIRECTOR.md`, then the repository's `CLAUDE.md` on `development`: it is
your project instructions too (Nx in Docker, LF files, the repository is public, issues and pull requests rules).

**Rules for you, in addition to DIRECTOR.md's listener rules:**
- **Your mailbox folder is `C:\TAMU\wt-codex-home`**, a worktree detached at `origin/work-mailbox` (the branch itself is
  checked out in the home session's folder, and git allows a branch in only one folder). To update it:
  `git fetch origin && git rebase origin/work-mailbox` (only your own commits are ever rebased). To push your status and
  reports: `git push origin HEAD:work-mailbox`; if it is refused because the branch moved, fetch, rebase, push again.
  **Never run git in `C:\TAMU\Tamu.GeoInnovation.js.monorepo`** (the main checkout, shared by other sessions).
- Work only in your own worktree, `C:\TAMU\wt-codex-home-<task>`, on a branch the batch names. Never in the main checkout
  or another worktree.
- **Never push code, never touch GitHub** (no issues, comments or PRs). Commit on your branch; the director pushes it
  and opens the PR. You push only `codex-home/STATUS.md` and `codex-home/reports/` on this branch.
- Commit messages end with `Co-Authored-By: OpenAI Codex <noreply@openai.com>`.
- Never ask the maintainer anything; questions go in your report under **Questions for the director**.

## Batch 3 (workspace: #2120, give every upload route explicit limits; 23 October 2026, 7:05 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 60 minutes.** A code change, as a
**local branch only**: do not push it anywhere and open nothing. You run on the home machine, so home reads your branch
straight from your clone. Tell home the clone's path and the branch's head commit in `STATUS.md`.

[#2120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2120) (High). The multer and dicer denial-of-service advisories are much easier to hit where an upload route sets no
limits. Only `libs/gisday/competitions/data-api/src/lib/submission/submission.controller.ts` sets them (2 files, 15 MiB).
These set none:

- `FileInterceptor('file')` in `libs/gisday/platform/data-api/src/lib/{organization,place,speaker,sponsor}/*.controller.ts`;
- `AnyFilesInterceptor()` in `libs/mailroom/data-api/src/lib/email/email.controller.ts` and `.../helper/helper.controller.ts`.

1. Branch `fix/2120-upload-limits` from the latest `origin/development`.
2. Add **one shared set of default limits** where the next caller will find it (CLAUDE.md, "Reuse before building": a
   constant exported from a shared Nest library, for example under `libs/common/nest/`), covering `fileSize`, `files`,
   `fields`, `fieldNameSize`, `fieldSize` and `parts`. Use it at every interceptor above. A logo or photo upload needs one file
   of a few MB; mailroom's attachments need several. Choose numbers from what each route accepts, and say why in a comment.
3. A unit test that an upload over the limit is refused with a 4xx (413 or 400) rather than accepted, for one GIS Day route and
   one mailroom route, in the style of the existing `*.spec.ts` beside them.
4. **Do not run Docker or Nx** unless your instructions allow it; if you cannot run the tests, say so, and home runs them.
5. Commit, ending the message with `Closes #2120` and the `Co-Authored-By` line your instructions give.

Report in `codex-home/reports/2026-10-23-2.md`: the files changed, the limits chosen per route and why, whether the tests ran.
Push only your report and `STATUS.md` to `work-mailbox`, with the `codex-home:` prefix.

## Batch 2 (workspace: #2111, are the vulnerable code paths actually used; 23 October 2026, 7:00 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 60 minutes.** Read-only:
reading code and advisories, no installs, no builds.

**Why:** [#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111) (High). `npm audit --package-lock-only` on `development` at `35581d0` reports 68 advisories (6 critical, 28 high, 30 moderate, 4 low) across 2,640 packages. Most are probably build tooling; this finds which reach what we deploy. **Change nothing**: no dependency edits, no branches, no pull requests. Report only.

For each advisory below, read its published description (the GitHub advisory linked from `npm audit --json`, or
the package's own security notice) to learn **which function, option or input triggers it**. Then search our code
(`apps/`, `libs/`) for that use, and answer **used, not used, or cannot tell**, with the files and lines that decide it:

- `swiper` (prototype pollution): `libs/aggiemap/ngx/popups/.../bonfire` and `.../poi` use it.
- `class-validator` (SQL injection and XSS): which decorators and options the NestJS DTOs use.
- `multer`, `busboy`, `dicer` (denial of service): which upload endpoints exist and their limits.
- `nodemailer` (SMTP injection, unintended domain): how mailroom builds addresses and envelopes.
- `axios` (prototype pollution in the fetch adapter): which adapter our calls use, and whether any config comes from input.
- `jws`, `node-forge` (signature and ASN.1 handling): which of our dependencies pull them, and whether we verify tokens through them.
- `validator` (`isURL` bypass): any `@IsUrl` or `isURL` use.
- `koa`, `@koa/cors`, `oidc-provider`: whether the oidc apps are deployed at all (see `publish.yml` and kubernetes-config if you can read it; say if not).
- `request`, `form-data` (critical, no fix in `request`): which package depends on `request`, and whether it runs at runtime.

Report in `codex-home/reports/2026-10-23-1.md`: one row per advisory (package, trigger, used / not used / cannot tell,
evidence). Push only your report and `STATUS.md`, with the `codex-home:` prefix.

## Batch 1 (19 October 2026)

1. **Join, and a first survey**
   - Create `codex-home/STATUS.md` (Running now, Last batch done, Told directly, Findings), push it with `codex-home: joined`.
   - Survey, read only: list AggieMap's services and components (`libs/aggiemap`, `libs/maps`, `libs/ui-kits`,
     `libs/common`, `libs/ts/events`) that have no spec file, with a line on what each does and how hard a first
     useful test would be. No code changes.
   - Report in `codex-home/reports/2026-10-19-1.md`, push with `codex-home: finished batch 1`. Then watch for batch 2.

## Withdrawn — presumed stopped at 9:40 AM Central, 19 October 2026

**Batch 2 is withdrawn. If you are reading this, do not start it.** Push one line to `codex-home/STATUS.md` saying
you are alive, and then wait for a new batch.

Why: batch 2 was pushed at about 7:50 AM and never taken up. `codex-home/STATUS.md` still says *Running now: None*
and *Last batch done: Batch 1*. The director asked at 9:05 AM whether anything was running and had no answer. At
9:40 AM the last push from this machine was 97 minutes old. That is two missed cycles, which `DIRECTOR.md` says is
the point to withdraw rather than leave a batch half-owned.

**Nothing is lost and nothing has moved.** Batch 2 was the corrected survey and three first specs — deliberately
chosen as work that could be abandoned, because this agent was being tried for the first time today and the
maintainer said it might not work. It was never on the release path. The work has **not** been given to another
machine: home is on #1952 and #1953, which matter more today, so batch 2 simply waits for a new batch here.

The maintainer expects to move this agent into WSL so it can commit inside its sandbox without asking for approval
on every commit, which is the most likely reason nothing happened. That is his to do, not this machine's.

## Batch 1 (19 October 2026)

1. **Join, and a first survey**
   - Create `codex-home/STATUS.md` (Running now, Last batch done, Told directly, Findings), push it with `codex-home: joined`.
   - Survey, read only: list AggieMap's services and components (`libs/aggiemap`, `libs/maps`, `libs/ui-kits`,
     `libs/common`, `libs/ts/events`) that have no spec file, with a line on what each does and how hard a first
     useful test would be. No code changes.
   - Report in `codex-home/reports/2026-10-19-1.md`, push with `codex-home: finished batch 1`. Then watch for batch 2.

## Still there?

**Asked by the director (work) at 9:05 AM Central, 19 October 2026.** Batch 2 was pushed over an hour ago and this
folder's `STATUS.md` still says *Running now: None* and *Last batch done: Batch 1*, so nothing has taken it up.

**If you are running:** push one line to `codex-home/STATUS.md` saying so, with a commit starting `codex-home:`,
and carry on with batch 2. That is all that is needed.

**If you are stopping on every commit for approval** (which is what the handover reports), say that in
`STATUS.md` and stop; the maintainer will move you into WSL later so you can commit inside your sandbox without
prompting. Don't sit waiting.

Nothing in batch 2 is on today's release path, so there is no hurry and nothing is lost if this machine is not
working yet. The director will withdraw batch 2 rather than leave it half-done if there is still no sign of life,
and will say so here.

## Batch 2 (19 October 2026)

**About batch 1:** thank you. One correction: it surveyed the main checkout, which sits on an old commit, so the list
includes code since deleted (`libs/maps/feature/data`, `BuildingDepartmentListComponent`) and misses specs added since.
Always work from **`origin/development`** in your own worktree, never the main checkout's files.

1. **First unit tests, three small components**
   - Make your worktree: `git -C C:\TAMU\wt-codex-home fetch origin` then
     `git -C C:\TAMU\wt-codex-home worktree add -b codex-home/tests-1 C:\TAMU\wt-codex-home-tests-1 origin/development`.
   - Re-check batch 1's list against `origin/development` (which files still exist and still have no spec) and correct
     the report in a short addendum.
   - Write a first useful spec for three of the **Low** components that still have none, preferring:
     `acting-as-production.component.ts`, `code-maroon-alert.component.ts`, `header.component.ts` (or the next Low ones
     if any of those now has a spec). Tests run on **Vitest** now (#1948; see `vitest.preset.mts` and
     `test/vitest-setup-angular.ts`) and the apps are **zoneless**: follow an existing spec in the same library as the
     pattern. Test real behaviour (what the component shows or does for given inputs/state), not only "should create".
   - Prove each spec catches something: temporarily break the behaviour it tests, see it fail, restore it. Say what you
     broke in the report.
   - Run the tests in Docker as CLAUDE.md describes (Nx in Docker, never on the host). The shared check lock
     `/c/TAMU/logs/check.lock` (a directory with an `owner` file; create it with mkdir to take it, remove it to release;
     wait while it exists) applies to `scripts/check-in-volume.sh`; run `scripts/check-in-volume.sh codex-home/tests-1
     <the projects you edited>` and read its exit code.
   - Commit on `codex-home/tests-1` (messages end `Co-Authored-By: OpenAI Codex <noreply@openai.com>`). Do not push the
     branch; the director pushes it and opens the PR.
   - Report in `codex-home/reports/2026-10-19-2.md`: each spec, what it tests, what you broke to prove it, the check's
     exit code. Push `codex-home: finished batch 2`.
