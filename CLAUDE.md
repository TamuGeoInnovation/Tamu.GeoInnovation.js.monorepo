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

Three places, each with one job.

| Where | What belongs there |
| --- | --- |
| This file | The lasting rules: how to build, test, release and open a pull request here. Anything still true next month. |
| [`docs/releases/unreleased.md`](docs/releases/unreleased.md) | Day-to-day state **anyone** picking this up needs: what has merged since the last production release, where it is deployed, what still needs a decision, and work in flight. [`CLAUDE_SETUP.md`](CLAUDE_SETUP.md) sends a new session here first. |
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
Run Nx as `node node_modules/nx/bin/nx.js`, not bare `nx` or `npx nx` — `node_modules/.bin`
may not be populated. CLAUDE_SETUP.md has the full command.

**Build to typecheck, don't rely on tests.** Most libraries have no `build` target, so
`nx build <library>` answers `Cannot find configuration for task` and checks nothing. Build
an app that consumes the library instead — `aggiemap-angular` or `ts-events-angular` for the
map libraries, `gisday-nest` for the GIS Day data API. `nx test` only compiles what the
specs import, and `nx lint` does not typecheck at all.

**Do not pipe `nx` output into `tail`, `head` or `grep`.** The pipeline's exit code hides the
task's, so a task that never ran still looks like a pass. Redirect to a file, capture the
exit code on its own line, then filter the file.

**Do not edit files while a Docker run is in flight.** The bind mount is live, so a run picks
up partial edits and reports on a state that never existed. Kill it and restart.

**Files are LF.** If you edit with a script, write LF endings explicitly. A script that
writes CRLF turns a ten-line change into a thousand-line diff. Compare `git diff --stat`
with `git diff --stat --ignore-all-space`; if they disagree wildly, normalize before
committing.

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

**Reuse before building.** Check `libs/ui-kits/ngx/**` for an existing component, and
`libs/sass/` plus the app's global `styles.scss` for existing classes, before writing any
CSS. There is a shared copy-field component, a shared `.button` with variants, spacing
utilities and a flexbox mixin set. Purpose-built CSS is unwanted.

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
request. Do not wait to be asked.

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

## Things that look broken but are not

- A map canvas blank for 20 to 40 seconds is Esri still drawing.
- `curl` returning `000` for a `*.tamu.edu` host is usually Git Bash's outdated CA bundle,
  not an unreachable host. Check in a browser before reporting it as down.
- Layers returning 404 on a hostname containing `dev` come from the development GIS server
  missing services that exist on production. `localhost` uses the production GIS server.
