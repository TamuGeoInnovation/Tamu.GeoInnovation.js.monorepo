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

## Batch B (prepared 6 October 2026)

Write your report to `cloud/reports/<yyyy-mm-dd>-batch-b.md` on this branch when done (see the header).
Times in the report are US Central, with the zone named.

1. **#1458 (Low): Retire the CPA projects, and remove ng2-dragula with them**
   - Goal: no CPA code left in the workspace; nothing else changes. The tag `cpa-last` (on `279853c1`,
     CPA at Angular 22) is already pushed, so CPA can be restored from there.
   - Where: `apps/cpa-angular`, `apps/cpa-angular-e2e`, `apps/cpa-nest`, `libs/cpa/**` (common, data-api,
     ngx, sass); their paths in `tsconfig.base.json`; their names in `EXCLUDED_PROJECTS` in
     `.github/workflows/*.yml`; `ng2-dragula`, `dragula`, `@types/dragula` and the `ng2-dragula` entry in
     `overrides` in `package.json`; `package-lock.json` resynced with
     `npm install --package-lock-only --ignore-scripts`. Search the whole repo for `cpa` afterwards
     (docs, scripts, Azure notes) and update or remove each mention, saying which in the report.
   - Decided: retire after Angular 22 (done); restore from `cpa-last` if ever needed. Before deleting,
     confirm nothing outside CPA imports `@tamu-gisc/cpa/*` (on `279853c1` nothing did).
   - Tests: `npx nx show projects` lists no `cpa-*` project, and the project graph loads; a clean
     `npm ci` from only `package.json` and the lock passes; lint, test and build of the projects that
     imported nothing from CPA are unaffected (the desktop session runs the full check).
   - Don't touch: anything not CPA.

2. **#1457 (Low): Find the unused projects, libraries and dependencies — a report, no deletions**
   - Goal: a list the maintainer can decide from. For each candidate: what it is, its last real commit,
     who imports it (from `nx graph --file=graph.json` and a search), whether a workflow or
     `azure-pipelines`-style file builds or deploys it, and a recommendation (delete / keep, why).
   - Where: start from the projects in `EXCLUDED_PROJECTS` in `.github/workflows/build.yml` (CPA aside,
     covered by item 1), then libraries no deployed app imports, then `package.json` dependencies used
     only by those.
   - Decided: nothing is deleted in this batch. Whether a project is deployed can only be confirmed from
     Azure DevOps and the servers, which the desktop session checks; mark each candidate "deployment
     unknown" unless the repository itself shows it.
   - Tests: none; the report is the result. Commit only the report.
   - Don't touch: no branch for this item.

**Don't touch, for the whole batch:** there are no open pull requests. Leave everything outside item 1's
files alone.
