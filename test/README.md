# Tests

This is the engineering view: where each suite lives, how to run it, and which workflow runs it. For
the plain-language account of what this project tests and why, with current counts, see
[docs/testing.md](../docs/testing.md). Point people there, not here.

## Layout

```
test/e2e/gisday/     Playwright, run against a GIS Day dev server this repo starts. Gates PRs.
test/smoke/gisday/   Playwright, run against the DEPLOYED txgisday.org. Does not gate PRs.
test/smoke/aggiemap/ Playwright, run against DEPLOYED AggieMap, dev and production. Does not gate PRs.
test/visual/         Playwright screenshot comparison against committed baselines. Run by hand.
test/*.ts, *.js      Shared Jest setup files. Unrelated to the above.
```

Each Playwright suite has its own config at the repository root: `playwright.config.ts` (GIS Day
e2e), `playwright.smoke.config.ts` (GIS Day smoke), `playwright.aggiemap-smoke.config.ts` and
`playwright.visual.config.ts`.

Unit tests live next to the code as `*.spec.ts` and are run by Jest through Nx: about 175 spec files
across `apps/` and `libs/`. Playwright specs live here and are invisible to Jest, because the root
`jest.config.ts` uses `getJestProjects()` and only picks up registered Nx projects.

`apps/aggiemap-angular-e2e` holds 9 older Cypress specs. Nothing runs them: CI excludes the project,
and the AggieMap smoke suite covers the same ground against deployed environments.

## Running locally

Unit tests run through Nx in Docker; [CLAUDE_SETUP.md](../CLAUDE_SETUP.md) has the command.

AggieMap smoke suite, in the Playwright container with the same settings as the scheduled workflow
(see [its README](smoke/aggiemap/README.md)):

```bash
test/smoke/aggiemap/run-local.sh development   # dev.aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh production    # aggiemap.tamu.edu
test/smoke/aggiemap/run-local.sh local         # a dev server in the aggiemap-dev container
```

GIS Day:

```bash
npm run e2e:gisday        # full local suite; starts `nx serve gisday-angular` itself
npm run e2e:gisday:ui     # same, in Playwright's UI mode
npm run smoke:gisday      # smoke suite against https://txgisday.org
```

First run needs the browser once:

```bash
npx playwright install chromium
```

To run the GIS Day suite against a server you already have up, set `E2E_BASE_URL` — the config then
skips starting one:

```bash
E2E_BASE_URL=http://localhost:4200 npm run e2e:gisday
```

To point the GIS Day smoke suite elsewhere:

```bash
SMOKE_BASE_URL=https://staging.txgisday.org npm run smoke:gisday
```

The visual suite targets `AGGIEMAP_VISUAL_BASE_URL` (default dev) and must be run inside the
Playwright container, because its baselines are platform-specific; see the comment in
`playwright.visual.config.ts`.

## Hermetic suites and deployed suites do different jobs

**Unit tests and `test/e2e`** are hermetic. They build and run the code in the commit, so a failure
means *this change* broke something. They can block a merge.

**`test/smoke`** talks to a deployed environment. A failure means the deployment is unhealthy,
which may have nothing to do with any commit, so it must never gate a PR. It is read-only and must
stay that way — it runs against production on a schedule.

## CI

| Workflow | Trigger | Gates a PR | What it does |
| --- | --- | --- | --- |
| `main.yml` ("Quabity Assuance") | every push, and PRs from forks | yes | Calls `lint.yml`, `test.yml` and `build.yml` on the affected projects; `publish.yml` on pushes only |
| `test.yml` | called by `main.yml` | yes | `nx affected:test`, writing JUnit XML; a summary table on the run and the XML as an artifact |
| `test-report.yml` | after "Quabity Assuance" completes | no | Publishes that XML as the **Test results** check on the PR |
| `e2e.yml` | push/PR touching GIS Day or the suite | yes | GIS Day Playwright, `test/e2e` |
| `require-linked-issue.yml` | every PR | yes | The body must close an issue |
| `require-screenshots.yml` | every PR | yes | Before/after images, or the `no-visible-change` label |
| `testing-page.yml` | PR touching `test/smoke` or `docs/testing.md` | yes | `docs/testing.md` must name every AggieMap smoke spec |
| `aggiemap-smoke.yml` | daily at 11:17 UTC, plus manual | no | AggieMap smoke against dev and production; a failure opens a `dev-health` or `prod-health` issue |
| `smoke.yml` | every 6 hours, plus manual | no | GIS Day smoke against txgisday.org |

`test.yml` skips a fixed list of projects, the Cypress one among them; the list is
`EXCLUDED_PROJECTS` at the top of the workflow. It runs with `--coverage=false`;
coverage is available locally via `npm run coverage`.

`test-report.yml` is a separate `workflow_run` workflow because a PR from a fork gets a read-only
token, so a reporting step inside the test job could not create a check on the PRs it is for. The
comment at the top of that file explains why it must never check out PR code.

`e2e.yml` is path-filtered rather than driven by `nx affected`, because Playwright is set up
standalone here — see the comment in `playwright.config.ts` for why, and what it would take to
change that.

The visual suite is not in CI yet: a first run against a changed environment finds differences that
are not regressions, and that should not block anyone while the set is tuned ([#1067](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1067), [#1089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1089)).

## Known gaps in the GIS Day Playwright suites

- **Assertions are structural, not content-based.** Routes load, the app boots, nothing throws, no
  request 5xxs. They do not yet assert page content, because the suite had not been run against a
  live app when it was written. Content assertions should be added per page as each is covered.

- **Authenticated flows cannot be tested against a local build.** `common.config.ts` holds Auth0
  settings as build-time placeholders (`___ANGULAR_AUTH0_DOMAIN___`) substituted at deploy, so a
  locally served build treats the literal placeholder as a hostname and the Auth0 hand-off dies
  with ERR_NAME_NOT_RESOLVED. The guard spec works around this by asserting only that the visitor
  left the guarded route. Covering anything past the login redirect needs real or mocked Auth0
  config — a decision to make before building it.
