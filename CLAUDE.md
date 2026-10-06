# CLAUDE.md

Guidance for Claude Code working in this repository. This file is loaded automatically at
the start of a session.

## Setting up this repository

If the user asks you to set this up, install it, get it running, or anything similar:
**follow [CLAUDE_SETUP.md](CLAUDE_SETUP.md) and work through its phases in order.**

Do not follow the devcontainer or nvm paths in [GETTING_STARTED.md](GETTING_STARTED.md)
unless the user specifically asks for one. That guide is written for a person choosing a
setup by hand, and its "Recommended" label refers to the devcontainer path, which is not how
this repository is normally set up with Claude Code. CLAUDE_SETUP.md covers the same ground
as its Path 5, ordered as verifiable steps with an expected result after each one.

## What this repository is

An [Nx](https://nx.dev) monorepo holding the Texas A&M GeoInnovation Service Center's web
work: AggieMap (`aggiemap.tamu.edu`), the event and parking maps built on it, GIS Day, and
the shared libraries behind them. A change to a shared library can affect several apps.

## Where things are written down

Five places, each with one job.

| Where | What belongs there |
| --- | --- |
| This file | The lasting rules: how to build, test, release and open a pull request here. Anything still true next month. |
| [`docs/testing-maps.md`](docs/testing-maps.md) | Which signal to wait for when a test needs a map to be finished, and why `ready` is not the one for a screenshot. |
| [`docs/build-times.md`](docs/build-times.md) | How long runs take, recorded as they happen, so a change meant to speed the work up can be shown to have done it. Measurements, not rules. |
| [`docs/releases/unreleased.md`](docs/releases/unreleased.md) | Day-to-day state **anyone** picking this up needs: what has merged since the last production release, where it is deployed, what still needs a decision, and work in flight. [`CLAUDE_SETUP.md`](CLAUDE_SETUP.md) sends a new session here first. |
| The `cloud-mailbox` branch | The cloud session's current batch (`cloud/TASKS.md`) and its reports (`cloud/reports/`). Written by the desktop and cloud sessions; never merged. See [The cloud session](#the-cloud-session). |
| The maintainer's handoff page | One person's own cross-machine notes, so he can stop on one machine and resume on another. Private, not linked from this repository, reached by pasting a pickup prompt. |

**The handoff page is for one person, so it cannot be where anything else lives.** If a fact matters to
anybody but him — a decision, a gotcha, something in flight, a number someone might check — it goes in
this file, in `unreleased.md`, or in a GitHub issue *as well*. A page only one person can open looks
like a record and is not one.

That also means the work-in-flight section of `unreleased.md` stays complete on its own. It is not a
summary of the handoff page, and a reader who cannot open that page must not be missing anything.

Claude's auto memory is currently on here, so some state also lives in a per-machine folder that no
other machine sees and that is not in git. Whether to turn it off, as the C# repository did, is #1156.

## Things that are easy to get wrong

**The trunk is `development`, not `master`.** `master` was abandoned in 2022 and is hundreds
of commits stale. Branch from `development` and target it in pull requests.

**Node runs in Docker, not on the host.** Machines here generally have no usable host Node.
Run Nx as `node node_modules/nx/dist/bin/nx.js`, not bare `nx` or `npx nx` — `node_modules/.bin`
may not be populated. CLAUDE_SETUP.md has the full command.

**Build to typecheck, don't rely on tests.** Most libraries have no `build` target, so
`nx build <library>` answers `Cannot find configuration for task` and checks nothing. `nx test` only
compiles what the specs import, and `nx lint` does not typecheck at all.

**Commit, then run this before every push, and read its exit code** (a bug fix may run less; see
[Fixing a bug quickly](#fixing-a-bug-quickly)):

```bash
scripts/check-in-volume.sh <branch>
```

From Git Bash, in the main checkout or any worktree. It runs `nx affected -t lint,test,build` against
`origin/development` in a Linux clone of the branch kept in a Docker volume (`tamu-js-<issue>`), skips
the projects CI excludes (read from `.github/workflows/build.yml`), writes a log, and exits with the
check's exit code. **It checks only what is committed**; uncommitted edits are not seen. `all` in place
of `affected` checks every project. Run `git fetch origin` first if `origin/development` is old.

**Not one app you picked — every affected app.** Building only the app you were working in is what the
advice used to say, and it is not enough: a change to a shared library can break an application you
have never opened. On 30 September a 969-byte growth in the notification component's stylesheet pushed
`correction-lite-angular` past its 1 MB bundle budget. `aggiemap-angular` built fine. The failure was
found by CI, twice, because lint and unit tests had been run and a build had not.

Budgets are part of the build, so a purely additive change can fail it without a line of bad code.

**Do not pipe `nx` output into `tail`, `head` or `grep`.** The pipeline's exit code hides the
task's, so a task that never ran still looks like a pass. Redirect to a file, capture the
exit code on its own line, then filter the file.

**Do not edit files while the dev server is compiling them.** Its source is bind-mounted live, so a
build picks up partial edits and reports on a state that never existed. Checks are unaffected: they run
on a fetched commit, so editing while one runs is safe.

**Why checks run in a volume.** With the source and `node_modules` bind-mounted from Windows, every
file read crosses the Windows-to-Linux boundary. Measured on a quiet machine on 4 October (#1402):

| Task | Bind-mounted | `node_modules` in a volume | Whole clone in a volume |
| --- | --- | --- | --- |
| `test maps-esri` | 80-180 s | 113 s | 15 s |
| `lint ts-events-ngx` | 54-59 s | 18 s | 5 s |
| `build mailroom-angular` | 95-162 s | 19 s | 29 s |
| 4 projects' tests, `--parallel=8` | 199 s | - | 24 s |
| `npm ci` | 43 min (under load) | 105 s | 116 s |

On its first real use, a full affected check ran 131 tasks in its first four minutes, against about 42
an hour before. The script keeps the Nx cache in the volume, so an unchanged task replays in about a second, and runs
with `-m 16g` and `--parallel=8` (peak memory measured: 10.4 GB). Do not add `--skip-nx-cache`.

**Record how long it took, in [`docs/build-times.md`](docs/build-times.md).** Every check, build,
install or deploy, whatever its length: the date, the machine, what ran, the approach and the
elapsed time. The scripts already print the elapsed time, so the measurement costs nothing; what
costs something is wanting a number later that was only ever on screen.

Record the run you are not trying to make faster, too. A single duration proves nothing on its own —
the same run measured before and after a change is what shows whether the work paid off, and the
"before" cannot be taken afterwards. The volume migration is provably 5 to 12 times faster only
because someone measured the slow way first. See #1415.

**Times are US Central, and `TZ=America/Chicago` will lie to you.** Every clock time reported to the
maintainer, and every timestamp written into an issue, a pull request, release notes or
`docs/build-times.md`, is US Central with the zone named — not UTC, and not whatever a container's
clock says. Elapsed durations are just durations and need no zone.

Git Bash on these machines has no tz database, so `TZ=America/Chicago date` **silently returns UTC
and labels it `GMT`**. It gives a wrong answer that looks like a right one, with nothing to warn you.
Convert with PowerShell, which has Windows' own timezone data and applies daylight saving itself, so
the same call is right in CDT and CST:

```powershell
[System.TimeZoneInfo]::ConvertTimeFromUtc(
  [DateTime]::UtcNow,
  [System.TimeZoneInfo]::FindSystemTimeZoneById('Central Standard Time'))
```

The id stays `Central Standard Time` all year; Windows handles the summer change. Playwright
containers run in UTC for the same reason, which is why a capture shows the wrong time unless
`timezoneId: 'America/Chicago'` is passed to `newPage`. See #1423.

**After a dependency change, prove the lock file with a clean `npm ci` before pushing.** CI installs
with `npm ci`, which installs only what `package-lock.json` records and refuses when it disagrees
with `package.json`. A local `npm install` quietly adds what is missing to `node_modules` without
writing it to the lock, so every local check passes and CI fails before running anything. #1345 did
exactly that: a full local verify passed, then four checks failed on `Missing: @types/dragula from
lock file`, a peer of the upgraded `ng2-dragula`. Sync the lock with
`npm install --package-lock-only --ignore-scripts` and commit it. `scripts/check-in-volume.sh` then
proves it: whenever the committed `package.json` or `package-lock.json` changes, it runs `npm ci` from
those files alone, as CI does. See #1347.

**Files are LF, and `.gitattributes` will not fix a mistake for you.** It sets `* -text`, which
turns git's end-of-line normalization off for every file: git stores the bytes it is given, and
`core.autocrlf` has no effect however a machine is configured. Endings are per-file and permanent
until someone changes them deliberately.

Every text file is LF except `libs/assets/batch/startup.bat`, which stays CRLF because Windows
batch files can mishandle `goto` and labels with LF endings.

So if you edit with a script, write LF explicitly. A script that writes CRLF turns a ten-line
change into a thousand-line diff and the real change becomes impossible to review. Check before
committing by comparing `git diff --stat` with `git diff --stat --ignore-all-space`; if they
disagree wildly you have rewritten endings, and should normalize before going further. The counts
are `git ls-files --eol | awk '{print $1}' | sort | uniq -c`.

## Fixing a bug quickly

A bug the team finds should go from cause found to pull request in about fifteen minutes. On 4 October
a one-line fix (#1379) was forecast at 45, and none of that was the fix: a dev server started from
cold, twice, on a stale install; two upgrades sharing the machine; and a full affected build that CI
then ran again. These rules hold on every machine (#1381).

**Keep a dev server's install current, and the dev server running.** The dev server (`aggiemap-dev`)
bind-mounts the source, so edits on Windows reach it, but its `node_modules` lives in the Docker volume
`tamu-js-dev-nm`, installed inside the container. Install it once, and again whenever
`package-lock.json` changes:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -m 16g -v "C:/TAMU/wt-<n>:/w" -v tamu-js-dev-nm:/w/node_modules -w /w -e CYPRESS_INSTALL_BINARY=0 node:22.23.3 npm ci --no-audit --no-fund
MSYS_NO_PATHCONV=1 docker run -d --name aggiemap-dev -m 8g -p 4200:4200 -v "C:/TAMU/wt-<n>:/w" -v tamu-js-dev-nm:/w/node_modules -w /w -e NX_DAEMON=false node:22.23.3 sh -c "node node_modules/nx/dist/bin/nx.js serve aggiemap-angular --host 0.0.0.0 --port 4200 --poll=2000"
```

One volume serves whichever checkout is mounted, so it must match that checkout's lock. Check before
trusting it: `node_modules/@angular/core/package.json` must show the version the checkout uses. On 4
October an install two upgrades behind made Nx fail with a misleading error. The dev server recompiles
on save, so after the first compile, a fix reaches the browser in under a minute.

**Do not set `NX_NO_CLOUD=true`.** With Nx 19 and an `nxCloudId` in `nx.json`, every command fails
with `Could not find any runner configurations in nx.json`.

**A bug fix pre-empts upgrades.** Long-running upgrade or verification containers are paused while a
bug fix runs, and resumed when its pull request is open:

```bash
docker pause <container>...
docker unpause <container>...
```

A paused container loses nothing; it only stops competing for the CPU.

**The pre-push check for a bug fix covers only the projects it edits:**

```bash
scripts/check-in-volume.sh <branch> <each project the fix edits>,<the app the bug is in>
```

The comma-separated list runs `lint,test,build` on those projects only (a library without a `build`
target just skips it), in the same volume as the full check. Not `affected`: a fix in a shared library
makes nearly everything affected. #1379 edited `libs/maps/esri`, and `affected -t lint,test` meant 52
projects and over 25 minutes; the two projects it edited took about 5.

CI runs the full `affected -t lint,test,build` on every pull request anyway, so running it locally as
well doubled the wait without adding a check. What CI alone catches - another app's bundle budget, as
on 30 September - is caught before merging, while the run is watched. Anything that is not a bug fix
(an upgrade, a dependency change, a shared-library refactor) still runs the full check before pushing.

**Owners and maintainers open pull requests ready for review. Everyone else opens a draft** and marks
it ready once CI is green. The draft exists so nobody is asked to look at a contribution that has not
passed yet; a maintainer opening their own pull request is already the person watching the run and
merging it, so it only makes the list harder to read - eight in one batch on 6 October all showed as
works in progress and each had to be converted by hand (#1494).

Opening ready costs no extra build, and a draft buys none: converting a draft does not re-run
anything, because no workflow lists `ready_for_review` in its `types:` and `main.yml` runs on
`[opened, synchronize, reopened]`.

The rest is unchanged: the issue first, a regression test proven red against the unfixed code, then
green, before and after screenshots, and a row in the release notes.

## Checking a deployed environment

Nothing in the pull request checks notices when a map breaks *without* a release — the maps draw from
hosted GIS services, so a layer can stop working with no commit and no build. Two tools cover that,
each with its own README:

- **[`test/smoke/aggiemap`](test/smoke/aggiemap/README.md)** loads every map in a deployed
  environment and verifies each layer resolves and returns data. Runs daily against dev and
  production, and on demand.
- **[`tools/builder-inventory`](tools/builder-inventory/README.md)** covers the eleven maps that
  cannot be reached by URL, because they require choices in a builder first. It records where every
  combination lands, including a shareable link that reaches each destination directly.

Both need the map probe (`window.__tamuGiscMapProbe`) in the deployed build. If layer data comes back
empty, the environment is running something older.

[`docs/testing.md`](docs/testing.md) describes all of the testing for readers outside the team, with
dated counts; a check fails if a smoke spec is missing from it.

### What "run the tests" means

Map the request to one of these. Only the environment named decides which; if none is named and it
is unclear, ask.

| The user says | Run |
| --- | --- |
| "run the test suite on dev", "smoke test dev" | `test/smoke/aggiemap/run-local.sh development`, from this machine |
| "... on prod", "... on production" | `test/smoke/aggiemap/run-local.sh production` |
| "... on both" | Both of the above, one after the other |
| "... locally", "... against my dev server" | `test/smoke/aggiemap/run-local.sh local`, with the dev server running in the `aggiemap-dev` container |
| "... locally as production", "check the production gating" | `test/smoke/aggiemap/run-local.sh local-production`: the same dev server at `127.0.0.1`, which is not a dev host, so development-only features are hidden as on production |
| "... on GitHub", "run the smoke workflow" | `gh workflow run aggiemap-smoke.yml -f environment=development` (or `production`, `both`), then `gh run watch` |
| "run the tests", "run the unit tests" (no environment) | `nx test` for the affected projects, in Docker as in CLAUDE_SETUP.md |

**Local runs are the default.** `run-local.sh` runs the suite in the Playwright container on this
machine with the same settings as the scheduled workflow, because both read
`test/smoke/aggiemap/environments.json`: each environment's address, expected Google Analytics id and
the layers it is allowed to fail (the dev GIS server does not serve several). Change expectations
there, never in a hand-written `docker run`. The first local run downloads the Playwright image,
about 2 GB.

Report per environment what failed and why, not only pass or fail. Only a GitHub run opens or closes a
health issue; a failing workflow run opens one per environment, manual runs included, and it closes
itself when a later run passes. Say so when reporting a failure, so nobody opens a duplicate.

## Before changing code

**Nothing without a production service is visible on production unless explicitly allowed.** A
layer, basemap or service published only on dev is gated with `TestingService` (`isTesting`), as bus
routes and the vector tile basemap are. Add it to `DEVELOPMENT_ONLY_SERVICES` in
`test/smoke/aggiemap/development-only.ts`, with the pages that request it, so the smoke suite fails
if production ever requests it.
The maintainer decides when it moves to production. See #1229.

**Reuse before building; build to be reused.** No one-offs: not components, not services, not
utilities, not styles, not test helpers. This is the maintainer's standing rule for every change, by
anyone.

- **Look first, and say where you looked.** Components: `libs/ui-kits/ngx/**`. Services, pipes and
  helpers: `libs/common/**`. Map features: `libs/maps/feature/**`. Styles: `libs/sass/` and the app's
  global `styles.scss`. Smoke-suite helpers: the shared modules in `test/smoke/aggiemap/`. There is a
  shared copy-field component, a shared `.button` with variants, spacing utilities and a flexbox
  mixin set. Purpose-built CSS is unwanted.
- **Extend what exists rather than copy it.** If a shared piece nearly fits, add the input, option
  or variant it lacks. A second near-identical component is a future bug fixed in one copy only.
- **Change a shared piece behind its existing interface** where you can, so its callers do not have to
  change. #1220 replaced the date-time picker's internals and left every caller as it was.
- **When nothing exists, put the new piece where the next caller will find it**, in the shared
  library for its kind and exported from its index, not inside the feature that first needed it.
- **Follow the patterns already in the repository**: how definitions declare things (for example,
  the per-choice `mapView` used by the event maps), how modules are wired, how tests are written.
  A new way of doing something the repository already does needs a reason in the pull request.

**Shared component styles are imported by the component, not the app.** Only
globally-applied widget styles belong in an app's `styles.scss`.

**Do not commit generator scaffold specs.** An empty `TestBed.configureTestingModule({})`
with a lone "should be created" breaks as soon as the class gains a dependency. The Angular
generators are configured with `skipTests`.

**Every bug gets a test.** Nothing else here requires one, so a bug could be fixed, and every rule
followed, with nothing to stop it coming back.

- **When a bug is filed**, an automated check catches it by then. If it cannot be fixed yet, the check
  still runs and lists it as a known failure tied to the issue (`allowedServiceFailures`,
  `allowedSearchSourceFailures` and the like in `test/smoke/aggiemap/environments.json`), so it stays
  visible and its fix is noticed.
- **When it is fixed**, the pull request includes the test that failed on the unfixed code, and
  removes its known-failure entry where the fix now runs. If a bug genuinely cannot be tested
  automatically, the pull request says why.

**Prove a regression test fails first.** Run it against the unmodified code and confirm it
fails for the expected reason before applying the fix.

**A check must ask what the app actually does.** "Does the service answer?" passed a query asking for
renamed fields (#1166) and, on dev, a bike racks address that pointed at bike lanes (#1122). Check the
layer is the right one, has the fields the app uses, and answers the app's own query. See #1167.

## Release notes

**A pull request with a user-visible result adds its own entry to `docs/releases/unreleased.md`, in
the same pull request**, with its before/after screenshots linked from `docs/screenshots/<slug>/`
(`../screenshots/<slug>/<file>.png` from the notes). Never write the notes afterwards in a separate
pull request: on 28 September that left the notes without images when the pull request merged, and
meant going back for them after the release reached production (#1132).

**It also adds a row to the *What to test on dev* table in `unreleased.md`**: a dev link and what to
look for. The team works from that table before a release goes to production, so a visible change
without a row is one nobody is asked to check. If it cannot be checked on dev, say so in the row and
why. At release the rows move into the dated notes (#1360).

**The release notes merge before production, not after.** They describe what a release contains and
what cleared it; they do not assert that it is deployed. The `prod-*` tag records that, which is a
fact rather than a claim someone has to remember to make true. Writing them after the deploy left the
file most likely to be shared outside the team wrong until someone got to it (#1094, #1132, #1144).

**The order is one sequence, in [docs/releases/README.md](docs/releases/README.md):** build and deploy
to dev, run the full suite, tag dev only if it passed, merge the notes, deploy production, tag
production, check production. Follow it rather than reconstructing it; it was written after doing it
by hand and getting the order wrong.

**Tag the commit each build comes from.** `scripts/tag-build.sh dev` when a build reaches dev,
`scripts/tag-build.sh prod` when it is promoted, then `git push origin <tag>`. One build serves both
environments, so the same commit carries both tags. `prod` refuses a commit with no `dev-*` tag,
which is what makes "we shipped what we tested" a fact rather than an assumption. Tags go to
`origin`. See #1145.

**Link every issue and pull request, with full URLs, and end each release file with a table of all
of them.** GitHub only auto-links `#1122` inside issue and pull request comments — in a file under
`docs/releases/` it is inert text, so a bare number leads nowhere for the reader these notes exist
for. `2026-09-28-2.md` named eleven and linked none (#1139).

The prose says what changed and why; the closing **What went into this release** table says what the
release carried. The second question is the one asked months later, when tracing when a behaviour
arrived or reporting what the work produced.

The full checklist is in [docs/releases/README.md](docs/releases/README.md#cutting-a-release). See
#1094 and #1132.

## Pull requests

**Open an issue first, then the pull request, and link them.** Every change — bug fix, docs, CI, a
one-line change. Put `Closes #<issue>` in the pull request body. A CI check enforces this.

Work on this project is reported to keep it funded, and that reporting is built from issues. A pull
request with no issue behind it does not appear in the record, so the work effectively disappears
however good it was. See #1056.

File the issue as soon as the work is identified, including work noticed while doing something else —
that is the case most likely to be skipped.

**Fill in every field on the issue and the pull request, not only the title and body.** A field left
empty drops the work out of the project board and the funding record just as surely as a missing
issue does. Where a value is not known and not covered below, **ask the user before filing**; never
leave a field empty silently. Say in your reply which values you chose. See #1112.

| Issue field | Value |
| --- | --- |
| Assignee | `danielgoldbergtamu`, unless the user names someone else |
| Type | Choose: **Bug** (worked, now broken or wrong), **Feature** (new capability), **Task** (docs, CI, tests, cleanup, investigation) |
| Labels | Matching existing labels, e.g. `bug`, `documentation` |
| Priority (organization issue field) | **Ask the user every time**: Urgent, High, Medium or Low |
| Project | AggieMap work: **Texas A&M Aggiemap**. GIS Day work: **GIS Day Angular + NestJS**. Repo-wide process, docs or CI: **both**. If unclear, ask |
| Project Status | **Todo** when filed; **In Progress** when work starts |

| Pull request field | Value |
| --- | --- |
| Development | `Closes #<issue>` in the body |
| Assignee | `danielgoldbergtamu` |
| Labels | Copy the linked issue's labels |
| Project | The same project(s) as the issue, Status **Pending Approval** (GIS Day Angular + NestJS has no such status; use **In Progress** there) |
| Reviewers | None: pull requests are opened under the maintainer's account, and he is the only one who can merge |

Both projects' built-in workflows move an item to **Done** when it is closed or its pull request is
merged, so nothing needs updating after the merge.

**Only the issue being fixed may follow a closing keyword.** GitHub treats `close`, `closes`, `fix`,
`fixes`, `resolve` and `resolves` followed by `#N` *anywhere* in the body as "close #N on merge", so a
sentence like "the next smoke run should close #1096" would close #1096 too. Reword such sentences,
then check with `gh pr view <n> --json closingIssuesReferences`.

**That check is not reliable straight after `gh pr create`.** GitHub populates the closing reference
asynchronously, so for the first several minutes it comes back empty on a pull request whose body is
perfectly correct. An empty result means "not linked *yet*", not "not linked". Re-check a few minutes
later before concluding anything, and never close the issue by hand on the strength of one early
reading - three pull requests in one afternoon were each declared broken and each linked itself
shortly after.

`gh issue create` sets title, body, labels and assignee. The rest needs these, run after creating:

```bash
R=TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo
# Type: look up the id of Bug, Feature or Task, then set it
gh api graphql -f query='query{repository(owner:"TamuGeoInnovation",name:"Tamu.GeoInnovation.js.monorepo"){issue(number:<n>){id} issueTypes(first:10){nodes{id name}}}}'
gh api graphql -f query='mutation($i:ID!,$t:ID!){updateIssue(input:{id:$i,issueTypeId:$t}){issue{number}}}' -f i=<issue id> -f t=<type id>
# Priority: look up the field and option ids, then set it
gh api graphql -f query='{organization(login:"TamuGeoInnovation"){issueFields(first:10){nodes{... on IssueFieldSingleSelect{id name options{id name}}}}}}'
gh api graphql -f query='mutation($i:ID!,$f:ID!,$o:ID!){setIssueFieldValue(input:{issueId:$i,issueFields:[{fieldId:$f,singleSelectOptionId:$o}]}){clientMutationId}}' -f i=<issue id> -f f=<field id> -f o=<option id>
# Project and Status (project 2 = Texas A&M Aggiemap, 3 = GIS Day Angular + NestJS)
item=$(gh project item-add <project> --owner TamuGeoInnovation --url <issue or PR url> --format json --jq .id)
gh project field-list <project> --owner TamuGeoInnovation --format json   # Status field id and option ids
gh project item-edit --id "$item" --project-id <project node id> --field-id <status field id> --single-select-option-id <option id>
```

`gh project view <n> --owner TamuGeoInnovation --format json --jq .id` gives the project node id.

**Anything with a visible result carries before/after screenshots**, in the issue and the pull
request. Do not wait to be asked. A CI check enforces this; the escape hatch is the
`no-visible-change` label, which is a deliberate act and stays visible afterwards.

**Build the pull request body from [`.github/pull_request_template.md`](.github/pull_request_template.md),
with every section filled in.** `gh pr create --body-file` *replaces* the template rather than
pre-filling it, so the checklist is never rendered and nothing notices it is gone - which is exactly
how four pull requests went out in one session with no images, past a template that had asked for
them all along. Writing the body to a file is fine; writing it to a file **that was started from the
template** is the rule. See #1258.

This is not only documentation. The duplicated 150th Anniversary tile (#1055) was found *because*
before/after images were being captured: a duplicated block reads as correct in a diff, since each
copy is individually right, and is obvious the moment you look at the page.

`gh` cannot upload to GitHub's image CDN, so commit screenshots to the repository and link them by
raw URL — this repository is public, so they render and do not rot. The release notes link the same
files by relative path, so one capture serves the issue, the pull request and the notes.

**Pin image links to a commit, not a branch name and not `development`.**
`https://raw.githubusercontent.com/<owner>/<repo>/<full-sha>/<path>` renders during review and cannot
rot. A branch name 404s once the branch is deleted — which is what happened to the screenshot in
#1075 when #1076 merged — and a `development` link 404s until the change merges, which is exactly the
window where a reviewer needs to see it. Check the link resolves before posting:

```bash
curl -s -o /dev/null -w "%{http_code}" "<raw url>"
```

**Write every capture to `docs/screenshots/<slug>/` as soon as it is taken, not when it is needed.**
A "before" image stops being obtainable the moment the fix is on disk: recovering one means stashing
the change, waiting for a rebuild, re-capturing, then restoring — ten minutes to get back something
that was already on screen. Save it while the state exists, even if it may never be used. The same
goes for measurements taken alongside a capture; put the numbers in the commit message or the issue
rather than only in a terminal that scrolls away.


**Work from a fork. Never push branches to `TamuGeoInnovation`.** Everyone on the team, the
maintainer included, pushes branches to their own fork and opens pull requests from
`<user>:<branch>` into `TamuGeoInnovation:development`. Keep two remotes: `origin` is the main
repository, used only to pull `development`; `fork` is the user's fork, where branches are
pushed. If a checkout has no `fork` remote, ask which fork to use before pushing anything.

The one exception is the cloud session's: `cloud-mailbox` and `cloud/<issue>-<topic>` branches live
on `TamuGeoInnovation`, because that is where the cloud session pushes. Their pull requests still go
through a fork, opened by the desktop session (see [The cloud session](#the-cloud-session)).

```
git remote add fork git@github.com:<user>/Tamu.GeoInnovation.js.monorepo.git
git switch -c <branch> origin/development
git push -u fork <branch>
gh pr create --repo TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo --base development --head <user>:<branch>
```

Pull request checks run without approval only for people with write access to the main
repository. For anyone with read access, even a team member, GitHub holds every run under
"workflow awaiting approval" until a maintainer approves it. Team members should have write
access.

Titles follow `scope(project-name): Short description`, where scope is `fix`, `feat`,
`chore` or `ci`. One change per pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## The cloud session

A cloud Claude session sometimes works on issues the desktop session hands it. The desktop session is
in charge: it has Docker, the local run, the servers and GitHub's GraphQL API, and it builds and checks
everything, opens the pull requests and asks the maintainer. The two sessions never talk directly; they
exchange files on the `cloud-mailbox` branch, and the maintainer relays two short phrases.

Start line, pasted into the cloud session by the maintainer:

```
Pull TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, check out the cloud-mailbox branch, and do what cloud/TASKS.md says.
```

The rules for the cloud session:

- **Do only the issues listed in the task file, then report and stop.** Don't ask whether to do more,
  and don't offer or start other work. The desktop session decides what's next.
- **The task file and reports live on the `cloud-mailbox` branch** (`cloud/TASKS.md`,
  `cloud/reports/<yyyy-mm-dd>-batch-<letter>.md`). Commit only your report there, directly. Never merge
  `cloud-mailbox` into anything, or anything into it.
- **This repo is public.** No customer names, keys, server names or internal addresses in issues,
  commits, branches or reports. If something sensitive comes up, the report says only "a question for
  Dan; ask the desktop session".
- **File what you find, right away.** A bug, follow-up or to-do found while working becomes a GitHub
  issue the moment it comes up, with the assignee, type and labels this file's issue rules give. List
  the numbers in your report with a suggested priority. The desktop session then sets Priority (asking
  the maintainer) and the project Status, which need the GraphQL API the cloud can't use.
- **Nothing else on GitHub:** no comments, PRs or merges.
- **Branches:** one per issue, `cloud/<issue>-<topic>` from the latest `development`, pushed to this
  repository, with a `.pr-body.md` draft as the last commit. Don't merge `development` into it; the
  desktop session does that when it opens the PR.
- **Commit messages:** no `Claude-Session:` line or other link to the session; end with the
  `Co-Authored-By` line only. The desktop session strips any that slip through before opening a PR.
- **Say "branch ready: <names>" when done.** The desktop session builds and tests each branch the way
  CI does, checks it locally, and opens the PRs.

What the desktop session does when the cloud has finished:

1. Pull `cloud-mailbox` and read the report. Its questions go to the maintainer, renumbered.
2. Ask the maintainer the Priority of each cloud-filed issue, then set every field and the project
   Status as [Pull requests](#pull-requests) says.
3. For each cloud branch, in its own worktree: make a branch on the fork at the cloud branch's code
   commits, without the `.pr-body.md` commit (its text drafts the PR body); strip any
   `Claude-Session:` lines; merge the latest `development`; run `scripts/check-in-volume.sh`; check it in
   the local run against plain `development`, turning every check into a test.
4. Open each PR as this file says, with the real check results, and set the issue to In Progress.
5. Before a batch is merged, check all of its PRs merged together: two PRs can each pass CI and still
   fail together.
6. After the merges, delete the merged `cloud/` branches, then write the next batch into
   `cloud/TASKS.md` (the header stays; only the batch changes) and give the maintainer the start line.

A good batch is work that can be done and proven without the local run or the servers: code, unit
tests, deletions, investigations that end in a report, and smoke runs against a deployed environment.
Every open PR's branch goes under the batch's "Don't touch", so the cloud does not build on code that
is about to change.

## Things that look broken but are not

- A map canvas blank for 20 to 40 seconds is Esri still drawing.
- `curl` returning `000` for a `*.tamu.edu` host is usually Git Bash's outdated CA bundle,
  not an unreachable host. Check in a browser before reporting it as down.
- Layers returning 404 on a hostname containing `dev` come from the development GIS server
  missing services that exist on production. `localhost` uses the production GIS server.
