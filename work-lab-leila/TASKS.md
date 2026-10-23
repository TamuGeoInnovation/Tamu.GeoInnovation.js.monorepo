# work-lab-leila: current tasks

> **Next free batch number: 50.** Three directors write this file (`work (aggiemap)`, `work (gisday)`,
> `work (security)`) and the numbers are one sequence, this machine's. **Read this line and bump it when you
> queue a batch.** On 23 October two directors both used 19, and the file carried two "Batch 19" headings at
> once. The lab coped - it ran both and skipped nothing - but "started batch 19" then meant two different
> things, and no reader of this file could tell which.


Written only by the director (see `DIRECTOR.md`). You write `work-lab-leila/STATUS.md` and
`work-lab-leila/reports/`, never this file.

**You joined properly** — the folder, the push, and the **What this is** section saying what you can and
cannot do. That last part is the useful one: it changed what you are being asked to do. You have 64 GB and
24 CPUs, the most of any machine here, and no `gh` CLI. So you get work that wants the machine to itself and
ends in a report, never in a pull request. The director does the GitHub half.

**You are a listener.** Do the batch, report, and stop. Don't offer or start other work. Questions go in your
report under **Questions for the director**, with options and a recommendation — never to the maintainer.

---

## Batch 49 (security: #1218 - typeorm 1 with mssql 12; a code job and a branch; 23 October 2026, 2:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 48.** **Expected: about 2 hours.** Your batch 43 survey sized it: 69 type errors, 65 of them the `relations`
change, in 21 files, and `mssql` 11 → 12 as typeorm 1's peer.

1. `git worktree add C:/TAMU/wt-typeorm1 -b chore/1218-typeorm-1 fork/chore/1218-eslint-10` (on PR 2180's branch, so the lock changes
   stay in one line).
2. `package.json`: `typeorm` → `^1.1.2`, `mssql` → `^12.7.11`, `ts-node` → `10.9.2` (exact, as it is now), and the `mssql` entry in
   `apps/gisday-nest/package.json` and `apps/mailroom-nest/package.json` **if PR 2175 has merged into `development` by then** (if not,
   say so; they'd be updated when 2175 and this meet). `npm install --package-lock-only --ignore-scripts`; batch 41's method if ERESOLVE.
   **Report the lock diff**: expect typeorm's and mssql's trees only.
3. **The code**, as typeorm 1's release notes say, nothing more:
   - every `relations: ['a', 'b.c']` → the object form (`relations: { a: true, b: { c: true } }`): 65 sites in 21 files (`git grep`
     first and report the count you find);
   - `getRepository` from `'typeorm'` in `libs/gisday/competitions/data-api/src/lib/season/season.service.ts` → the injected repository or
     `DataSource.getRepository`, following how the same library's other services already do it;
   - the three `unknown`-index errors in that same file: type them properly, not with `any`.
   Then `npx tsc --noEmit -p` each affected app's `tsconfig.app.json`: 0 new errors (`gisday-competitions-nest`'s existing
   `Cannot find module './ormconfig'` is not this change's).
4. **Against a real database** (throwaway SQL Server, as in batch 12): `gisday-nest` starts, `GET /api/seasons/active` 200, an
   unauthenticated write 401, and **two reads that use relations** return the same JSON as `development`'s image against the same
   database (pick two GET routes whose services you changed, e.g. a season with its days, an organization with its people; diff the
   responses). `mailroom-nest` starts against its own throwaway database and `GET` on its email list answers. Report each.
5. `scripts/check-in-volume.sh chore/1218-typeorm-1` (full `affected`, clean `npm ci`). Commit (`chore(workspace): Upgrade typeorm to 1
   and mssql to 12`, a body listing what changed and why, `Part of #1218`, the Co-Authored-By line). Push if steps 3 to 5 passed.

## Batch 46 (security: ESLint 10 branch - the other four `"force": true` lint targets removed; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 20 minutes.** Your batch 45 questions: 1 **(a)**, remove them in this branch; 2 keep `eslint`
**exact**.

1. In `C:/TAMU/wt-eslint10` (`chore/1218-eslint-10`, `d8883d63c`): remove the `"force": true` option (and an `"options"` block left
   empty by it) from the lint target of `gisday-nest` (`apps/gisday-nest/project.json:132`), `gisday-platform-ngx-common`,
   `gisday-platform-ngx-core` and `gisday-platform-ngx-data-access`. Then `git grep -n '"force": true' -- '*project.json'` must print
   nothing; report it.
2. Proof through Nx, each project's own config: `nx run-many -t lint --projects=gisday-nest,gisday-platform-ngx-common,gisday-platform-ngx-core,gisday-platform-ngx-data-access --skip-nx-cache`
   (exit code, errors per project). If any has errors, fix each if it is one line, as batch 45 did, and say what; else stop and report.
3. A second commit (`chore(workspace): Let lint fail on the four GIS Day projects that forced it to pass`, a body naming them and
   #208 as where the flag came from, `Part of #1218`, the Co-Authored-By line). `scripts/check-in-volume.sh chore/1218-eslint-10`. Push.

## Batch 47 (security: #2168 on Nx 23 - lint targets to inferred tasks; a code job and a branch; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 46.** **Expected: about 60 minutes.** Your batch 44 question 1: **(c)**, convert on Nx 23 first, so each
conversion is its own separately green branch (the maintainer's "each with its own full check"), and the Nx 24 bump after is small.
Question 2: **yes**, check the lint inputs in this branch.

1. `git worktree add C:/TAMU/wt-2168-lint23 -b chore/2168-lint-inferred origin/development` (`development`, still Nx 23.3.0).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, then `node node_modules/nx/dist/bin/nx.js g @nx/eslint:convert-to-inferred
   --no-interactive`. Report what it changed (counts: `project.json` files, `nx.json`).
3. **Same lint, before and after:** for three projects (an Angular library, `gisday-nest`, a plain TS library), show the `lint` target
   from `nx show project <p> --json` on `development` and on this branch: command, options, and **`inputs`** (your batch 44 question 2:
   whatever the inferred target hashes must include each project's `eslint.config.mjs` and the root one, or a config change would not
   re-lint). If an input is missing, add it in `nx.json`'s plugin options or `targetDefaults` and show the result.
   **`force`**: after batch 46's branch merges there will be none; on `development` there are five. Say whether the inferred target keeps
   `force` (it should **not** - a lint that cannot fail checks nothing).
4. The CI lint exclusions (`lint.yml`, read by `scripts/check-in-volume.sh`) must still mean the same projects: show that the script's
   list is unchanged in meaning.
5. Proof: `scripts/check-in-volume.sh chore/2168-lint-inferred` (full `affected`): lint must run for **every** project it ran for on
   `development` (104) and pass. Report the count.
6. Commit (`chore(workspace): Move lint to Nx's inferred targets, ahead of Nx 24`, a body, `Part of #2168`, the Co-Authored-By line).
   Push if step 5 passed.

## Batch 48 (security: #2168 on Nx 23 - Jest targets to inferred tasks; a code job and a branch; 23 October 2026, 2:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 47.** **Expected: about 60 minutes.** As batch 47, for Jest.

1. `git worktree add C:/TAMU/wt-2168-jest23 -b chore/2168-jest-inferred origin/development` (independent of batch 47's branch).
2. `npm ci`, then `nx g @nx/jest:convert-to-inferred --no-interactive`. Report what changed.
3. **Same tests, before and after:** for three Jest projects (`geoservices-data-access`, an Angular library, a Nest library), the `test`
   target's command, options and `inputs` on `development` and on this branch, **and the number of tests run** by each (it must be the
   same). `test.yml` runs with `--coverage=false`; the inferred target must accept that flag. The CI test exclusions (`test.yml`) must
   still mean the same projects.
4. Proof: `scripts/check-in-volume.sh chore/2168-jest-inferred` (full `affected`): test must run for every project it ran for on
   `development` (100) and pass. Report the count.
5. Commit (`chore(workspace): Move Jest to Nx's inferred targets, ahead of Nx 24`, a body, `Part of #2168`, the Co-Authored-By line).
   Push if step 4 passed.

## Batch 44 (security: batch 42 again, with batch 41's lock method for the Nx set - the Nx 24 premise test; 23 October 2026, 2:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 42 question 1: **(a)**. A test: **commit and push nothing.**

Batch 42 as written, with one change at step 2: after `nx migrate 24.0.0`, delete from `package-lock.json` the `node_modules/nx` key and
every key whose path contains `node_modules/@nx/` (top level and nested, the `@nx/nx-<platform>` binaries included), with the same kind
of script as batch 41. Then `npm install`. If it still fails, report it in full and stop.
Then steps 3 to 6 of batch 42 exactly: the five targets unconverted, then **only the lint migrations** and the five again, and the
one-line answers in step 5. **Also report, for the record:** the lock diff after `npm install` against batch 41's branch (keys added,
removed, versions changed), so the director knows the size of the Nx 24 lock change before any branch is made.

## Batch 45 (security: #1218 - ESLint 10 and its five fixes; a code job and a branch; 23 October 2026, 2:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 44** (or before it, if 44 is waiting on anything). **Expected: about 45 minutes.** Your batch 43 survey found
ESLint 10 installs cleanly and needs five one-line fixes.

1. `git worktree add C:/TAMU/wt-eslint10 -b chore/1218-eslint-10 fork/chore/2168-angular-eslint-22-6` (on batch 41's branch, so the two
   lock changes stay in one line).
2. `package.json`: `eslint` to `^10.13.0` (keep its existing style) and `@eslint/js` to `^10.0.1`; nothing else unless the install requires
   it (say what). In Docker (`node:24.22.1`, own volume): `npm install --package-lock-only --ignore-scripts`. If ERESOLVE, use batch 41's
   method for the `eslint` and `@eslint/*` keys only. **Report the lock diff** against batch 41's branch (keys added, removed, versions
   changed); expect ESLint's own packages and their dependencies only.
3. Fix the five errors **as the rule intends**, not by disabling it: `preserve-caught-error` (4): `throw new X(msg, { cause: err })` where
   an error is re-thrown with a new message (check each `X` accepts a second argument; Nest's `HttpException` subclasses take
   `{ cause }` in their options object); `no-useless-assignment` (1): remove the dead assignment. Files:
   `libs/common/node/fs/src/lib/common-node-fs.ts:64`, `libs/maps/feature/trip-planner/src/lib/services/trip-planner.service.ts:1240`,
   the `gisday/platform` one your batch 43 named, the `ts-events-ngx` one, and
   `libs/gisday/competitions/data-api/src/lib/export/export.processor.ts:114`. Show each diff.
4. **The oddity you found:** `gisday-platform-data-api` printed `1 error` but Nx did not list it as failed. Find out why (its lint target's
   options, an `--max-warnings`, a `continue-on-error`, or ESLint config severity) and report it. **If its lint lets errors through, fix
   that so errors fail it**, as every other project's do, and say so; if fixing it surfaces other existing errors in that project, list
   them and fix them too if each is one line, else stop and report.
5. Proof: `nx run-many -t lint --skip-nx-cache` on all projects (0 errors), then `scripts/check-in-volume.sh chore/1218-eslint-10` (full
   `affected`, clean `npm ci`). Commit (`chore(workspace): Upgrade ESLint to 10, and fix what its new recommended rules find`, a body,
   `Part of #1218`, the Co-Authored-By line). Push to the fork if all passed.

## Batch 43 (security: #1218 - what TypeScript 7, ESLint 10 and typeorm 1 would break; read-only; 23 October 2026, 1:45 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start whenever nothing else of the security chat's is runnable** (for example if batch 41 stops, or after 42).
**Expected: about 60 minutes.** Read-only: it ends in a report. **Nothing is committed or pushed.**

Your batch 27 inventory found, besides Nx: **TypeScript 6 → 7**, **ESLint 9 → 10** (with `@eslint/js`), and **typeorm 0.3 → 1**. Each is a
#1218 step. This batch measures each one's size, so the steps can be planned: try each **in its own throwaway worktree from
`origin/development`**, one at a time, and measure.

For each of the three:
1. `git worktree add C:/TAMU/wt-try-<name> origin/development --detach`. In Docker (`node:24.22.1`, its own volume), bump just that package
   (and its direct companions: `@eslint/js` with ESLint; `typescript-eslint` only if ESLint 10 requires it) in `package.json`, then
   `npm install`. If it fails to resolve, report the conflict in full and go to the next one.
2. Run, and count errors by kind (not every line; the counts and three representative examples of each kind):
   - **TypeScript 7:** `nx run-many -t build --projects=aggiemap-angular,gisday-angular,gisday-nest,geoservices-nest,mailroom-nest`
     and `npx tsc -p tsconfig.base.json --noEmit` if that works here. Note whether Angular 22's compiler accepts TypeScript 7 at all (its
     peer range in `@angular/compiler-cli`'s `package.json`).
   - **ESLint 10:** `nx run-many -t lint` (all projects), plus what ESLint 10's release notes say changed for flat config and for the plugins
     used here (`angular-eslint`, `typescript-eslint`, `eslint-plugin-*` in `package.json`): does each plugin's current version declare
     ESLint 10 support?
   - **typeorm 1:** build `gisday-nest`, `gisday-competitions-nest` (if it builds today), `mailroom-nest`, and run their tests; read
     typeorm 1's migration notes for anything used here (`find` options, `Repository` methods, `DataSource` setup, decorators). List each
     API used here that the notes say changed, with the files that use it (`git grep` counts).
3. Remove the worktree.

**Report:** one table, a row per upgrade: installs (yes/no), errors (count by kind), the peers that block it, the files most affected,
and your estimate of the work (small: under a day; medium: a few days; large). Then **one recommended order** for them, with a sentence why.
No changes anywhere.

## Batch 41 (security: angular-eslint 22.6.0 by re-resolving only its eight lock entries; a code job and a branch; 23 October 2026, 1:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 30 minutes.** Your batch 39 question 1: **(a)**.

1. In `C:/TAMU/wt-ae2206` (`chore/2168-angular-eslint-22-6`, with your uncommitted `package.json` edit): `git fetch origin`; if
   `origin/development` has moved past `6eac6d637`, rebase onto it first (stash the edit, rebase, re-apply).
2. Delete from `package-lock.json` only the entries for `angular-eslint` and every `@angular-eslint/*` package, at whatever paths they
   occur (top level and nested), with a short script. Report the keys removed. Then, in Docker (`node:24.22.1`, own volume),
   `npm install --package-lock-only --ignore-scripts`. If ERESOLVE again, report it in full and stop.
3. **Prove nothing else moved:** compare the new lock with `development`'s, key by key: list every key added, removed, or whose
   `version` changed. **Expected:** only the eight `angular-eslint` packages (to 22.6.0) and anything that only they depend on. Report
   any other change; if there is one you cannot explain, stop before committing.
4. `scripts/check-in-volume.sh chore/2168-angular-eslint-22-6` (full `affected`, clean `npm ci`): the `Successfully ran target` /
   `failed` lines and each failure's first error. Lint matters most here.
5. Commit (`chore(workspace): Move angular-eslint to 22.6.0, the first step towards Nx 24`, a body with step 3's diff summary,
   `Part of #2168`, the Co-Authored-By line) and push to the fork only if steps 3 and 4 passed.

## Batch 42 (security: Nx 24 - does Jest and webpack still run unconverted? A test, not a branch; 23 October 2026, 1:40 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 41, only if 41 pushed.** **Expected: about 30 minutes.** Your batch 39 question 2: **(c)**, prove the premise
first. The maintainer chose "three branches, each with its own full check: lint, then Jest, then webpack". That only works if Nx 24 still
runs Jest and webpack targets that have not been converted yet. This batch finds out; **commit and push nothing.**

1. `git worktree add C:/TAMU/wt-nx24-probe fork/chore/2168-angular-eslint-22-6 --detach` (batch 41's branch).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, `node node_modules/nx/dist/bin/nx.js migrate 24.0.0`, `npm install`. If it fails,
   report it in full and stop. **Do not run the migrations.**
3. With Nx 24 installed and **no migration run**, run and report exit code and the first error (or the last lines on success) of:
   - `nx run common-utils-string:test` (Vitest) and `nx run geoservices-data-access:test` (Jest, `@nx/jest:jest`);
   - `nx run ui-kits-ngx-forms:lint` (`@nx/eslint:lint`);
   - `nx run gisday-nest:build --configuration=production` (`@nx/webpack:webpack`, with `withNx()` in its `webpack.config.js`);
   - `nx run aggiemap-angular:build --configuration=production` (Angular).
4. Then run **only the lint migrations** (as batch 40 described: `@nx/eslint`, `@nx/eslint-plugin`, and workspace-wide ones they depend
   on), and repeat step 3. Report which migrations you ran.
5. **The answer the director needs, in one line each:** on Nx 24, do unconverted `@nx/jest:jest` targets run? Do unconverted
   `@nx/webpack:webpack` builds run, and if they do, is the output the same as on Nx 23 (compare `dist/apps/gisday-nest/main.js` size and
   the file list with a build from `development`)? Can a lint-only branch pass the full check?
6. Clean up: remove the worktree. Leave the volume.

## Batch 40 (security: #2168 step 1 - Nx 24, the lint targets only; a code job and a branch; 23 October 2026, 1:35 PM Central, from `work (security)`)

**SUPERSEDED at 1:40 PM Central by batches 41 and 42. Do not run it.** Its step 4 rested on a premise batch 42 now tests.

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 39**, and only if batch 39 pushed its branch (angular-eslint 22.6.0). If 39 stopped, stop here too
and say so. **Expected: about 90 minutes.**

**The maintainer's decision on #2168 (23 October):** Nx 24 in three branches, each with its own full check: **lint**, then Jest, then the
webpack builds (the last after #2117). This batch is **lint only**. His comment on #2168 has the order.

1. `git worktree add C:/TAMU/wt-2168-lint -b chore/2168-nx-24-lint fork/chore/2168-angular-eslint-22-6` (on batch 39's branch).
2. In Docker (`node:24.22.1`, own volume): `npm ci`, `node node_modules/nx/dist/bin/nx.js migrate 24.0.0`, then `npm install`. If it
   still fails on peers, report the full conflict and stop (no `--legacy-peer-deps`, no `--force`).
3. Run **only the migrations that concern lint** from `migrations.json` (those for `@nx/eslint`, `@nx/eslint-plugin` and the workspace-wide
   ones they depend on: list which you ran and which you left, with each one's description). Edit `migrations.json` down to that set,
   then `nx migrate --run-migrations`. If a lint migration writes an AI prompt in `tools/ai-migrations/`, do what it asks **by hand** for
   the lint targets only, and say what you did.
   - **Every `@nx/eslint:lint` target must become an inferred `lint` task** that runs the same ESLint on the same files. Pick three projects
     (one Angular library, one Nest app, one plain TS library) and show, before and after, the command Nx runs for `lint`
     (`nx show project <p> --json`, the `lint` target's `command`/`options`).
   - The CI lint exclusions (`lint.yml`, read by `scripts/check-in-volume.sh`) must still mean the same projects.
4. **Jest and webpack must still work on Nx 24 without being converted.** If they cannot (an executor removed, so the target errors), stop
   and report exactly which targets and what error: that changes the plan, and is a question for the maintainer.
5. Proof: `scripts/check-in-volume.sh chore/2168-nx-24-lint` (full `affected`, clean `npm ci`): every `Successfully ran target` / `failed`
   line, each failure's first error. **Lint must run for every project it ran for before (113 minus the removed oidc projects: compare with
   `development`'s count) and pass.** Also the AggieMap dev server from this worktree (own `node_modules` volume, a port other than 4200 if
   busy): first compile without errors, map page answers.
6. Commit with `migrations.json` and `tools/ai-migrations/` removed (`chore(workspace): Upgrade Nx to 24, and move lint to inferred
   tasks`, a body listing the migrations run and any hand changes, `Part of #2168`, the Co-Authored-By line). Push only if step 5 passed.

## Batch 38 (security: #2117 part 2 rebased onto development after PR 2173, and re-proved; 23 October 2026, 1:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 35 report's question 1: **(a)**. PR 2173 (batch 34's npm removal, #2172)
merged as `6eac6d637`, so rebase onto it and resolve.

1. In `C:/TAMU/wt-2117` (`chore/2117-api-own-deps`, `360e453da`): `git fetch origin`; `git rebase origin/development`. In each of the four
   Dockerfiles keep **both**: this branch's builder-stage changes and 2173's runtime-stage lines (the comment and the `RUN rm -rf .../npm ...`
   after `WORKDIR /app`). Report each conflict and how you resolved it.
2. Re-prove, as batch 35 did: production builds, `docker build` all four, each starts and fails only on settings, `gisday-nest` against a
   throwaway SQL Server (200 and 401), **the version check (every package at the root lock's version, at the same path)**, and
   **Trivy** on each new image: expected **0 critical, 0 high** (npm gone and the packages trimmed). Report sizes and counts against
   `:stable`, which is now `6eac6d637`'s build once that publish finishes; say which `:stable` you compared with.
3. Your question 2 (`mssql` is absent from `geoservices-nest` and `mailroom-helper-nest`): add **one sentence** to the comment you wrote in
   `publish.yml` or the Dockerfile (wherever the root-lock-and-prune approach is explained), saying that an API given a TypeORM database
   later needs its driver listed in its own `apps/<app>/package.json`, as `gisday-nest` and `mailroom-nest` do now. No other change.
4. `scripts/check-in-volume.sh chore/2117-api-own-deps`, then `git push --force-with-lease fork chore/2117-api-own-deps` if all passed.
   Report the new head.

## Batch 39 (security: Nx 24's first blocker - angular-eslint 22.6.0 on its own; a code job and a branch; 23 October 2026, 1:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 38.** **Expected: about 30 minutes.** Your batch 36 report's question 1, option **(c)**: move `angular-eslint`
to 22.6.0 on its own first. **Nothing about Nx itself in this branch.** Keep `C:/TAMU/wt-2168` as it is (question 3: keep).

1. `git worktree add C:/TAMU/wt-ae2206 -b chore/2168-angular-eslint-22-6 origin/development`.
2. In `package.json`: `angular-eslint` stays a **range**, `^22.6.0` (it is `^22.0.0` today; `nx migrate` had pinned it exactly, which
   is not wanted), and the three `@angular-eslint/*` at `22.6.0` the same way they are written today (keep each one's existing style:
   exact stays exact, a range stays a range). In Docker (`node:24.22.1`, own volume): `npm install --package-lock-only --ignore-scripts`.
   If that fails with ERESOLVE, report the full conflict and stop; do **not** use `--legacy-peer-deps` or `--force`.
3. If the lock resolved: report which lock entries changed (count, and every package whose version changed), then
   `scripts/check-in-volume.sh chore/2168-angular-eslint-22-6` (full `affected`, clean `npm ci`): the `Successfully ran target` /
   `failed` lines, each failure's first error. Lint is the target that matters here.
4. Commit (`chore(workspace): Move angular-eslint to 22.6.0, the first step towards Nx 24`, a body, `Part of #2168`, the Co-Authored-By
   line) and push to the fork only if step 3 passed.

## Batch 37 (security: #2138, Dependabot version updates - a code job and a branch; 23 October 2026, 1:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 36.**
**Expected: about 30 minutes.** No `package.json` or lock change.

[#2138](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2138): once dependencies are at their latest (#1218),
something has to say when a newer version comes out. Today nothing does: there is no Dependabot or Renovate configuration.

1. `git worktree add C:/TAMU/wt-2138 -b ci/2138-dependabot origin/development`.
2. Write `.github/dependabot.yml` (version 2), weekly, **Monday 06:00 America/Chicago**, every PR targeting **`development`** (the trunk; never
   `master`), labelled `dependencies`, with commit-message prefix `chore(deps)`:
   - **npm** at `/`, `open-pull-requests-limit: 5`, **grouped** so a week brings a few PRs: one group per family, by name pattern -
     `angular` (`@angular/*`, `@angular-eslint/*`, `angular-eslint`), `nx` (`nx`, `@nx/*`), `nestjs` (`@nestjs/*`), `arcgis` (`@arcgis/*`,
     `@esri/*`), `testing` (`jest*`, `@jest/*`, `vitest*`, `@vitest/*`, `@playwright/*`, `@testing-library/*`), `lint` (`eslint*`,
     `@eslint/*`, `typescript-eslint`, `@typescript-eslint/*`, `prettier`), and `everything-else` (`*`) for the rest, **minor and patch only**
     for `everything-else` so each major is its own PR. Majors for the named families stay grouped (they move together).
   - **docker** for each Dockerfile directory: `/apps/aggiemap-angular/src`, `/apps/gisday-angular/src`, `/apps/geoservices-angular/src`,
     `/apps/mailroom-angular/src` (their `FROM` is the pinned `nginx-base:sha-...`; Dependabot will not find newer `sha-` tags, which is fine:
     it is listed so a future move to version tags is covered), and the four API `src` folders (`node:24.22.1`), grouped into one PR.
   - **github-actions** at `/`, grouped into one PR.
   - Leave `security-updates` at GitHub's default (on); this file is for version updates.
3. **Validate it:** the file must parse as YAML, and every `directory` must exist on `development` (list each with `ls`). If a schema
   validator is available offline (for example `npx -y @bugron/validate-dependabot-yaml` or the JSON schema from SchemaStore with `ajv`),
   run it and report the result; if none works offline, say so.
4. Add one short paragraph to `CLAUDE.md`, under "Commit, then run this before every push" or near the dependency-change rule, saying:
   Dependabot opens weekly grouped PRs into `development`; each is handled like any dependency change (its own issue, the full check with a
   clean `npm ci`, the lock rule), and a major-version PR is a decision for the maintainer, not merged on a green check alone.
5. Commit (`ci(workspace): Weekly grouped Dependabot version updates for npm, Docker and Actions`, a body, `Closes #2138`, the
   Co-Authored-By line). `scripts/check-in-volume.sh ci/2138-dependabot` (expect `No tasks were run`; say so - step 3 is the proof).
   Push to the fork.

## Batch 34 (security: #2117 part 1 - npm out of the API images; a code job and a branch; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.** **Expected: about 40 minutes.** Your batch 31 report's question 2, decided by the maintainer: **yes**.

The last accepted image findings (`brace-expansion`, `http-cache-semantics`, `undici`) are in the npm that ships inside
`node:24.22.1-alpine`, and the APIs only run `node main.js`. So remove npm from the **final stage** of the four API Dockerfiles
(`gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`). **Leave #2117's package work out of this branch**: it is batch 35.

1. From `origin/development` (`80687f29d` or later): `git worktree add C:/TAMU/wt-2117-npm -b chore/2117-no-npm-in-api-images origin/development`.
2. In each of the four `apps/<app>/src/Dockerfile`, in the `node:24.22.1-alpine` stage, after `WORKDIR /app`:
   `RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack`
   with a one-line comment above it: `# The APIs run node only; npm in the base image carried every remaining finding in these images (#2117).`
   If `corepack` is not in the image, drop it from the line rather than leave a no-op.
3. Build each API for production (as in batch 31, with `--skip-nx-cache`), copy the root package files in as publish.yml does today
   (`cp package.json package-lock.json dist/apps/<app>/`), then `docker build -t local/nonpm-<app> dist/apps/<app>` for all four.
4. For each image: `docker run --rm --entrypoint sh local/nonpm-<app> -c "node -v; ls /usr/local/bin; ls /usr/local/lib/node_modules 2>/dev/null"`
   (expected: node v24.22.1, no npm or npx), then start it with no settings for up to 20 seconds as in batch 31, step 4: it must fail on
   configuration or a connection, **not** on a missing module. For `gisday-nest`, also the real start against a throwaway SQL Server, as in
   batch 12: `GET /api/seasons/active` 200, an unauthenticated write 401. Remove the throwaway database afterwards.
5. Trivy (`aquasec/trivy:0.76.1`, `--scanners vuln --severity CRITICAL,HIGH --quiet`) on each `local/nonpm-<app>` and on
   `ghcr.io/tamugeoinnovation/<app>:stable`: totals side by side, and whether the three packages are gone.
6. Commit (`chore(workspace): Remove npm from the API images' runtime stage`, a body saying what and why, `Part of #2117`, the
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line), run `scripts/check-in-volume.sh chore/2117-no-npm-in-api-images`, and
   report its `Successfully ran target` / `failed` lines **and whether it ran any task** (a Dockerfile-only change may run none: say so; then
   steps 4 and 5 are the proof).
7. Push to the fork if steps 4 and 5 passed for all four. Report the head commit. Clean up images and containers.

## Batch 35 (security: #2117 part 2 - each API image installs only its own packages, at the root lock's versions; a code job; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 34.** **Expected: about 60 minutes.** Your batch 31 report's question 1, decided by the maintainer:
**(c)**: keep the root lock's exact versions, and prune to what each API uses. **Do not report anything to Nx** (decided: no).

Start from your batch 31 work (`C:/TAMU/wt-2117`, local commit `7c25ba6a0`): rebase it on `origin/development`, or redo it on a fresh
branch `chore/2117-api-own-deps` from `origin/development`, whichever is cleaner. Keep `generatePackageJson: true` (so the build writes
each API's own `package.json`), but **do not use the lock Nx generates** (it is wrong for three of four apps).

**The goal:** each API image ends with `node_modules` holding only what its generated `package.json` needs, **at the versions in the root
`package-lock.json`**, installed reproducibly (no floating versions). How you get there is yours to work out; one approach to try first:
- have the build keep the root files beside the app as `root-package.json` and `root-package-lock.json` (publish.yml's copy step, renamed);
- in the image's builder stage: `npm ci --omit=dev` from the root pair, then make the generated `package.json` the image's
  `package.json` and run `npm prune --omit=dev`, and check what remains.
If that does not prune correctly, say why and try one other approach at most (for example `npm install --omit=dev` with the root lock copied
in as `package-lock.json`, which npm reuses for versions). Report what you tried and what happened, in order.

**Proof, as in batch 31 and batch 34:** all four build and start (failing only on configuration), `gisday-nest` against a throwaway SQL
Server (200 and 401), each image's `node_modules` count and size against `:stable`, and **for each package left, its version matches the
root lock** (a short script comparing `node_modules/*/package.json` versions with the root lock's `node_modules/<name>` entries; report any
mismatch). Then commit (`Closes #2117`), run `scripts/check-in-volume.sh`, and push only if everything passed. If batch 34 merged first,
build on it.

## Batch 36 (security: #2168, Nx 23 to 24 - a code job and a branch; 23 October 2026, 12:55 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 35**, or **before it** if batch 35 is waiting on anything. **Expected: about 90 minutes.**

[#2168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2168): the first step of #1218. Eleven packages are on
Nx 23.3.0 against 24.0.0 (your batch 27 inventory).

1. `git worktree add C:/TAMU/wt-2168 -b chore/2168-nx-24 origin/development` (`80687f29d` or later). In Docker with its own volume
   (`node:24.22.1`): `npm ci`, then `node node_modules/nx/dist/bin/nx.js migrate 24` (report the exact version it resolves to),
   `npm install` (this updates the lock, which is expected here), and `node node_modules/nx/dist/bin/nx.js migrate --run-migrations` if
   `migrations.json` was written. Report every migration it ran, and commit the result **with `migrations.json` removed**.
2. Read Nx 24's breaking changes (its release notes and migration guide) for `@nx/webpack` options, `@nx/jest` helpers, `@nx/angular`, the
   daemon, and `NX_WORKSPACE_DATA_DIRECTORY`. List anything that touches this repository, with the file it touches.
3. **Proof:** `scripts/check-in-volume.sh chore/2168-nx-24` (full `affected`; a lock change means a clean `npm ci`), every
   `Successfully ran target` / `failed` line, and each failure's first error. Then the AggieMap dev server: start it from this worktree as
   CLAUDE.md's "Keep a dev server's install current" says (on a port other than 4200 if 4200 is busy, with its own `node_modules` volume),
   load it, and report that the map page answers and the first compile finished without errors.
4. **Fix what breaks** if it is the upgrade's doing and the fix is small (a renamed option, a moved import). Report each fix. If a fix is
   not small, stop and report it as a question instead.
5. Commit (`chore(workspace): Upgrade Nx from 23 to 24`, a body listing the migrations and fixes, `Closes #2168`, the Co-Authored-By
   line). Push to the fork only if step 3 passed.

## Batch 33 (security: #2155 again, after the gisday-nest fix - the full check; 23 October 2026, 12:15 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 31, before 32.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Batch 30 found `gisday-nest` failing on `TS2503: Cannot find namespace '__esri'` because `ValidObject` came from `@tamu-gisc/common/types`.
It now lives in GIS Day's entities file. The branch also has `development` merged in (PR 2156, squashed).

1. `git fetch fork security/check-2155`. `git rev-parse fork/security/check-2155` must print **`248d79ab52f3d081c27fec5980349d9a74ac47c0`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2155b fork/security/check-2155 --detach`; `cd C:/TAMU/wt-check-2155b`; `git switch -c security/check-2155b`.
3. `scripts/check-in-volume.sh security/check-2155b > ../check-2155b.out 2>&1; echo "exit=$?"`. Report the exit code, the `Successfully ran target`
   or `failed` lines, and each failure's first error. If the only failure is a test timing out, rerun just that project once.
4. Repeat batch 30's step 5 (the `gisday-angular` production build and the `nodemailer|oidc-common|mailer.util` grep) in this worktree,
   with volume `tamu-js-2155-nm`. Report `build=` and the grep output.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2155b --force`; `git branch -D security/check-2155b`.

No pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 33".

## Batch 32 (security: #2154, npm test and npm run coverage work again - a small code job and a branch; 23 October 2026, 12:25 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 31.**
**Expected: about 30 minutes.** A code job: write it, prove it, push a branch; the director opens the pull request. Git Bash.

[#2154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2154): the root `jest.config.ts` is
`module.exports = { projects: [...getJestProjects()] }`, and Nx 23's `@nx/jest` no longer has `getJestProjects` (only
`getJestProjectsAsync`). So `npm test` (`"test": "jest"`) and `npm run coverage` (`"coverage": "jest --coverage --coverageReporters=cobertura"`)
both fail at once. CI is not affected: it runs `nx affected -t test`, which uses each project's own config. Many projects are on Vitest now
(#1479), and a root Jest config can only ever reach the Jest ones.

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-2154 -b fix/2154-root-test-scripts origin/development`; `cd C:/TAMU/wt-2154`.
2. **The change** (decided by the director, so do this rather than choose):
   - Delete the root `jest.config.ts`.
   - In the root `package.json`: `"test": "nx run-many -t test"` and `"coverage": "nx run-many -t test --coverage"`. Leave everything else alone,
     and do **not** touch `package-lock.json`.
   - Correct the three documents that tell people to run `npm run coverage`, so they say what it now does: `.github/workflows/test.yml`
     line 41 (a comment), `test/README.md` line 94, and `.github/copilot-instructions.md` line 49. One sentence each, LF.
   - `git grep -n "jest.config.ts" -- '*.json' '*.js' '*.ts' '*.mjs' ':!node_modules'`: if anything still points at the **root** file (the
     path with no folder in front), fix it the same way and say what. Each project's own `jest.config.ts` stays.
3. **Prove it**, in Docker with a volume of its own (`node:24.22.1`, `npm ci --ignore-scripts` first):
   - `npx jest --listTests` at the root must now fail as "no config" or similar, **not** with `getJestProjects is not a function`. Report what it says.
   - `npm test -- --projects=common-utils-string,ui-kits-ngx-forms` (or two other small projects, one Jest and one Vitest if you can tell them
     apart; say which) must run and pass. Report its last lines.
   - `npm run coverage -- --projects=common-utils-string` must run and report coverage. Report its last lines.
4. Commit: `fix(workspace): Run npm test and npm run coverage through Nx, now that the root Jest config cannot load`, a body saying why,
   `Closes #2154`, and the `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line. Then
   `scripts/check-in-volume.sh fix/2154-root-test-scripts > ../check-2154.out 2>&1; echo "exit=$?"`, and report the `Successfully ran target`
   or `failed` lines.
5. Only if step 4 is exit 0: `git push -u fork fix/2154-root-test-scripts`, and report the head commit.

No pull request and no comments. Report in `work-lab-leila/reports/` with the full diff, and say "work-lab-leila: finished batch 32".

## Batch 31 (security: #2117, each API image installs only its own packages - the code, the proof, a branch; 23 October 2026, 12:20 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 30.**
**Expected: about 60 minutes.** **This is a code job:** you write the change, prove it, and push a branch; the director opens the
pull request from your report. Work from Git Bash.

### Why

[#2117](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2117): every API image installs the production dependencies
of the **whole repository** (about 2,300 packages, the front ends' included). `build.yml` and `publish.yml` copy the root `package.json`
and `package-lock.json` into each `dist/apps/<app>`, and each Dockerfile runs `npm ci`. Today's scan accepts four findings that exist
only because of that (`brace-expansion`, `http-cache-semantics`, `undici`, in the API images). Also, the Dockerfiles say `--omit-dev`, which is
not an npm flag (`--omit=dev` is); it works only because `NODE_ENV=production` is set.

### What I found, so you do not have to

- The four deployed APIs: `gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`. Leave `ues-operations-nest` alone (CI cannot
  build it). Each builds with `@nx/webpack:webpack` and a `webpack.config.js` that uses `withNx()`, so the executor's options apply. Each
  `project.json` already has `"generatePackageJson": false` in both its `production` and `development` configurations.
- CI builds with `--configuration=production` (`build.yml` line 61/64), then `build.yml` line 85 copies the root package files into `dist/`, and
  `publish.yml`'s step "Copy required image build files" runs `cp package.json package-lock.json apps/${{ matrix.image }}` for **every**
  image, front ends included.
- The Dockerfiles (`apps/<app>/src/Dockerfile`, all four identical) do `COPY ../../../package-lock.json ../../../package.json ./`. In the
  build context (`dist/apps/<app>`) that resolves to the context root.
- **The known risk of `generatePackageJson`:** it lists what the code imports. A package loaded at run time by name is missed. The likely
  ones here: TypeORM's driver (`mssql`), and Nest's `@nestjs/platform-express`. If one is missed, the image fails with
  `Cannot find module` or Nest's "package is missing" message.

### Steps

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-2117 -b chore/2117-api-own-deps origin/development`; `cd C:/TAMU/wt-2117`. Report the commit.
2. **The change:**
   a. In the four `apps/<app>/project.json`: `"generatePackageJson": true` in both `production` and `development`.
   b. In the four Dockerfiles: `COPY package.json package-lock.json ./`, and `RUN npm ci --omit=dev`.
   c. In `.github/workflows/publish.yml`, step "Copy required image build files": copy the root files only into an app that has none of its own.
      For example `[ -f apps/${{ matrix.image }}/package.json ] || cp package.json package-lock.json apps/${{ matrix.image }}`, with a comment
      saying why (#2117). Leave `build.yml` alone.
   Keep files LF.
3. **Build each API for production** in Docker, from the worktree, with its own volume:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-2117:/w" -v tamu-js-2117-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts >/dev/null 2>&1; for a in gisday-nest geoservices-nest mailroom-nest mailroom-helper-nest; do node node_modules/nx/dist/bin/nx.js build \$a --configuration=production --skip-nx-cache > /w/build-\$a.log 2>&1; echo \$a=\$?; done"`
   For each: the exit code, whether `dist/apps/<app>/package.json` **and** `package-lock.json` exist, and the `dependencies` list in that
   `package.json` (names only).
4. **Build and start each image, with no settings:** for each app, `docker build -t local/2117-<app> dist/apps/<app>`, then
   `docker run --rm --name t2117 local/2117-<app>` for up to 20 seconds (`timeout 20`), keeping the log. **With no database or settings the app
   is expected to fail**, but on configuration or a connection, **not** on a missing package. Report each image's size, the number of packages it
   installed (`docker run --rm --entrypoint sh local/2117-<app> -c "ls node_modules | wc -l"`), and the first 15 log lines.
5. **If any image fails on a missing package:** add that package to the app's own dependencies, in a new `apps/<app>/package.json`
   containing only `{ "name": "<app>", "dependencies": { "<package>": "<the root package.json's version range>" } }`. Nx merges a project's own
   `package.json` into the generated one. Rebuild that app (steps 3 and 4) until it starts and fails only on configuration. Report each package
   you added and why.
6. **One real start:** run `gisday-nest`'s image against a throwaway SQL Server, as you did in batch 12 (on 23 October, at 6:03 AM), and
   report `GET /api/seasons/active` (expected 200) and that an unauthenticated write gets 401. Remove the throwaway database afterwards.
7. **The point of it:** Trivy on each new image, against the deployed `:stable` one:
   `MSYS_NO_PATHCONV=1 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 image --scanners vuln --severity CRITICAL,HIGH --quiet <image>`
   for `local/2117-<app>` and `ghcr.io/tamugeoinnovation/<app>:stable`. Report the totals for both, side by side, and whether
   `brace-expansion`, `http-cache-semantics` and `undici` are gone.
8. **The pre-push check:** commit (message `chore(workspace): Install only each API's own packages in its image`, a body saying what and why,
   `Closes #2117`, and the `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line). Then
   `scripts/check-in-volume.sh chore/2117-api-own-deps > ../check-2117.out 2>&1; echo "exit=$?"` and report its lines with
   `Successfully ran target` or `failed`.
9. **Only if** step 8 is exit 0 and every image in step 4 fails only on configuration: `git push -u fork chore/2117-api-own-deps`, and report the
   head commit. Otherwise do not push, and say what is left.
10. Clean up the images, containers and throwaway database. Leave the worktree for the director.

Do not open a pull request or comment on GitHub. Report in `work-lab-leila/reports/`, with the diff stat and the full diff of the four
`project.json`, one Dockerfile and `publish.yml`, and say "work-lab-leila: finished batch 31".

## Batch 30 (security: #2155, libs/oidc/common retired and Mailer moved - the full check; 23 October 2026, 12:10 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Deletes `libs/oidc/common`, moves mailroom's `Mailer` to `@tamu-gisc/mailroom/data-api` and two types to `@tamu-gisc/common/types`, and
removes `otplib`, `@nestjs/axios` and `bcrypt`. It sits on top of #2158 (your batch 29).

1. `git fetch fork security/check-2155`. `git rev-parse fork/security/check-2155` must print **`200529d3acd1dd91787500360f89bd1cb5f92d46`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2155 fork/security/check-2155 --detach`; `cd C:/TAMU/wt-check-2155`; `git switch -c security/check-2155`.
3. `scripts/check-in-volume.sh security/check-2155 > ../check-2155.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   **Quote in full** any error naming `@tamu-gisc/oidc/common`, `Mailer`, `ValidObject`, `AuthOptions`, `otplib`, `@nestjs/axios` or `bcrypt`.
   If the only failure is a test timing out, rerun just that project once.
5. **One extra check, for what this is for:** in the same worktree, with the check's volume or a fresh `npm ci`, build `gisday-angular` for production and
   report whether any file under `libs/oidc` or `libs/mailroom/data-api` appears in its build. Use:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-check-2155:/w" -v tamu-js-2155-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts >/dev/null 2>&1; node node_modules/nx/dist/bin/nx.js build gisday-angular --configuration production --skip-nx-cache > /w/gd-build.log 2>&1; echo build=\$?; grep -rl -E 'nodemailer|oidc-common|mailer.util' dist/apps/gisday-angular | head"`
   Report `build=` and the grep output (expected: none).
6. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2155 --force`; `git branch -D security/check-2155`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 30".

## Batch 29 (security: #2158, the retired IdP removed - the full check; 23 October 2026, 12:00 PM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 27.**
**Expected: about 10 minutes.** From Git Bash, in order. Change nothing.

Removes three apps (`oidc-provider-nest`, `oidc-admin-nest`, `oidc-admin-angular`), the libraries `libs/oidc/provider`, `libs/oidc/admin`
and `libs/oidc/ngx`, and ten packages; the lock loses 72 entries and changes no version. It sits on top of PR 2156.

1. `git fetch fork security/check-2158`. `git rev-parse fork/security/check-2158` must print **`3250d965e3cb1140f8547487427090088135afef`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2158 fork/security/check-2158 --detach`; `cd C:/TAMU/wt-check-2158`; `git switch -c security/check-2158`.
3. `scripts/check-in-volume.sh security/check-2158 > ../check-2158.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   **Quote in full** any error naming `@tamu-gisc/oidc/provider`, `@tamu-gisc/oidc/admin`, `@tamu-gisc/oidc/ngx`, or one of the removed packages
   (`oidc-provider`, `node-jose`, `angular-auth-oidc-client`, `body-parser`, `cookie-parser`, `express-rate-limit`, `helmet`, `yargs`).
   If the only failure is a test timing out, rerun just that project once.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2158 --force`; `git branch -D security/check-2158`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 29".

## Batch 28 (gisday: #2133, say that the production gisday-nest image needs AUTH0_MANAGEMENT values locally; 23 October 2026, 12:00 PM Central, from `work (gisday)`)

Run it after batches 26 and 27. A small documentation change, about 20 minutes.
[#2133](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2133) says what and why: it came
from your own report `2026-10-23-1.md`.

**Already seen on `work` today:** the published `gisday-nest:sha-ee1a9e4`, run with `gisday-api.local.env` plus
`AUTH0_MANAGEMENT_DOMAIN=placeholder.invalid`, `AUTH0_MANAGEMENT_CLIENT=placeholder` and
`AUTH0_MANAGEMENT_SECRET=placeholder`, started and answered `/api/seasons/active` with 200.

### What to do

1. Branch `docs/2133-gisday-nest-image-locally` from the latest `origin/development`, in its own worktree.
2. Reproduce both halves with the published image `ghcr.io/tamugeoinnovation/gisday-nest:sha-ee1a9e4`, on a throwaway
   database or none at all (the error comes before the database):
   - with `apps/gisday-nest/local.env.sample` alone it exits with "Management service configuration is missing required
     parameters", even with `AUTH0_MANAGEMENT_DISABLED=true`;
   - with the three placeholders added it gets past that point.
   Put both outputs in the report.
3. In `docs/gisday-local.md`, under "Things that look broken", add one entry: the error, why (only the local build
   reads `AUTH0_MANAGEMENT_DISABLED`; the production configuration requires the three values and makes no network call
   for them), and the three placeholder lines. Link #2133. Match the file's style; LF endings.
4. No code change. Commit, and push to the fork. The check is not needed for a docs-only change; run
   `bash scripts/gisday-local.test.sh` in case it reads the doc.

### Then

Report `work-lab-leila/reports/<date>-<n>.md` with the branch and head commit and the two outputs. Nothing on GitHub;
the director opens the pull request.

---

## Batch 27 (security: #1218, what is out of date - a read-only inventory; 23 October 2026, 11:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 20 minutes.** Read-only: it ends in a report. Nothing in the repository changes. From Git Bash, in order.

The maintainer's goal (#1218, his comment of 23 October): every dependency at the latest it can be, once the security queue is
clear. This batch measures how far away that is, so the work can be planned in steps.

1. `git fetch origin development`; `git worktree add C:/TAMU/wt-outdated origin/development --detach`. Report the commit.
2. `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-outdated:/w" -v tamu-js-outdated-nm:/w/node_modules -w /w node:24.22.1 sh -c "npm ci --no-audit --no-fund --ignore-scripts > /w/ci.log 2>&1; echo ci=\$?; npm outdated --json > /w/outdated.json; echo outdated=\$?"`
   (`npm outdated` exits 1 whenever something is out of date; that is expected.) Report both numbers and the size of `outdated.json`.
3. From `outdated.json`, which lists each package's `current`, `wanted` (the newest its `package.json` range allows) and `latest`:
   a. **Totals:** how many packages; how many have `wanted` newer than `current` (an in-range update); how many have `latest`
      on a **newer major** than `current`.
   b. **A table of every package whose `latest` is a newer major**, sorted by name, with columns: package, current, wanted, latest,
      and **family**: put it in the first of these that matches its name: `@angular/*` or `angular*` → Angular; `@nx/*`, `nx` →
      Nx; `@nestjs/*` → NestJS; `@arcgis/*`, `esri*` → ArcGIS; `typeorm`, `mssql`, `pg` → database; `jest*`, `vitest*`, `@vitest/*`,
      `@testing-library/*`, `playwright`, `@playwright/*` → testing; `eslint*`, `@eslint/*`, `typescript-eslint`, `@typescript-eslint/*`,
      `prettier` → lint; `typescript` → TypeScript; `rxjs`, `zone.js`, `tslib` → runtime; anything else → other.
   c. **Per family:** the count, and the oldest `current` major against the `latest` major (for example "Angular: 22 → 23").
   d. **The ten furthest behind** by number of majors (latest major minus current major), with their family.
4. Node itself: report `node -v` in the image (`node:24.22.1`), and the `engines` field of the root `package.json` if there is one.
5. Do not judge or plan; report the numbers and tables exactly. Clean up: `git worktree remove C:/TAMU/wt-outdated --force`. Leave the volume.

Nothing else: no pushes, no pull request, no comments, no changes. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 27".

## Batch 26 (security: #2122, the first eleven unused dependencies removed, and uuid listed; 23 October 2026, 11:35 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 10 minutes**, a full `affected` check. From Git Bash, in order. Change nothing.

`package.json` loses 11 dependencies nothing references and gains `uuid` (^8.3.2, the version already installed); the lock loses
37 entries and changes no version. It sits on top of PR 2153 (nodemailer 10).

1. `git fetch fork security/check-2122`. `git rev-parse fork/security/check-2122` must print **`cc819f1c565914f37c658f4496ecb8b6b6a6203b`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2122 fork/security/check-2122 --detach`; `cd C:/TAMU/wt-check-2122`; `git switch -c security/check-2122`.
3. `scripts/check-in-volume.sh security/check-2122 > ../check-2122.out 2>&1; echo "exit=$?"` (full `affected`, clean `npm ci`).
4. Report the exit code, every log line with `Successfully ran target` or `failed`, and each failure's project, target and first error.
   A failure naming one of the removed packages (`@angular/pwa`, `@nestjs/mapped-types`, `@nestjs/serve-static`, `csurf`, `date-and-time`,
   `document-register-element`, `font-awesome`, `md5`, `mime-types`, `mysql`, `qrcode`) is the important kind: quote it in full.
   If the only failure is a test timing out, rerun just that project once with `scripts/check-in-volume.sh security/check-2122 <project>`.
5. `cd C:/TAMU`; `git worktree remove C:/TAMU/wt-check-2122 --force`; `git branch -D security/check-2122`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 26".

## Batch 25 (security: #2115 again, after the type fix, and batch 23 resumed with a knip config; 23 October 2026, 11:05 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 25 minutes.** Starting batch 24 while 23 waited was right; thank you. Do these in order, from Git Bash.

**Part A: #2115's check, on the fixed head.**

1. `git fetch fork security/check-2115`. `git rev-parse fork/security/check-2115` must print **`6116951f50c569cb2aec73da84581821dc7f8ffd`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2115 fork/security/check-2115 --detach`, then in that folder `git switch -c security/check-2115`.
3. In that folder, `cd` there first (so the clean-up in step 6 is not run from inside it):
   `scripts/check-in-volume.sh security/check-2115 > ../check-2115.out 2>&1; echo "exit=$?"`
   Report the exit code and every log line with `Successfully ran target` or `failed`, and for each failure the project, target and first error.
4. **Only if** the one failure left is the `gisday-platform-data-api` test "answers 413 for an organization logo over the shared
   file-size limit" timing out: run `scripts/check-in-volume.sh security/check-2115 gisday-platform-data-api` once and report its exit
   code. Then run the same for `development`: `scripts/check-in-volume.sh development gisday-platform-data-api`, and report that exit code too.
5. **Not needed again:** the real send passed in batch 24.
6. `cd C:/TAMU`, then `git worktree remove C:/TAMU/wt-check-2115 --force` and `git branch -D security/check-2115`.

**Part B: batch 23, step 3, with a knip configuration of its own.** knip reads the repository's root `jest.config.ts` through its
Jest plugin, and that file fails (`getJestProjects` is gone from `@nx/jest`). The report only needs dependencies, so turn the
Jest plugin off with a configuration file kept **outside** the repository:

7. Write `C:/TAMU/knip-2122.json` containing exactly: `{ "jest": false }`
8. `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -v "C:/TAMU/knip-2122.json:/cfg/knip.json:ro" -w /w node:24.22.1 sh -c "npx -y knip@5 --config /cfg/knip.json --include dependencies,devDependencies,unlisted,binaries --no-exit-code --reporter json > /w/knip-report.out 2> /w/knip.err"`
9. If `knip-report.out` is empty, report the first 40 lines of `knip.err` and stop. If knip fails on another config file in the
   same way, add that plugin to the JSON as `"<plugin>": false` (for example `"vitest": false`), say which, and try again, **at most three times**.
10. Then batch 23's steps 4 to 6 as written. Also delete `C:/TAMU/knip-2122.json`.
11. **Worth its own line in the report:** the root `jest.config.ts` calling a function `@nx/jest` no longer has. Say whether anything
    runs that file (`git grep -n "jest.config.ts" -- '*.json' '*.yml' '*.ts' ':!node_modules'`), so the director can file it.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 25".

## Batch 24 (security: #2115, nodemailer 6 to 10: the full check, and a real send; 23 October 2026, 10:50 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start after batch 23.**
**Expected: about 20 minutes.** Do exactly these steps, in order, from Git Bash. Change nothing in the repository.

1. `git fetch fork security/check-2115`. Then `git rev-parse fork/security/check-2115` must print
   **`42826d479dc3cf3a0093318b1a37265c3c8b7bc7`**. If not, stop and report it.
2. `git worktree add C:/TAMU/wt-check-2115 fork/security/check-2115 --detach`, then in that folder `git switch -c security/check-2115`.
3. In that folder: `scripts/check-in-volume.sh security/check-2115 > ../check-2115.out 2>&1; echo "exit=$?"`. This is the full
   `affected` check. `package.json` changed, so expect nearly every project, and a clean `npm ci`. Report the exit code
   and every log line containing `Successfully ran target` or `failed`; for each failure, the project, the target and
   the first error. **nodemailer 10 ships its own types for the first time**, so a type error in
   `libs/oidc/common/src/lib/utils/email/mailer.util.ts` or `libs/mailroom/common` is possible. Report it exactly; do not fix it.
4. **A real send, with nodemailer 10, to a local mail catcher.** Start Mailpit:
   `docker run -d --name mailpit-2115 -p 18025:8025 -p 11025:1025 axllent/mailpit:v1.27`
5. Install the new nodemailer into a scratch folder and send two messages:
   `mkdir -p C:/TAMU/scratch-2115 && cd C:/TAMU/scratch-2115`
   `MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/scratch-2115:/s" -w /s node:24.22.1 npm install --no-audit --no-fund nodemailer@10.2.1`
   Then write this file as `C:/TAMU/scratch-2115/send.js`, exactly:

   ```js
   const nodemailer = require('nodemailer');
   // The same safety options mailroom passes to every transport (libs/mailroom/common, SAFE_TRANSPORT_OPTIONS).
   const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: 11025, secure: false, ignoreTLS: true,
     disableFileAccess: true, disableUrlAccess: true });
   (async () => {
     const ok = await t.sendMail({ from: 'test@example.com', to: 'someone@example.com', subject: 'nodemailer 10 test', text: 'hello' });
     console.log('PLAIN', ok.messageId, ok.accepted);
     try {
       await t.sendMail({ from: 'test@example.com', to: 'someone@example.com', subject: 'must not send',
         attachments: [{ filename: 'passwd', path: '/etc/passwd' }] });
       console.log('FILE ATTACHMENT SENT - THE BLOCK DID NOT WORK');
     } catch (e) { console.log('FILE ATTACHMENT REFUSED', e.code, e.message); }
   })();
   ```

   Run it: `MSYS_NO_PATHCONV=1 docker run --rm --add-host=host.docker.internal:host-gateway -e SMTP_HOST=host.docker.internal -v "C:/TAMU/scratch-2115:/s" -w /s node:24.22.1 node send.js`
6. Ask Mailpit what arrived: `curl -s http://localhost:18025/api/v1/messages`. Report the whole output of step 5, and from
   step 6 the `total` and each message's `Subject`. **Expected:** `PLAIN` with one accepted address; `FILE ATTACHMENT REFUSED`;
   exactly **one** message in Mailpit, "nodemailer 10 test".
7. Clean up: `docker rm -f mailpit-2115`, delete `C:/TAMU/scratch-2115`, `git worktree remove C:/TAMU/wt-check-2115 --force`,
   `git branch -D security/check-2115`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 24".

## Batch 23 (security: a knip report for #2122, which dependencies nothing uses; 23 October 2026, 10:25 AM Central; step 3 fixed 10:50 AM, from `work (security)`)

**Resume at step 3**, in the worktree and volume you kept. Steps 1 and 2 stand.

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 25 minutes.** Read-only: it ends in a report, and nothing in the repository changes.

[#2122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2122) removes the packages we install
but do not use. Four of the seven remaining high advisories (`oidc-provider`, `@koa/cors`, `node-forge`, `node-jose`) are in
packages that only the oidc apps use, and CI does not build those apps. This report is what the maintainer decides from.
Do exactly these steps, in order, from Git Bash.

1. `git fetch origin development`, then `git worktree add C:/TAMU/wt-knip origin/development --detach`. Report the commit.
2. Install, into a volume of its own:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -w /w node:24.22.1 npm ci --no-audit --no-fund --ignore-scripts`
   Report the exit code and the "added N packages" line.
3. Run knip for dependencies only:
   `MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-knip:/w" -v tamu-js-knip-nm:/w/node_modules -w /w node:24.22.1 sh -c "npx -y knip@5 --version; npx -y knip@5 --include dependencies,devDependencies,unlisted,binaries --no-exit-code --reporter json > /w/knip-report.out 2> /w/knip.err"`
   **First delete `C:/TAMU/wt-knip/knip.json`** if it exists: knip reads a file of that name as its configuration, which is
   what stopped the first run (the director's mistake). Report the knip version it printed, and the size of `knip-report.out` and `knip.err`.
   The report is JSON, named `.out` so knip cannot mistake it for configuration. If it is empty, report the
   first 40 lines of `knip.err` and stop there. Do not try other options.
4. From `knip-report.out`, list in the report, as tables: **unused dependencies**, **unused devDependencies**, **unlisted** (imported but
   not in `package.json`), and **unused binaries**. Give each name and the file knip names. Do not judge them; just list them.
5. For each of these packages: `oidc-provider`, `koa`, `@koa/cors`, `node-jose`, `node-forge`, `jsonwebtoken`, `passport-jwt`,
   `coveralls`, `request`, run in the worktree
   `git grep -l -E "(from|require\()\s*['\"]<package>(/|['\"])" -- apps libs tools`
   (with `<package>` replaced by the name) and report, for each one, the projects the files belong to (the folder under
   `apps/` or `libs/`). "None" is an answer.
6. Clean up: `git worktree remove C:/TAMU/wt-knip --force`. Leave the volume.

Nothing else: no pushes, no pull request, no comments, no changes. Report in `work-lab-leila/reports/` and say
"work-lab-leila: finished batch 23".

## Batch 22 (aggiemap: #2134 and #2144, two small code jobs; 23 October 2026, from `work (aggiemap)`) - ALREADY DONE

**Renumbered from 19, and already run - do not run it again.** I queued it as "batch 19" without reading the
top of this file, and 19 was already the security chat's. The lab ran mine at **10:01-10:04** as
"batch 19 (aggiemap)".

**Correction (10:40 AM):** an earlier version of this note said the collision made the lab skip the security
chat's batch 21. **It did not.** Batch 21 ran at 9:51 and passed (`reports/2026-10-23-9.md`); it is being run
again only because its head moved. The duplicate number was real, the skip was not, and I should not have
written a consequence I had not checked.

Kept at its correct number so the sequence reads straight, and marked done so nobody repeats it.



**After the vulnerability work, whenever you are idle.** Both were queued for `codex-home`, which runs on the
`home` machine and cannot be started today. Neither has been begun. **Two separate branches, no pull
requests** - I do the GitHub half.

**You may be on the TAMU AI key for this**, so every step below is written as an exact command. If the
allowance runs out, write `TAMU AI allowance used up at <time, US Central>` at the top of your `STATUS.md`
with the task and step you reached, and stop. Nothing is lost; it resumes from that step.

---

### Task 1 - #2134, quote four shell variables in `publish.yml`

```
cd C:\TAMU\Tamu.GeoInnovation.js.monorepo
git fetch origin
git worktree add -b ci/2134-publish-yml-quoting C:\TAMU\wt-2134 origin/development
```

**Red first.** Run actionlint before changing anything and keep the output:

```
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/wt-2134:/repo" -w /repo rhysd/actionlint:1.7.7 .github/workflows/publish.yml
```

Expect **4 SC2086 findings** in the `list-publishable` job, around lines 25, 28, 37 and 38.

**The change**, in `C:\TAMU\wt-2134\.github\workflows\publish.yml` only:

- `echo "exists=true" >> $GITHUB_OUTPUT` becomes `echo "exists=true" >> "$GITHUB_OUTPUT"` (both places)
- `echo $JASON` becomes `echo "$JASON"`
- `echo "matrix=$JASON" >> $GITHUB_OUTPUT` becomes `echo "matrix=$JASON" >> "$GITHUB_OUTPUT"`

**Leave the variable named `JASON`.** It is a misspelling of `JSON`; renaming it is not this change.

**Green after:** the same actionlint command, expecting **exit 0 and no findings**. Keep both outputs.

```
cd C:\TAMU\wt-2134
git add -A
git commit -m "ci(workspace): Quote the shell variables actionlint flags in publish.yml" -m "Closes #2134"
git push -u fork ci/2134-publish-yml-quoting
```

**Do not run `check-in-volume.sh`** - a workflow file is not an Nx project, so it reports `No tasks were run`,
which is not a pass.

**If `publish.yml` has changed under you** and those four lines are already quoted, stop and say so: the
security chat's publish-gate work (#2135) edits this file, and if it has taken these lines the issue is
overtaken rather than done.

---

### Task 2 - #2144, a baseline capture from a worktree silently records no commit

Read [#2144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2144) first; it has
the mechanism. In short, `tools/visual-baselines/capture.mjs:207` returns `null` when `git rev-parse` fails,
which is what happens in a worktree, and nothing says so.

```
cd C:\TAMU\Tamu.GeoInnovation.js.monorepo
git worktree add -b fix/2144-baseline-commit-from-worktree C:\TAMU\wt-2144 origin/development
```

**Two changes, and the second is the point:**

1. **Find the commit wherever the capture runs.** When `.git` is a file rather than a directory, read its
   `gitdir:` line and use that.
2. **Stop it being silent.** When the commit still cannot be found, the run must say so plainly where it
   prints `release ...`, and the manifest must record *why* rather than only `null`.

**Do not make a missing commit fatal** - a set without a commit is better than no set. **Do not touch the
capture, comparison or output layout.** **Do not take any screenshots for this**: a full set is taken on the
work machine only, because every set lives there.

**Tests**, as `tools/*.test.mjs`, run by `node --test`, no network and no Docker:

- `.git` as a **file** with a `gitdir:` line pointing at a real gitdir - the commit is found;
- `.git` as a **directory** - still works, so the main checkout does not regress;
- the gitdir unreachable - **the loud message is produced** and the manifest says why.

**Prove the third red first**, against the unchanged code, and keep that output. A test for "it tells you"
that was never seen to fail is not evidence that it tells you.

```
MSYS_NO_PATHCONV=1 docker run --rm -m 4g -v "C:/TAMU/wt-2144:/w" -w /w node:24.22.1 node --test "tools/**/*.test.mjs"
cd C:\TAMU\wt-2144
git add -A
git commit -m "fix(visual-baselines): Find the release commit from a worktree, and say when it cannot" -m "Closes #2144"
git push -u fork fix/2144-baseline-commit-from-worktree
```

---

### Report

`work-lab-leila/reports/<date>-<n>.md`: for task 1 the actionlint output before and after; for task 2 the
failing test output, the passing output, and what the run prints when the commit cannot be found.


## Security work is not ours (23 October 2026, 8:35 AM Central, from `work (aggiemap)`)

At the maintainer's decision, **all security and vulnerability work in this repository is directed by a
separate chat**, `js.monorepo - Security - CSA 305 Desktop`. No machine's `TASKS.md` will carry it again.

**What that covers:** #2111 and everything under it, **#2112 to #2120** and **#2135**, Dependabot, CodeQL and
secret-scanning alerts, base-image updates, committed credentials, and any issue whose main purpose is
security.

**Handed over as of now:** **#2119** (the nginx base image - your batch 15 finished it; nothing further is
scheduled) and **#2120** (upload limits). Do not pick either up again.

**If you find a vulnerability while doing something else:** file the issue with every field `CLAUDE.md`
requires, say in your report that it is **for the security chat**, and carry on with your batch. Do not fix
it, and do not wait for an answer.

**`package.json` and `package-lock.json` are shared ground.** A queue of lock changes is in flight
(2125 merged; 2128, 2129, then 2130's reseed). **Do not change either file**, and if a batch ever seems to
require it, say so in your report instead of doing it.


## Decided (23 October 2026, 8:15 AM Central, from `work (aggiemap)`, now the director)

Every outstanding **Questions for the director** in your reports, answered. Nothing here needs you to act
unless a later batch says so.

**Report 2026-10-22-1 (batch 9), tagging `prod-2026-10-22`.** Overtaken: the maintainer tagged it himself
with `--force`, so (a) happened. Your recommendation (c) - allow the failure, re-run, then tag - was the
better reading of the rules, and it is why `tag-build.sh --force` now demands a reason and writes it into the
tag (#2098, merged). The tag that prompted this is the example in its own documentation.

**Report 2026-10-22-2 (batch 10), the refusals.** **(a) and (c), as you recommended**, confirmed by the
maintainer. The check keeps failing rather than retrying inside the test, and the servers are filed:
**#2127** (High) for `arc.ts.tamu.edu`, and a comment on **#2080** for `gis.tamu.edu`. Your batch 11
re-measure is what made that possible - without it this would have been filed as a standing fault during a
day of reboots, or dropped as "the maintenance".

**Report 2026-10-22-3 (batch 11), what to file.** **(b), as you recommended** - two issues, because the two
servers behave differently. #2127 carries your cycle strip and the request times verbatim, because that is
the part their logs can act on.

**Report 2026-10-23-1, the `AUTH0_MANAGEMENT_*` values.** **(b)** - a sentence in `docs/gisday-local.md`.
You are right that the next person hits it. Filed, see below.

**Report 2026-10-23-2, the API images installing every dependency.** **(b), and it is already filed**:
**#2117**. Your measurement - about 2,450 packages per image, and 4 of the 17 runtime advisories coming from
packages no API loads - is the reason it is worth doing, and it is quoted in the seeded acceptance file: 112
of the 262 entries are #2117's.

**Report 2026-10-23-3.**
- **The arrows: (a)**, as you recommended. A security fix does not carry a cosmetic change.
- **`geoservices-nest` has no `ValidationPipe`: (a), as its own issue.** Filed, see below.
- **`multer`/`tar`/`dicer`: its own branch**, because it is a major and `multer` is a direct dependency of
  ours. Filed, see below. Note `@nestjs/platform-express` already carries `multer` 2.4.0, which is the
  strongest argument that our `^1.4.3` is simply stale.

### One thing to keep doing

Three of your reports changed a decision rather than confirming one: batch 11 overturned "it was the
maintenance", batch 10 found the refusals nobody was looking for, and 2026-10-23-2 found that the images
install the front ends' dependencies. Each came from measuring something the batch did not ask for and saying
so plainly. Keep doing that.


## Batch 21 (security: the full pre-push check for #2112's second round; 23 October 2026, updated 10:20 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now** (it was skipped after batch 20; the head below is new, so nothing from the old one counts).
**Expected: about 10 minutes**, a full `affected` check.

A lock-only security update (`npm audit fix --package-lock-only`) on top of PR 2129, plus a paragraph in `CLAUDE.md`. Do
exactly these steps, in order, from Git Bash. Change nothing.

1. `git fetch fork security/check-2112b`
2. `git rev-parse fork/security/check-2112b` must print **`b94d3985e9994058d4696f421382ad49a302a028`**. If not, stop and report it.
3. `git worktree add C:/TAMU/wt-check-2112b fork/security/check-2112b --detach`, then in that folder `git switch -c security/check-2112b`
4. In that folder: `scripts/check-in-volume.sh security/check-2112b > ../check-2112b.out 2>&1; echo "exit=$?"`
   The full `affected` check, with a clean `npm ci`. No project list.
5. Report the exit code, and every log line containing `Successfully ran target` or `failed`. For a failed test, its name
   and message. If the only failure is one test in `ui-kits-ngx-forms` (#1898), run
   `scripts/check-in-volume.sh security/check-2112b ui-kits-ngx-forms` once and report that exit code too.
6. `git worktree remove C:/TAMU/wt-check-2112b --force`, then `git branch -D security/check-2112b`.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 21".

## Batch 20 (security: the pre-push check and a scan for #2119, the front ends on the new nginx-base; 23 October 2026, 9:45 AM Central, from `work (security)`)

**Director: work, its security chat** (questions go under **Questions for the director (security)**). **Start now.**
**Expected: about 15 minutes.**

The four front ends' Dockerfiles move from `nginx-base:sha-1a94632` to **`nginx-base:sha-09b7e41`**, the build of
TamuGeoInnovation/nginx-base#1 (nginx 1.30.6, Alpine 3.24.3), plus a release-notes file. Do exactly these steps, in order,
from Git Bash. Change nothing.

1. `git fetch fork fix/2119-nginx-base-1.30`
2. `git rev-parse fork/fix/2119-nginx-base-1.30` must print **`762ad6a745eb1aa9f3aed5ace53417952ea893dd`**. If not, stop and report it.
3. `git worktree add C:/TAMU/wt-check-2119 fork/fix/2119-nginx-base-1.30 --detach`, then in that folder `git switch -c fix/2119-nginx-base-1.30`
4. In that folder: `scripts/check-in-volume.sh fix/2119-nginx-base-1.30 aggiemap-angular,geoservices-angular,gisday-angular,mailroom-angular > ../check-2119.out 2>&1; echo "exit=$?"`
   Report the exit code and every log line containing `Successfully ran target` or `failed`.
5. Scan the new base, the same way as batch 15:
   `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 image --scanners vuln --severity CRITICAL,HIGH ghcr.io/tamugeoinnovation/nginx-base:sha-09b7e41`
   Report the totals line(s) and any finding listed.
6. Build **one** front end on it, as in batch 15: from the step-4 production build of `gisday-angular` (`dist/apps/gisday-angular` in the
   volume's clone, or build it again in the worktree if needed), `docker build` an image with its own Dockerfile
   (no edits, it already says `sha-09b7e41`), run it with a dummy value for every `___NAME___`, and report: starts or not,
   placeholders left, `/` and `/some/deep/link?x=1` status codes, and the `Server` header.
7. `git worktree remove C:/TAMU/wt-check-2119 --force`, then `git branch -D fix/2119-nginx-base-1.30` and `git branch -D security/check-2129`
   (both local only). Remove the image you built in step 6.

Nothing else: no pushes, no pull request, no comments. Report in `work-lab-leila/reports/` and say "work-lab-leila: finished batch 20".

## Batch 19 (security: the full pre-push check for 2129, swiper 14 on the new lock; 23 October 2026, 9:25 AM Central, from `work (security)`)

**Director: work, its security chat** (`js.monorepo - Security - CSA 305 Desktop`; questions go under **Questions for the
director (security)**). **Start now.** **Expected: about 25 minutes**, a full `affected` check.

PR 2129 (#2114, swiper 14) changes `package-lock.json`. It has had `development` merged in, which brings PRs 2123, 2125 and
2128, and its lock was regenerated with no change. This check proves the result before the PR branch is updated.

Do exactly these steps, in order, from Git Bash. Do not change anything, and do not improvise.

1. `git fetch fork security/check-2129`
2. `git rev-parse fork/security/check-2129` must print **`1568148d8576abc5e7da32f54bd714e3b8847714`**. If it prints
   anything else, stop and report what it printed.
3. `git worktree add C:/TAMU/wt-check-2129 fork/security/check-2129 --detach`
4. In `C:/TAMU/wt-check-2129`: `git switch -c security/check-2129`
5. In the same folder: `scripts/check-in-volume.sh security/check-2129 > ../check-2129.out 2>&1; echo "exit=$?"`
   This is the full `affected` check, which also runs a clean `npm ci` because the lock changed. Do not add a project list.
6. Report:
   - the exit code;
   - the last 10 lines of `../check-2129.out`;
   - from the log file the script names, each line containing `Successfully ran target` or `failed`;
   - for any failed test, its name and message.
7. **If exactly one test fails and it is in `ui-kits-ngx-forms` (the date-time-picker, known flaky under load, #1898):**
   run `scripts/check-in-volume.sh security/check-2129 ui-kits-ngx-forms` once more and report its exit code too.
   Any other failure: do not retry, just report it.
8. Then `git worktree remove C:/TAMU/wt-check-2129 --force`. Leave the Docker volume.

Nothing else: no pushes, no pull request, no comments, no fixes. Report in `work-lab-leila/reports/` as usual and say
"work-lab-leila: finished batch 19".

## Batch 18 (security: the pre-push check for #2136, the nginx-base pin; 23 October 2026, 9:05 AM Central, from `work (security)`)

**Director: work, its security chat** (`js.monorepo - Security - CSA 305 Desktop`; questions go under **Questions for the
director (security)**). **Start after batch 17.** **Expected: about 15 minutes**, four front-end builds.

[#2136](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2136) pins the four Angular front ends'
Dockerfiles from `nginx-base:latest` to `nginx-base:sha-1a94632`. Both tags have the same digest today
(`sha256:7639ecc9...`), so nothing should change. This is the step before the new base for #2119 can merge.

1. `git fetch fork fix/2136-pin-nginx-base`. The head must be **`f0ce79757`**. If it is anything else, stop and say so.
2. From Git Bash, in a worktree at that head:
   `scripts/check-in-volume.sh fix/2136-pin-nginx-base aggiemap-angular,geoservices-angular,gisday-angular,mailroom-angular`.
   Report its exit code and the log's last lines, per target: lint, test, build.
3. Nothing else: no image builds, no pushes, no pull request, no comments. The director opens the pull request from your report.

Report in `work-lab-leila/reports/` as usual and say "work-lab-leila: finished batch 18".

## Batch 17 (gisday: checks after the `sha-8ee8c6e` release; 23 October 2026, 9:05 AM Central, from `work (gisday)`)

**Director: work, its GIS Day chat** (see `DIRECTOR.md`; questions go under **Questions for the director (gisday)**).
**Expected: about 60 minutes**, most of it the photo sets. Read-only against production: no sign-in, no admin pages, nothing
written anywhere but your machine and this branch.

GIS Day's site and API went to production on both sites as **`sha-8ee8c6e`** on 22 to 23 October (txgisday.org,
gisday.tamu.edu and tamu.txgisday.org in one deployment; gisday.ucgis.org in another). It carries
[#2092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2092) (show or hide sessions from the admin
Events list), [#2090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2090) (the Copy page's
"Applying..." state) and [#2103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2103) (speaker names
keep their g, j, p and y). Work from a worktree at `origin/development` (`8ee8c6e` or later; GIS Day has not changed since).

1. **The GIS Day browser tests against production.** `E2E_BASE_URL=https://txgisday.org npx playwright test test/e2e/gisday`
   in the Playwright container, as `playwright.config.ts` runs them. **Leave out `ucgis-site.spec.ts`**: it rewrites the
   dev server's scripts to make a local build act as UCGIS, which means nothing against a deployed site. Per spec: passed,
   failed, and each failure's message. `presenter-cards.spec.ts` answers the presenters request itself, so it tests the
   deployed stylesheet, which is the point.
2. **The speaker cards on all four addresses**, against real data: run `presenter-cards.spec.ts` with `E2E_BASE_URL` set to
   each of `https://txgisday.org`, `https://gisday.tamu.edu`, `https://tamu.txgisday.org` and `https://gisday.ucgis.org`. It
   must pass on all four. Then, with real data, load each address's `/presenters` and confirm every card is one size (list the
   sizes found; UCGIS's site has presenters since its 22 October pre-load).
3. **The production photo sets for `sha-8ee8c6e`**, with `tools/visual-baselines` (its README): `--app gisday --env production
   --release sha-8ee8c6e` for txgisday.org, then the same with `AGGIEMAP_SMOKE_BASE_URL=https://gisday.tamu.edu` and
   `--release sha-8ee8c6e-gisday.tamu.edu`, and with `https://gisday.ucgis.org` and `--release sha-8ee8c6e-gisday.ucgis.org`.
   Kept on your machine under `visual-baselines`; report the shot counts and any page that failed.
4. **The APIs answer:** `/api/seasons/active` on all four addresses, status and the season's year.

Report in `work-lab-leila/reports/2026-10-23-5.md` and say "work-lab-leila: finished batch 17". **Nothing to post on GitHub**:
the director comments on the issues from your report.

## Batch 16 (workspace: #2118) - Moved to `work` as its batch 24, 7:20 AM Central, 23 October 2026

Do not start it; the work machine has it.

## Batch 15 (workspace: #2119, prove a new nginx-base locally; queued 23 October 2026, 7:15 AM Central, from `home`)

**Start after batch 14.** **Director: home.** **Expected: about 45 minutes.** Heavy (four front-end builds). **Push nothing
to the nginx-base repository**: every push to any of its branches publishes `:latest`, which every front end's next build
takes. Test locally only.

[#2119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2119) (High): the front ends' base, `ghcr.io/tamugeoinnovation/nginx-base:latest`, is `FROM nginx:1.23.2-alpine`
(Alpine 3.16.3, 4 critical and 27 high OS findings). The candidate is `nginx:1.30.6-alpine` (Alpine 3.24.3, current stable).

1. Clone `TamuGeoInnovation/nginx-base` (public) into a scratch folder, change only its `FROM` to `nginx:1.30.6-alpine`, and
   `docker build` it locally as `nginx-base:candidate`.
2. **Trivy** it (pinned release), critical and high: expect none; list any.
3. For **each front end** with a Dockerfile (`aggiemap-angular`, `gisday-angular`, `geoservices-angular`, `mailroom-angular`):
   a production build from `origin/development`, then `docker build` its image with the Dockerfile's `FROM` pointed at
   `nginx-base:candidate` (a local edit, not committed). Run it with the `ANGULAR_*` settings its deployment uses (the
   names are in the app's `environments/common.config.ts`; dummy values are fine), and check: the container starts; the
   **token substitution ran** (no `___ANGULAR_` placeholder left in `index.html` or the main bundle); `/` and one deep
   link answer 200 with the app's `index.html`; and `nginx -t` passes on the app's `nginx.conf`.
4. Compare with the **current** base: the same checks on one front end built on `nginx-base:latest`, so any difference is
   the base's.
5. The one-line diff for nginx-base's Dockerfile, and a second for its workflow so `:latest` is published only from `master`
   (`latest=${{ github.ref_name == 'master' }}` or the `enable=` form), **as text in your report**, not pushed.

Report in `work-lab-leila/reports/2026-10-23-4.md`; one line on #2119.

## Batch 14 (workspace: #2111, the fixes, as three branches; 23 October 2026, 6:55 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 2 hours in all**, one task at
a time; heavy (installs, checks, a dev server). Nothing else heavy beside it.

**Why:** your batch 13 report, now the plan for [#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111). The maintainer wants the lab to take work first. **Branches
only, pushed to the fork; no pull requests.** home files an issue for each (it needs the maintainer's priority) and opens
them. Each branch from the latest `origin/development`, its own worktree, one commit per change, `Co-Authored-By` line.

1. **`fix/2111-in-range-security-updates`: every advisory fixable inside the ranges `package.json` already allows.**
   `npm audit fix --package-lock-only` (no `--force`), in `node:24.22.1`. Then check the lock moved only what it should: list
   every package whose version changed, and **undo any change outside the advisories' packages and their own dependencies**.
   Include `postcss-url` 10.1.3 to 10.1.4 (patch) for `minimatch`. **No downgrades** (your report found three `npm audit`
   suggests: `@angular/build`, `@nx/node`, `csurf`; leave those). Then `scripts/check-in-volume.sh <branch>` (full
   `affected`; it runs a clean `npm ci` because the lock changed). Report: before and after `npm audit` counts by severity,
   the changed packages with old and new versions, the check's exit code and what it ran.
2. **`fix/2111-class-validator-0.15`: `class-validator` 0.13.2 to 0.15.1** (critical; every NestJS API). Read its changelog
   from 0.14 and 0.15 for breaking changes, search our DTOs for each changed decorator or option, fix what breaks, and run the
   APIs' unit tests and the full affected check. Then start `gisday-nest` (as you did in batch 12) and post one valid and one
   invalid body to a validated route: the invalid one must still get a 400. Report the breaking changes found and what each
   needed.
   **Also, decided by the maintainer (7:05 AM):** set `forbidUnknownValues: true` and `whitelist: true` on every API's global
   `ValidationPipe` (`apps/*-nest/src/main.ts`), and check with the same two requests plus a body carrying an undeclared
   field (it must be dropped, not stored). If `whitelist` breaks a route that relies on undeclared fields, say which and leave
   `whitelist` off there with a comment, rather than working round it.
3. **`fix/2111-swiper-14`: `swiper` 11.2.10 to 14.3.0** (critical; AggieMap's bonfire and POI popups, and UES). Read the
   migration notes from 12, 13 and 14, update `libs/aggiemap/ngx/popups/.../bonfire` and `.../poi` (and any UES use), run the
   affected check, then on the AggieMap dev server photograph one bonfire popup and one POI popup with a carousel, **before
   (development) and after (the branch)**, desktop and phone, into `docs/screenshots/2111-swiper-14/` on the branch, and add a
   release-notes file in `docs/releases/unreleased/` (`2111-swiper-14.md`, the one-file format) with its What to test on dev
   row. If either popup looks or behaves differently, say how.

**Issues, filed by home (7:00 AM):** task 1 is **#2112**, task 2 **#2113**, task 3 **#2114** (all High). Name the branches
`fix/2112-in-range-security-updates`, `fix/2113-class-validator-0.15` and `fix/2114-swiper-14`, end each commit message
with `Closes #<that issue>`, and name the release-notes file `2114-swiper-14.md` (screenshots in
`docs/screenshots/2114-swiper-14/`).

For each task: push the branch to the fork, put its name and head commit in `STATUS.md`, and post one line on #2111. Report in
`work-lab-leila/reports/2026-10-23-3.md`.

## Batch 13 (workspace: #2111, which advisories reach each deployed app; 23 October 2026, 7:00 AM Central, from `home`)

**Director: home.** Questions under **Questions for the director (home)**. **Expected: about 60 minutes.** Heavy (builds);
nothing else heavy beside it.

**Why:** [#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111) (High). `npm audit --package-lock-only` on `development` at `35581d0` reports 68 advisories (6 critical, 28 high, 30 moderate, 4 low) across 2,640 packages. Most are probably build tooling; this finds which reach what we deploy. **Change nothing**: no dependency edits, no branches, no pull requests. Report only.

From a worktree at `origin/development` (`35581d0` or later; say which):

1. `npm audit --json --package-lock-only` once, saved, for the advisory list and each one's dependency paths.
2. **For each deployed app**, find what it ships:
   - **NestJS APIs** (`gisday-nest`, `geoservices-nest`, `mailroom-nest`, `mailroom-helper-nest`): `nx build <app>
     --configuration production`; the generated `dist/apps/<app>/package.json` is what the image installs. Resolve it
     against the lock (`npm ls --omit=dev --all` in a copy of that folder with the lock, or by walking the lock).
   - **Angular front ends** (`aggiemap-angular`, `gisday-angular`, `ues-operations-angular`, `mailroom-angular`,
     `geoservices-angular`, and any other app `publish.yml` builds an image for): a production build with
     `--stats-json`, and the packages whose files appear in the bundle.
3. **One table:** every critical and high advisory, by package and advisory title, with a column per deployed app saying
   **runtime** (in its image or bundle), **build-only**, or **absent**, plus the fixed version `npm audit` names and
   whether that is a patch, minor or major bump of what we use. Moderates in a second, shorter table: package, apps
   it reaches at runtime, fix.

Report in `work-lab-leila/reports/2026-10-23-2.md`, and a summary comment on #2111 (counts and the runtime list, no more).

## Batch 12 (workspace: #2107, prove the four API images on Node 24.22.1; 23 October 2026, 6:15 AM Central, from `home`)

**Director: home**, for this batch. Questions go under **Questions for the director (home)**. **Expected: about 25 minutes.**
Heavy while the builds run; nothing else heavy beside it.

**Why:** Node 24.22.0, which every pin in the repository used, has a Brotli decoder flaw with a public remote-code-execution
proof of concept ([#2107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2107), CVE-2026-111497, Urgent). The four NestJS APIs decompress `Content-Encoding: br` request
bodies (Express 5, body-parser 2.3.0), so they are reachable from any client. The fix moves every pin to 24.22.1.

**Branch:** `fork/fix/2107-node-24.22.1`, head `8e1132afb`. Run from a worktree at that commit.

1. **Build each API's Docker image from its own Dockerfile**, the way `publish.yml` does: for each of `gisday-nest`,
   `geoservices-nest`, `mailroom-nest` and `mailroom-helper-nest`, `nx build <app> --configuration production` in
   `node:24.22.1` (node_modules in a volume), copy `package.json` and `package-lock.json` into `dist/apps/<app>` as
   `publish.yml` does, then `docker build` from that folder. Record each build's exit code.
2. **In each image, run `node -v`** (expect `v24.22.1`), and `node -e "require('zlib').constants.BROTLI_DECODER_ERROR_FORMAT_BLOCK_SWITCH"`
   printing a number (the constant only 24.22.1 exposes).
3. **Start the `gisday-nest` image** against a throwaway SQL Server container restored from
   `apps/gisday-nest/src/database/gisday-local.bak` (as `scripts/gisday-local.sh restore` does), with
   `apps/gisday-nest/local.env.sample` as its settings, and confirm `GET /api/seasons/active` answers 200.
4. **Send it one request with `Content-Encoding: br`** and a body of random bytes (not an exploit, just malformed
   Brotli) to any POST route, and record the status and whether the process stays up. Expect a 4xx and no crash.

Report on [#2107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2107): each image's build result, `node -v`, the constant, the 200, and the malformed-Brotli result. Then
remove the images and containers you made. **Push no branches and open nothing**; home opens the pull request.

## Batch 11 (aggiemap: #2101, re-measure the paging refusals; 22 October 2026, 3:52 PM Central, from `work (aggiemap)`)

**Expected: about 30 minutes.** Straight after batch 10, same branch.

### Why

Your batch 10 found about **one paged request in ten refused**, on both `gis.tamu.edu` and `arc.ts.tamu.edu`,
one of them with #2080's exact words. I was about to file that against the GIS team as a standing fault.

**The maintainer says they were doing server updates and reboots all day, and that those are now finished.**
Rolling reboots produce exactly this signature: a node out of the pool answering differently from its
neighbours, the same question getting a different answer on the next try. So the measurement may be of the
maintenance rather than of the servers.

**This is the difference between a real fault and a ghost**, and it decides what gets filed and what the GIS
team is asked to chase. Measure it again now the reboots are done.

### What to do

1. **Repeat batch 10's hand measurement exactly**, so the two tables can be put side by side — same layers,
   same four questions, same counts:

   | Layer, question | Batch 10 |
   | --- | --- |
   | `TS_Events/MotorcycleParking/MapServer/0`, no order | 2 of 8 refused |
   | Motorcycle, `orderByFields=OBJECTID` | 2 of 12 refused |
   | `FCOR/TAMU_Basemap_20261008/MapServer/4`, no order | 1 of 10 refused |
   | Basemap 4, `orderByFields=OBJECTID` | 1 of 12 refused |

   **Use at least the same number of attempts, and more if you can** - 20 each would make a rate of about 10%
   much harder to miss by luck. Say exactly how many you ran. One refusal in twenty is a different claim from
   none in eight.

2. **Run `services.spec.ts` against production three times** from the batch 10 branch, and report passed,
   failed and flaky for each, with the layer and message of every failure.

**One more data point, from `work`, and it does not settle anything.** `services.spec.ts` on production
finished at **3:51 PM Central**, about a minute before the maintainer said the reboots were finished: 161
passed, **1 flaky - `TS_Events/MotorcycleParking/MapServer/0` again**, `Pagination request requires either
orderBy field or the layer/table needs to have OID Field to facilitate the request.`, then paged on the
retry. Same layer as yours. That run overlapped the end of the maintenance, so it is evidence of neither
case; yours, run afterwards, is the one that counts.

3. **Say plainly which of these it is**, and do not soften it either way:
   - **No refusals at all** across the hand measurement and three runs: the batch 10 flakes were the
     maintenance, nothing is filed against the GIS team, and that is a good outcome.
   - **The same rate as before**: it is a standing fault, and the issue gets filed with both tables.
   - **Something between**: say the numbers and do not round them into either story.

4. **If a refusal happens, record the exact message and the time (Central)**, so a server-side log can be
   matched to it.

### Then

- Nothing to push but your report: `work-lab-leila/reports/2026-10-22-3.md`. The branch does not change.
- If anything in batch 10's report turns out to have been the maintenance, say so there too - the director
  will carry the correction into the pull request, which is open by then.


## Batch 10 (aggiemap: #2101, a layer that answers short; 22 October 2026, 12:55 PM Central, from `work (aggiemap)`)

**Expected: about 90 minutes.** Nothing else is queued for you. This is a code job that must be proven against
live services, which is why it is yours rather than a development machine's: it ends in a branch and a report,
and `work (aggiemap)` does the GitHub half.

### What this is

[#2101](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2101). A layer that
**refuses** a query already fails the suite — that is the `queryError` check, and it is what went red 22 times
in your batch 9. A layer that **answers short** does not: if a service hands back 1,000 of the 1,524 features
it holds, with no error, the map draws a third fewer markers and everything passes.

**Read the issue before you start, and ignore the "What to build" section in it.** It proposes comparing the
layer view's feature count with the service's, in the view's extent. **That was tried on `work` and it does not
work** — measured against production:

```
/map                       Buildings            370/381    97%
                           Surface Lots         179/181    99%
/parking/sustainable-...   City Bike Lanes       68/667    10%
                           Campus Bike Lanes   1170/3139   37%
```

Those layers are all healthy. A layer view's in-extent count is simply not the service's in-extent count: line
layers are clipped and tiled, and the view holds what it needs at the current level of detail. No tolerance
survives that — one loose enough to pass a healthy layer at 10% can never catch a third of markers missing.
Don't spend time re-deriving this; it is written up for you here so you don't.

### What to build instead

**Ask whether the service can deliver everything it claims.** Service-side, deterministic, no layer view, no
extent, no timing — the same answer every run.

For each ArcGIS layer endpoint the maps use:

1. `returnCountOnly` for the layer's own total, and `maxRecordCount` from its metadata.
2. **If the total is at or below `maxRecordCount`, there is nothing to prove.** Pass.
3. **If the total exceeds it**, request the records past that boundary — `resultOffset=<maxRecordCount>` with
   `resultRecordCount` — and require them to come back. A refusal (`Pagination is not supported.`) or an empty
   answer means **no client can fetch the whole layer**, so the map cannot draw it in full. Fail.

On 22 October that would have failed outright: 1,524 features, `maxRecordCount` 1,000, and the service
answering `Pagination is not supported.` It answers correctly now — `resultOffset=1000` returns the remaining
524 — so **expect this to pass today**. That is fine. Proving it green on a healthy service and red on a
contrived one is the proof we want; see below.

### Where it goes

`test/smoke/aggiemap/services.spec.ts` is the natural home: it already walks every service in `connections.ts`,
asks each one directly with no browser, and has the `allowedServiceFailures` machinery. Follow what is there
rather than inventing a shape — in particular `problemWith()`, which already distinguishes an ArcGIS error
object from an HTTP status.

**Note the layer-endpoint problem and solve it honestly.** Most entries in `connections.ts` are service roots;
the layer index is appended in the definitions (`${connections.tsMainUrl}/6`). So a URL ending in `/<n>` is a
layer and can be asked directly, and a MapServer root is not. Either ask the root for its layers and check each,
or check only the layer endpoints and **say in your report which layers are therefore not covered**. Do not
quietly check five of them and report it as covering the maps.

### How to prove it

- **Red first, against something that really refuses.** You cannot make the live service fail, so build the
  refusal case as a unit-style test of the helper with a stubbed response, or point it at a layer that genuinely
  refuses paging if you find one. Say in the report exactly how you made it fail; "it would fail if..." is not a
  proof.
- **Green on production**, run as the suite runs it, and **report every layer's numbers** — total,
  `maxRecordCount`, and whether paging past it worked. Those numbers are the useful output even if nothing
  fails, because they say which layers are near the boundary.
- `tsc -p test/smoke/aggiemap --noEmit` must exit 0. There is no Nx project for the smoke suite, so
  `check-in-volume.sh` will report `No tasks were run` — that is expected and is not a pass.
- **Watch the runtime.** This adds requests to a spec that runs in every tier. Say how much longer it made the
  services spec; if it is more than a couple of minutes, say so and recommend what to do about it.

### Then

- Branch `task/2101-service-completeness` from the latest `development` (it already carries `featureCountError`
  from #2100 — build on that, don't revert it). Push to your fork. **No pull request** — you have no `gh`.
- Report as `work-lab-leila/reports/2026-10-22-2.md`, with the per-layer numbers, how you proved it red, the
  runtime cost, and anything you could not cover.
- **`heldInExtent` / `serviceInExtent` do not exist and must not be added.** They were written on `work` and
  discarded; the probe is not changing in this batch.


## Still there? (21 October 2026, 2:00 AM Central, from `home (aggiemap)`)

Your last push was 12:05 AM ("#1969 is two lookups racing; unit tests red") and its `Next update by 12:55 AM Central` has passed. If you
are running, push a one-line status with a new `Next update by` time. If you are blocked on an approval prompt, say so in `STATUS.md`
if you can. If nothing is heard by **2:45 AM Central**, batch 7 (#2019) moves to `home`; batch 6 (#1969) stays yours until morning.

## Batch 7 (aggiemap) - Withdrawn at 2:45 AM Central, 21 October 2026

No push since 12:05 AM and no answer to the 2:00 AM "Still there?". **Do not start this batch:** #2019 is being done on `home`.
Batch 6 (#1969) is still yours: if you have work on it, push the branch and a status line when you are back.

## Batch 6 (aggiemap: #1969, the lot-link race - fix it; 20 October 2026, 11:58 PM Central)

**After batch 5** (the release tier and its tag). **Expected: about 60-90 minutes.** The maintainer is asleep; questions go in the
report for `home (aggiemap)`, and nothing waits on him.

**Release notes now:** a pull request adds its own file `docs/releases/unreleased/<issue>-<slug>.md` (see that directory's README on
`development`, #2038) and does **not** edit `unreleased.md`. `docs/testing.md`: change no count (#2002). Read every check's log for
"No tasks were run". **You open the pull request yourself**, ready for review, body from the template, every field you can set;
if `gh` lacks `project` scope, say so in your report and `home (aggiemap)` adds the board fields.

**[#1969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1969), now High.** Your batch-4 finding is on
the issue: on an event map a `?lot=` link opens the **main map's** lot popup first on nearly every load, and the event map's own
answer replaces it only if it arrives before the map reports `ready`; delay the event map's own service 4 s with `page.route` and it
fails 4 of 4.

1. Branch `fix/1969-lot-link-race` from the latest `origin/development`.
2. **Red first:** a smoke test in `lot-links.spec.ts` (or beside it) that delays the event map's own service with `page.route` and
   expects the event map's own lot; run it against dev (`run-local.sh development one ... --retries=0`) and quote the failure. A unit
   test in `ts-events-ngx` for the lookup order as well, red first.
3. **Fix** in `EventService` (`libs/ts/events/ngx/src/lib/services/event/event.service.ts`, `selectFeatureByFieldMatch` and the
   search-source fallback): a `?lot=` link on an event map waits for the map's own layers and asks them first, and falls back to the
   main map's lot source only if none of them answers. Keep #1952's qualified-field match and #1954's `queryDrawnFeatures` filter.
4. **Green** on a local production build (served as `aggiemap-dev`, `local-production`): the delayed-service test, the whole
   `lot-links.spec.ts`, and `selection.spec.ts`. Then the scoped check `ts-events-ngx,aggiemap-angular`.
5. Images: before (dev, delayed service: the main map's lot) and after; the notes file `docs/releases/unreleased/1969-lot-link-race.md`
   with its What-to-test row. Pull request `Closes #1969`, labels `bug`.

## Start batch 5 now (20 October 2026, 11:36 PM Central): `main-MQDQOFSZ.js` IS `b78942631`

**Azure, read by home: Release-487, build 20261020.40, from `b78942631`, `GIS-1D Development` succeeded.** So the
bundle dev serves now, `main-MQDQOFSZ.js`, is tonight's build. **Start the tier now.**

Why your check could not match: **a deployed bundle's name differs per environment for the same commit** - each stage
substitutes its own Google Analytics id (`G-71VY0QZS5P` on dev, `G-GNS4JMVEZW` on production) and it is baked into the
bundle. A local production build carries production's id, which is why your `8463ac6af` build matched production's
`main-AYJ2SDWT.js` exactly - and why `b78942631`'s local `main-3EFVYPNN.js` will **never** appear on dev (dev's
`8463ac6af` was `main-IORMDVQQ.js`). Compare a bundle only with the same environment's previous one, or read Azure. Stop
the 2-minute wait.

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

## Batch 9 (22 October 2026, 8:05 AM Central) - the release tier against production

Release-490 is live on production, from `36b962a04e55ae379d0d771bfa7e0ee2e831b98d` (`36b962a04`). It
carries everything from Release-489 - the 2026-27 athletics dates, #1969's lot links, Vendor and
Business Parking, the legend symbols, accessible parking on three sports maps, Team Bus Parking, the
retired Live at the Station map, the Football Tailgating kiosk - plus three GIS Day changes.

### Why this run matters more than the usual production tier

**`36b962a04` has never had a release tier.** The tier that cleared this release ran on `61161ce1b`,
the commit before the three GIS Day changes, and is what `dev-2026-10-21` tags. The delta was checked
by reading it rather than by running it: three GIS Day pull requests, whose only shared-code change was
an added barrel export and a CSS variable with an unchanged default, neither reachable from AggieMap.
All three passed Build / Affected and both Azure production builds.

So **this run is the first test of the commit that is actually serving users**, and
`scripts/tag-build.sh prod` is being held until it passes. Do not tag anything yourself.

### What to run

```
test/smoke/aggiemap/run-local.sh production release
```

**`production`, not `development`**, and `release`, not `quick`. Nothing else heavy on the machine.

### What to expect, so a real failure is not lost in the known ones

[#2075](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2075) has been open
since 21 October because production's scheduled run was failing on maps this release fixes. **Those
failures should now be gone**, and the issue closes itself when a GitHub run passes. If any of them is
still failing, that is a finding and not noise: it would mean a fix did not reach production.

**One that will still fail, and should:**
[#2080](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2080) - Accessible
Building Entrances. The service fails about half its queries and caps the rest at 1,000 of 1,524
features. That is the published service, not this release, and it is the GIS team's. Name it in the
report rather than letting it read as new.

### What to report

- Passed, failed, flaky, skipped, the elapsed time, and **every failure named with its map and
  message**.
- The bundle production served, read from the page, and the commit from the handover above.
- Compare with the dev tier on `61161ce1b`: **618 passed, 0 failed, 0 flaky, 44 skipped**. Production
  lists fewer maps than dev, so the totals will not match - say what the shape is, not just the number.
- `#1898` is a known flake.

**Do not tag.** A clean pass means the director tags `prod-2026-10-22`; anything else means it does
not, and we find out why first.

## Read this first (21 October 2026, 8:15 AM Central) — you have been silent for thirteen hours

Your last push was **12:05 AM**, part way through batch 6 (#1969), and your own **12:55 AM deadline passed
unanswered**. That is the rule working as intended: the director checked, asked once, and at 2:45 AM
**withdrew your batch 7 (#2019)** and had it done on home instead, so nothing waited on a machine nobody
could see. **Batch 6 is still yours** — the red unit tests and the "two lookups racing" finding exist only
on your machine, and no branch was pushed.

The maintainer is coming to look at your screen. The likely cause is an approval prompt. **When you come
back:**

1. **Push whatever batch 6 already has** before anything else — the unit tests, a branch, your status. Work
   that exists only on one machine is work nobody else can pick up, which is exactly why batch 7 had to be
   redone from scratch.
2. **Then do batch 8 below, before finishing #1969.** It is on the release path and the season it carries
   starts on 2 November; #1969 is High but nothing waits on it.
3. **Push a fresh `Next update by HH:MM Central` as soon as you start**, and move it on as you go.

---

## The commit is named: Release-489, `61161ce1b` (21 October 2026, 9:58 AM Central)

**Stop the tier you started on Release-488 and restart it on Release-489.** This is the director naming
the commit, which the hold said to wait for.

| | |
| --- | --- |
| **Release** | **489**, build 20261021.16 |
| **Commit** | `61161ce1bb5ea3852bd42d04ee13ebc6543ab630` |
| **Bundle dev serves** | `main-T7LYF72R.js` |

**Release-488 (`67e95b4b1`, `main-YX345P5S.js`) is not going out** — its production stage is cancelled.
It does not contain **#1969's lot-link fix** (PR 2064), which is user-visible on fourteen parking maps, and
that is exactly why the rebuild happened. A tier on 488 clears a build nobody will ship.

Nothing went wrong on your side: home reported 488 at 9:28 and corrected it at 9:53, and you started in
between. Discard the 488 run — do not report its numbers as if they cleared anything — and say in your
report that it was started and abandoned, with why. A run that is quietly dropped is how a wrong number
ends up in release notes later.

Everything else in batch 8 stands:

- `test/smoke/aggiemap/run-local.sh development release`, nothing heavy beside it;
- report passed / failed / flaky / skipped, the elapsed time, **every failure named with its map and
  message**, and both the bundle dev served and the commit;
- last night's tier on the previous build was 613 / 0 / 0 / 44 — a different shape is worth saying loudly;
- `#1898` is a known flake;
- **tag only on a clean pass**: `scripts/tag-build.sh dev 61161ce1bb5ea3852bd42d04ee13ebc6543ab630`, then
  `git push origin <tag>`. Anything failed means no tag — report and stop.

## Hold batch 8 until the director names the commit (21 October 2026, 9:25 AM Central)

**Do not start the tier on whatever dev happens to be serving.** Two builds are in play this morning:
one from `67e95b4b1`, which the maintainer is pushing to dev now, and one from `61161ce1b`, the
current head, which adds #1969's lot-link fix (PR 2064). Batch 8 below names `67e95b4b1` because it was
written before 2064 merged.

**Which of those is going to production is the maintainer's call and is not settled yet.** A release tier
is about thirty minutes and it clears exactly one build; run it against the wrong one and it clears
nothing.

So: **wait for the director to say, in your `TASKS.md`, which commit to test.** Everything else in batch
8 stands - the `release` tier, nothing heavy beside it, tag only on a clean pass, and report the bundle
dev served as well as the commit.

While you wait, nothing heavy. Your batch 6 is finished and PR 2064 is merged.

## Batch 8 (21 October 2026, 8:15 AM Central) — the release tier for today's dev build

**The maintainer is building now, from `67e95b4b1`.** This build is going to production: it carries the
2026-27 athletics dates (**women's basketball starts 2 November**), Vitest 5, NestJS 12, the accessibility
rules, the notices fix, Team Bus Parking (#2059) and GIS Day's phone-width admin pages.

### Wait for the build, and find its commit properly

**Do not start until the build is on dev**, and **do not identify it by bundle name**. Each stage bakes its
own analytics id in, so the same commit produces different bundle hashes on dev and production — a bundle
name cannot tell you which commit an environment is serving. Read Azure instead:

```
python C:\TAMU\logs\az-releases.py
```

(The PAT is in the user environment.) Confirm it reports the release and that its commit is `67e95b4b1`. If
it is a different commit, **say so and stop** — the maintainer may have built something else, and a tier
against the wrong build clears nothing.

### Then run the release tier

```
test/smoke/aggiemap/run-local.sh development release
```

**`release`, not `quick`.** `quick` covers the core plus what changed since the last `dev-*` tag and is for
clearing an ordinary dev build; this one is going to production, which is what `release` is for. About
thirty minutes on your machine; roughly thirty-seven on the work machine.

**Nothing else heavy runs on your machine while it does.** That rule exists because a browser loop beside a
tier once failed nine maps in a run that was deciding a production release.

### What to report

- **Passed, failed, flaky, skipped, and the elapsed time.** Name every failure with its map and its message
  — not just a count.
- **The bundle dev served**, read from the page, *and* the commit Azure reported. Both, because they answer
  different questions.
- Last night's tier on the previous build was **613 passed, 0 failed, 0 flaky, 44 skipped**. A failure that
  is not in that shape is worth saying loudly.
- `#1898` is a known flake; if it appears, say so rather than letting it read as new.

### The tag

**Tag only on a clean pass**, and only if the commit is the one above:

```
scripts/tag-build.sh dev 67e95b4b135d27b17bf6f1482d38760925f39a62
git push origin <tag>
```

A `dev-*` tag is a claim that this build was tested. If anything failed, do not tag — report and stop, and
the director decides.

### Afterwards

Back to batch 6, #1969.

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
