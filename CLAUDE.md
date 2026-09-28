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

**Prove a regression test fails first.** Run it against the unmodified code and confirm it
fails for the expected reason before applying the fix.

## Pull requests

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
