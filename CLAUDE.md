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

Titles follow `scope(project-name): Short description`, where scope is `fix`, `feat`,
`chore` or `ci`. One change per pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Things that look broken but are not

- A map canvas blank for 20 to 40 seconds is Esri still drawing.
- `curl` returning `000` for a `*.tamu.edu` host is usually Git Bash's outdated CA bundle,
  not an unreachable host. Check in a browser before reporting it as down.
- Layers returning 404 on a hostname containing `dev` come from the development GIS server
  missing services that exist on production. `localhost` uses the production GIS server.
