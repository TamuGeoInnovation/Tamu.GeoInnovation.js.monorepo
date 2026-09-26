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

If you do not have the repository yet, clone it first (Phase 2 below) or paste this file's
URL instead of its path.

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

## Phase 0 - Confirm the machine

```
docker --version
git --version
gh --version
python --version
```

**Expect:** Docker and Git present. `gh` and `python` are used for pull requests and
scripting.

Notes:

- **Node.js on the host is not required and not used.** Every Node command runs inside
  Docker against the checkout. If the machine has Node installed, ignore it - its version is
  irrelevant, and the commands below pin Node 20.18.1.
- On Windows, `python3` may open the Microsoft Store alias. Use `python`.
- If `gh` was installed after this session started, it may not be on `PATH` yet. Ask the
  user to restart the session, or call the executable by its full path.

If Docker or Git is missing, stop and point the user at GETTING_STARTED.md Path 1, steps 2
and 4. Do not try to install them yourself.

## Phase 1 - GitHub access

```
ssh -T git@github.com
```

**Expect:** a greeting naming the user's GitHub account.

If it reports `Permission denied (publickey)`, the user must add their key. Ask them to run
this and paste the result into GitHub, under Settings then SSH keys:

```
clip < ~/.ssh/id_ed25519.pub
```

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

## Phase 2 - Clone

```
git clone git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
```

**Expect:** the clone succeeds and lands on `development`.

**The trunk is `development`, not `master`.** `master` was abandoned in 2022 and is hundreds
of commits stale. Anything branched from it will not merge cleanly.

### Add the user's fork

Everyone on the team, the maintainer included, pushes branches to their own fork and opens pull
requests from it. `origin` (the clone) is only for pulling `development`. Find the user's
GitHub login, then check for their fork:

```
gh api user --jq .login
gh repo view <login>/Tamu.GeoInnovation.js.monorepo --json isFork,parent --jq '"\(.isFork) \(.parent.owner.login)"'
```

**Expect:** `true TamuGeoInnovation`. If the repository does not exist, **ask the user before
creating it**; creating a fork is an account action. With their go-ahead:
`gh repo fork TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo --clone=false`.

Then add it as a second remote:

```
git remote add fork git@github.com:<login>/Tamu.GeoInnovation.js.monorepo.git
git fetch fork
git remote -v
```

**Expect:** `fork` and `origin`, each with fetch and push.

Finally, check the user's access to the main repository:

```
gh api repos/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/collaborators/<login>/permission --jq .permission
```

**Expect:** `write` or `admin`. If it says `read`, tell the user: their pull requests will work,
but every run of the checks will wait for a maintainer to approve it until someone gives them
write access. Do not try to change access yourself.

## Phase 3 - Install dependencies

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

## Phase 4 - Prove the toolchain

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

## Phase 5 - Run the app

```
docker run --rm -d --name aggiemap-dev -m 8g -p 4200:4200 -v "<path>:/w" -w /w node:20.18.1 sh -c "node node_modules/nx/bin/nx.js serve aggiemap-angular --host 0.0.0.0 --port 4200 --poll=2000"
```

**Expect:** compiled in roughly three to four minutes, then the app answers on port 4200.

**`--poll=2000` is required on Windows.** File-change events do not cross the
Windows-to-Linux bind mount. Without it the server compiles once at startup and then never
rebuilds, while still looking healthy. Changes appear to do nothing because they were never
compiled.

Two hostnames, deliberately different:

| URL                     | Behaves as                             | Use for                                      |
| ----------------------- | -------------------------------------- | -------------------------------------------- |
| `http://localhost:4200` | dev, with dev-only sections visible    | normal development                           |
| `http://127.0.0.1:4200` | production, with those sections hidden | checking production gating without deploying |

**The production view is not a perfect production preview.** It hides the dev-only sections
exactly as production does, which is what it is for. But some APIs allow
`http://localhost:4200` as a browser origin and not `http://127.0.0.1:4200` - browsers treat
those as different origins - so a layer served by one of them fails to load and is drawn
with the layer list's error style. That is a CORS allowlist gap, not a fault in the app, and
the same layer is fine on the live site. Check the browser console for a CORS message before
concluding anything, and use `localhost:4200` for everyday work.

Stop it with `docker rm -f aggiemap-dev`.

## Known false alarms

Check this list before reporting any of the following as a problem.

- **The map is blank for 20 to 40 seconds.** Esri takes that long to draw on a first load.
  It is not a failure. Wait before concluding anything.
- **`curl` returns `000` for a `*.tamu.edu` host.** Git Bash ships a CA bundle from 2022
  that lacks the root these hosts now chain to. The host is almost certainly up. Check it in
  a browser instead, and never report it as unreachable on the strength of `curl` alone.
- **A layer drawn with a strikethrough or error style at `127.0.0.1:4200`.** Usually a CORS
  allowlist that includes `localhost` but not `127.0.0.1`, not a broken layer. Confirm in the
  browser console, and check the same layer at `localhost:4200`.
- **Console errors on first load.** Some of them occur on the live site too. Compare against
  production before attributing one to the local setup.
- **Layers returning 404 on a `dev` hostname.** Any hostname containing `dev` reads from the
  development GIS server, which is missing several services that exist on production. This is
  tracked and is not a setup fault. `localhost` does not contain `dev`, so it uses the
  production GIS server and never hits this.

## Before making a first change

- **Trunk is `development`.** Branch from it; branch protection requires a pull request.
- **Push to the fork, never to `origin`.** `git push -u fork <branch>`, then
  `gh pr create --repo TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo --base development --head <login>:<branch>`.
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
