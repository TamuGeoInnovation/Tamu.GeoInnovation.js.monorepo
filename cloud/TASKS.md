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

## No batch yet

There is nothing to do. If you were sent here, say so and stop.
