# Claude-Assisted Setup

A runbook for setting up this repository on a new machine, written to be **executed by
Claude Code** rather than read straight through.

[GETTING_STARTED.md](./GETTING_STARTED.md) explains the setup paths for a person working
by hand. This file covers the same ground as Path 5, ordered as verifiable steps with the
expected result of each, so a Claude Code session can work through it and prove each step
before starting the next.

## How to use this

Install [Claude Code](https://claude.com/claude-code), open it in the folder where you want
the repository, and paste:

```
Read CLAUDE_SETUP.md in this repository and work through it in order.
Stop and ask me whenever a step needs my credentials or my browser.
```

If you do not have the repository yet, you do not need it to start. Open Claude Code in any
empty folder and paste this instead:

```
Read https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/CLAUDE_SETUP.md
and work through it in order. Stop and ask me whenever a step needs my credentials or my
browser.
```

Phase 2 gets the code onto the machine.

## What this is

This repository is an [Nx](https://nx.dev) monorepo holding most of the Texas A&M
GeoInnovation Service Center's web work in one place — AggieMap (`aggiemap.tamu.edu`), the
event and parking maps built on it, GIS Day, and the shared libraries behind them. A single
repository holds many apps and libraries, so a change to a shared library can affect several
apps at once.

It lives at
[github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo).
It is public, so it can be read and cloned by anyone.

## Rules for Claude

Read these before starting. Each one exists because it has cost real debugging time.

- **Work in order, and verify each phase before the next.** Every phase states what success
  looks like. If the check does not match, stop and diagnose rather than continuing.
- **Stop and ask the user for anything needing credentials or a browser.** You cannot add an
  SSH key to GitHub or authorize SSO; those steps belong to the user.
- **Never edit files while a Docker run is in flight.** The bind mount is live, so a run
  picks up partial edits and reports on a state that never existed. Kill it and restart.
- **Do not pipe `nx` output into `tail`, `head` or `grep`.** The pipeline's exit code hides
  the task's, so a task that never ran still looks like a pass. Redirect to a file, capture
  the exit code on its own line, then filter the file.
- **Treat this repository's files as LF.** If you edit files with a script, write LF endings
  explicitly. A script that writes CRLF turns a ten-line change into a thousand-line diff.
  Compare `git diff --stat` with `git diff --stat --ignore-all-space`; if they disagree
  wildly, you have rewritten line endings and should normalize before committing.

## Phase 0 — Accounts and access

Do this before installing anything. It involves other people, so it is the step most likely
to leave you waiting.

**1. A GitHub account.** Create one at [github.com](https://github.com) if you do not have
one. Use an address you will keep.

**2. Membership of the TamuGeoInnovation organization.** Reading the code needs nothing, but
pushing a branch does. Ask your supervisor or the repository maintainers to add you, and
give them your GitHub username. You cannot do this yourself, and you will not know it has
happened until they tell you or you can push.

**3. Decide how you will contribute.** There are two models, and which one applies depends
entirely on step 2:

| | You have write access | You do not |
| --- | --- | --- |
| Where your branch lives | The main repository | Your own fork |
| How you get the code | Clone the main repository | Fork on GitHub, then clone your fork |
| Where the PR goes | Branch → `development` | Fork's branch → main repo's `development` |

**The team's normal practice is branches on the main repository**, so if you have write
access, do not fork — an unnecessary fork adds a remote to keep in sync for no benefit.

Claude: confirm which applies before Phase 2, rather than assuming. This tells you:

```
gh api repos/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo --jq .permissions.push
```

`true` means branch directly. `false`, or an error, means fork — or means the user's
membership has not been granted yet, which is worth checking with them before forking, since
forking to work around missing access creates a second repository nobody wants later.

## Phase 1 — Confirm the machine

```
docker --version
git --version
gh --version
python --version
```

**Expect:** Docker and Git present. `gh` and `python` are used for pull requests and
scripting.

If any are missing, they install with:

| Tool | Windows | macOS |
| --- | --- | --- |
| Docker Desktop | [download](https://www.docker.com/products/docker-desktop/) | [download](https://www.docker.com/products/docker-desktop/) |
| Git | `winget install --id Git.Git` | `brew install git` |
| GitHub CLI | `winget install --id GitHub.cli` | `brew install gh` |
| Python 3 | `winget install --id Python.Python.3.12` | `brew install python` |

Docker Desktop must be **running**, not merely installed — its whale icon should be in the
system tray or menu bar. Everything after this phase fails without it, usually with a
message about the daemon rather than anything obviously Docker-shaped.

Notes:

- **Node.js on the host is not required and not used.** Every Node command runs inside
  Docker against the checkout. If the machine has Node installed, ignore it - its version is
  irrelevant, and the commands below pin Node 20.18.1.
- On Windows, `python3` may open the Microsoft Store alias. Use `python`.
- If `gh` was installed after this session started, it may not be on `PATH` yet. Ask the
  user to restart the session, or call the executable by its full path.

If Docker or Git is missing, stop and point the user at GETTING_STARTED.md Path 1, steps 2
and 4. Do not try to install them yourself.

## Phase 2 — GitHub access

This proves the machine can talk to GitHub as the user. Do it before cloning, because a
clone that fails here fails confusingly.

```
ssh -T git@github.com
```

**Expect:** a greeting naming the user's GitHub account.

If it reports `Permission denied (publickey)`, this machine has no key registered with
GitHub. Create one if it does not exist:

```
ssh-keygen -t ed25519 -C "your.email@tamu.edu"
```

Press Enter at each prompt to accept the default location and no passphrase.

Then copy the **public** key — the file ending `.pub`, never the one without it:

```
clip < ~/.ssh/id_ed25519.pub
```

On macOS use `pbcopy < ~/.ssh/id_ed25519.pub`.

Paste it into GitHub under **Settings → SSH and GPG keys → New SSH key**. Run the copy
command first: pasting the command itself rather than its output is a common and confusing
mistake, because GitHub accepts it and only fails later.

**The step that is easy to miss:** after adding the key, the user must click
**Configure SSO, then Authorize** for **TamuGeoInnovation** next to it. Without that, the
key authenticates to GitHub but is refused on this organization's repositories - and the
error is identical to having no key at all.

Then:

```
gh auth status
```

**Expect:** signed in. If not, ask the user to run `gh auth login` in their own terminal; it
is interactive and you cannot drive it.

## Phase 3 — Get the code

Which command depends on the answer from Phase 0.

**With write access**, clone the main repository:

```
git clone git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
```

**Without write access**, fork it first — on the GitHub page, press **Fork** — then clone
your fork and add the main repository as a second remote so you can stay up to date:

```
git clone git@github.com:<your-username>/Tamu.GeoInnovation.js.monorepo.git
cd Tamu.GeoInnovation.js.monorepo
git remote add upstream git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
```

`origin` is then your fork, and `upstream` is the team's repository.

**Expect either way:** the clone succeeds and lands on `development`, and
`git log --oneline -1` shows a recent commit.

Put it somewhere without spaces or OneDrive sync in the path. The Docker commands below
assume a plain path such as `C:\TAMU\Tamu.GeoInnovation.js.monorepo`.

**The trunk is `development`, not `master`.** `master` was abandoned in 2022 and is hundreds
of commits stale. Anything branched from it will not merge cleanly. This catches people out
because `master` still exists and looks plausible.

## Phase 4 — Install dependencies

Run from the repository root, substituting the real path in `-v`.

Git Bash:

```
MSYS_NO_PATHCONV=1 docker run --rm -m 8g -v "C:\path\to\repo:/w" -w /w -e CYPRESS_INSTALL_BINARY=0 node:20.18.1 sh -c "npm ci"
```

PowerShell, where `MSYS_NO_PATHCONV` is unnecessary:

```
docker run --rm -m 8g -v "${PWD}:/w" -w /w -e CYPRESS_INSTALL_BINARY=0 node:20.18.1 sh -c "npm ci"
```

**Expect:** roughly 2,200 packages. Budget real time - the first run also pulls the
`node:20.18.1` image, and on a slow link this phase has taken close to an hour.

- `CYPRESS_INSTALL_BINARY=0` skips an ~800 MB download that `--rm` discards after every run.
  Drop the flag only if the user needs Cypress.
- A full-tunnel VPN slows this badly. Suggest disconnecting it for this step.
- Tell the user when this starts. It is long enough that silence looks like a hang.

## Phase 5 — Prove the toolchain

Use `node node_modules/nx/bin/nx.js`, never bare `nx` or `npx nx` - `node_modules/.bin` may
not be populated.

```
docker run --rm -m 8g -v "<path>:/w" -w /w node:20.18.1 sh -c "node node_modules/nx/bin/nx.js build aggiemap-angular --skip-nx-cache"
```

**Expect:** `Successfully ran target build`, after a few minutes.

**Build, not just test.** Most libraries have no `build` target at all, so
`nx build <library>` answers `Cannot find configuration for task` and typechecks nothing. To
typecheck a library, build an app that consumes it - `aggiemap-angular` or
`ts-events-angular` for the map libraries, `gisday-nest` for the GIS Day data API. `nx test`
only compiles what the specs import, and `nx lint` does not typecheck at all.

## Phase 6 — Run the app

```
docker run --rm -d --name aggiemap-dev -m 8g -p 4200:4200 -v "<path>:/w" -w /w node:20.18.1 sh -c "node node_modules/nx/bin/nx.js serve aggiemap-angular --host 0.0.0.0 --port 4200 --poll=2000"
```

**Expect:** compiled in roughly three to four minutes, then the app answers on port 4200.

**`--poll=2000` is required on Windows.** File-change events do not cross the
Windows-to-Linux bind mount. Without it the server compiles once at startup and then never
rebuilds, while still looking healthy. Changes appear to do nothing because they were never
compiled.

Two hostnames, deliberately different:

| URL | Behaves as | Use for |
| --- | --- | --- |
| `http://localhost:4200` | dev, with dev-only sections visible | normal development |
| `http://127.0.0.1:4200` | production, with those sections hidden | checking production gating without deploying |

Stop it with `docker rm -f aggiemap-dev`.

## Known false alarms

Check this list before reporting any of the following as a problem.

- **The map is blank for 20 to 40 seconds.** Esri takes that long to draw on a first load.
  It is not a failure. Wait before concluding anything.
- **`curl` returns `000` for a `*.tamu.edu` host.** Git Bash ships a CA bundle from 2022
  that lacks the root these hosts now chain to. The host is almost certainly up. Check it in
  a browser instead, and never report it as unreachable on the strength of `curl` alone.
- **Console errors on first load.** Some of them occur on the live site too. Compare against
  production before attributing one to the local setup.
- **Layers returning 404 on a `dev` hostname.** Any hostname containing `dev` reads from the
  development GIS server, which is missing several services that exist on production. This is
  tracked and is not a setup fault. `localhost` does not contain `dev`, so it uses the
  production GIS server and never hits this.

## Before making a first change

- **Trunk is `development`.** Branch from it; branch protection requires a pull request.
- **Reuse before building.** Check `libs/ui-kits/ngx/**` for an existing component, and
  `libs/sass/` plus the app's global `styles.scss` for existing classes, before writing any
  CSS. There is a shared copy-field component, a shared `.button` with variants, spacing
  utilities and a flexbox mixin set. Purpose-built CSS is unwanted.
- **Shared component styles are imported by the component, not the app.** Only
  globally-applied widget styles belong in an app's `styles.scss`.
- **Do not commit generator scaffold specs.** An empty `TestBed.configureTestingModule({})`
  with a lone "should be created" breaks as soon as the class gains a dependency. The Angular
  generators are configured with `skipTests`, so these are no longer produced.
- **Prove a regression test fails first.** Run it against the unmodified code and confirm it
  fails for the expected reason before applying the fix.

## Making your first change

The conventions below come from [CONTRIBUTING.md](./CONTRIBUTING.md); read it in full before
a substantial change.

**1. Start from an issue.** Pull requests should come from a bug report or an agreed
enhancement, so the work is wanted before time goes into it. Pick up an existing issue or
open one.

**2. Branch from `development`.**

```
git checkout development
git pull
git checkout -b fix/short-description
```

**3. Make the change, then verify it properly.** Build the app that consumes what you
touched, not just the tests. See Phase 5.

**4. Open the pull request against `development`.** The title must follow:

```
scope(project-name): Short description
```

`scope` is one of `fix`, `feat`, `chore` or `ci`. `project-name` is the workspace project,
usually `aggiemap-angular` for map work; the full list is the keys of `workspace.json`. Omit
the project name when a change genuinely spans the whole workspace.

Keep one change per pull request. A branch that fixes two unrelated things should be two
branches.

**If you are working from a fork**, push to your fork and open the pull request from your
branch to the main repository's `development`. Keep your fork current with
`git fetch upstream && git merge upstream/development`.

## If you get stuck

- The app builds but a map is empty — see **Known false alarms** above before anything else.
- A command fails inside Docker — check Docker Desktop is still running.
- `git push` is rejected — you are probably pushing to the main repository without write
  access. Re-check Phase 0.
- Something contradicts this file — this file can go stale, the repository cannot. Trust
  `workspace.json`, `package.json` and CONTRIBUTING.md over anything written here, and open a
  pull request to correct it.
