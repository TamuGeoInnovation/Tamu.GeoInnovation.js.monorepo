# Cloud session: current tasks

You're on the `cloud-mailbox` branch of TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo. Read this file, do
the current batch, then report and stop. The desktop session rewrites the batch for each round; git history
keeps the old ones.

**The rules are in CLAUDE.md on `development`, section "The cloud session".** Read it first; it's the only
place they're kept. In short:
- do only this batch;
- file what you find as issues right away;
- no comments, PRs or merges;
- one `cloud/<issue>-<topic>` branch per issue, from the latest `development`, with a `.pr-body.md` last commit;
- no `development` merges;
- no `Claude-Session:` lines in commit messages;
- the repo is public: no customer names, keys, server names or internal addresses anywhere;
- **write your report here:** `cloud/reports/<yyyy-mm-dd>-batch-<letter>.md`, committed and pushed to
  `cloud-mailbox` (only that file). Cover each branch, its state and checks, the issues you filed with suggested
  priorities, anything you couldn't do, and the questions for Dan, as numbered decisions with lettered options
  (each saying in plain words what happens) and a recommendation. The desktop session reads it there;
- say "branch ready: <names>".

## Template for each item (the desktop session fills it in)

    N. **#<issue> (<priority>): <one-line title>**
       - Goal: <one or two sentences: what "done" looks like>
       - Where: <apps, libs, files, earlier PRs to follow>
       - Decided: <Dan's decisions that apply; "none" if none>
       - Tests: <tests expected>
       - Don't touch: <files or areas other work is changing>

## Batch D (prepared 26 November 2026, 6:45 PM Central, by the GIS Day desktop session)

Write your report to `cloud/reports/<yyyy-mm-dd>-batch-d.md` on this branch when done (see the header).
Times in the report are US Central, with the zone named.

**This batch is writing, not code.** The maintainer chose (26 November, #3793 question 6A) to have a design proposal drafted for each of two large GIS Day features, for him to review before anything is built. Each is one Markdown document on its own branch. Nothing deploys, nothing runs against any environment, and no code changes.

1. **#2079 (Medium): sub-admins who can change only their own organization's events, speakers and sponsors**
   - Goal: `docs/designs/2079-gisday-sub-admins.md`, a proposal the maintainer can answer quickly. It needs:
     - the problem;
     - the two approaches the issue names (per site, within one site), compared;
     - a recommended approach, with what changes in Auth0 (roles, permissions), the API (which routes check what), the data (which records gain an organization) and the admin pages;
     - the migration of today's data;
     - what is out of scope;
     - **a numbered list of decisions for the maintainer, each with lettered options and a recommendation.**
   - Where: read #2079 and its comments, #442 (closed as its duplicate, with rules to carry over), #2012 and #2078 (sites per organization), `libs/gisday/platform/data-api` (entities in `all.entity.ts`, the guards in `@tamu-gisc/common/nest/auth`), and `libs/gisday/platform/ngx/core` (the admin pages).
   - Decided: none yet. That's what the document is for.
   - Tests: none. It's a document.
   - Don't touch: any code.
2. **#2072 (Medium): txgisday.org as a statewide landing page for each organization's GIS Day site**
   - Goal: `docs/designs/2072-txgisday-landing-page.md`, in the same shape. Answer the issue's "To decide" list with a recommendation each: what the page shows, the same application in a landing mode or a static page, what happens to existing txgisday.org links, and where accounts and sign-in live. Then the decisions for the maintainer.
   - Where: #2072 and its comments, #567 (closed as its duplicate), #2012, `libs/gisday/common` (how the address picks the site), `apps/gisday-angular`.
   - Decided: until the plan exists, txgisday.org keeps all its current content (the issue says so).
   - Tests: none.
   - Don't touch: any code.

Branches: `cloud/2079-sub-admins-design` and `cloud/2072-landing-page-design`, each with a `.pr-body.md` last commit (`no-visible-change`, `Closes` nothing: write "Part of #2079" or "Part of #2072", since a design doesn't finish the issue).

## Batch C (prepared 7 October 2026)

Write your report to `cloud/reports/<yyyy-mm-dd>-batch-c.md` on this branch when done (see the header).
Times in the report are US Central, with the zone named.

**Do not run anything against dev or production until the maintainer tells you, in this session, that
his dev deploy is finished.** A deploy is going out now. Until then, write code and run whatever needs
no deployed site. If you finish everything else first, report what is left to run and stop.

1. **#1407 (Low, due before 19 October): Pin the GitHub workflows to `ubuntu-24.04`**
   - Goal: no workflow under `.github/workflows/` uses `ubuntu-latest`, so nothing moves to Ubuntu 26
     on 19 October untested. The Azure pipeline's half is #1468, not this batch.
   - Where: every `runs-on:` in `.github/workflows/*.yml`.
   - Decided: pin to `ubuntu-24.04` exactly; one pull request for all the workflows.
   - Tests: the pull request's own CI runs on the pinned image; list every workflow changed, and any
     workflow that does not run on a pull request (it gets checked after merge).
   - Don't touch: the `EXCLUDED_PROJECTS` lines (another branch edits them).

2. **#1473 (Medium): Split the bus test into one test per route**
   - Goal: `bus.spec.ts`'s "every route draws a stop for each stop it lists" becomes one test per route,
     with the same checks, so the 7-to-11-minute test spreads across workers and a failure names its
     route. The suite's other tests are unchanged.
   - Where: `test/smoke/aggiemap/bus.spec.ts`, `docs/testing.md` (its counts and the bus row),
     `docs/build-times.md`. Follow how `framing.spec.ts` generates a test per route.
   - Decided: none beyond the issue.
   - Tests: **only after the maintainer says dev's deploy is done**, run the bus spec alone against dev
     before (on `development`) and after (on your branch), and record both in `docs/build-times.md`,
     clock times in US Central. Every failure must also fail on `development`, or be explained.
   - Don't touch: other specs.

3. **#1470 (Low): Make something typecheck the AggieMap smoke suite**
   - Goal: a pull request whose smoke-suite TypeScript does not compile fails CI, and the three known
     strict-mode errors in `map-notice.spec.ts` are fixed.
   - Where: `test/smoke/aggiemap/` (a `tsconfig.json` for the suite if it has none), a cheap step in an
     existing pull-request workflow that runs `tsc --noEmit` on it, and `docs/testing.md`.
   - Decided: none beyond the issue. Keep it to one command; no new workflow file if an existing
     pull-request workflow can carry the step.
   - Tests: the typecheck fails on `development` (show it) and passes on the branch.
   - Don't touch: anything outside `test/smoke/`, the one workflow step, and the docs.

4. **#1476 (Low): Move tsconfigs off the settings TypeScript 6 deprecates**
   - Goal: no tsconfig needs `"ignoreDeprecations": "6.0"`, and it is removed everywhere. Chiefly
     `moduleResolution: node` (node10) goes to `bundler` for the Angular projects; the Nest projects,
     which build with webpack and CommonJS, go to whatever their build accepts.
   - Where: the project tsconfigs, and `tsconfig.base.json`'s `compilerOptions` only.
   - Decided: none beyond the issue.
   - Tests: run as much of `nx run-many -t build` and `-t test` as this container can; say exactly which
     projects you built and which you could not. The desktop session runs the full check.
   - Don't touch: `tsconfig.base.json`'s `paths` (another branch removes CPA's), and any CPA project
     (`apps/cpa-*`, `libs/cpa`), which is being deleted.

**Update, 7 October, late evening:** #1546 (the UI kits made standalone) and #1547 (CPA retired: `apps/cpa-*`,
`libs/cpa`, `ng2-dragula`, CPA's `tsconfig.base.json` paths and `EXCLUDED_PROJECTS` entries) **have merged** into
`development`. Treat CPA as gone: don't check, edit or report on anything CPA, and for #1476 skip CPA's tsconfigs
entirely. Don't merge `development` into your branches; the desktop session does that when it opens each PR.
Everything else below is unchanged.

**Don't touch, for the whole batch:**
- **Branches in flight on the desktop:** `refactor/1543-standalone-ui-kits` (#1546), `refactor/1544-standalone-common` and
  `chore/1458-retire-cpa`.
- **What they and the next ones change:** the `.ts` files under `libs/ui-kits`, `libs/common`, `libs/maps`,
  `libs/aggiemap`, `libs/ts` and `libs/gisday` (standalone conversion, one group at a time), and
  everything CPA (`apps/cpa-*`, `libs/cpa`, `tsconfig.base.json`'s `paths`, `EXCLUDED_PROJECTS`, and
  `ng2-dragula` in `package.json`).
- **The older open pull requests** #381, #562, #691, #697, #898, #925, #928, #977 and #1257.

If an item cannot be done without touching one of these, say so in the report rather than editing it.
