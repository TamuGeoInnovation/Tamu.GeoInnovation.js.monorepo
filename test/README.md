# Tests

## Layout

```
test/e2e/      Playwright, run against a dev server this repo starts. Gates PRs.
test/smoke/    Playwright, run against a DEPLOYED site. Does not gate PRs.
test/*.ts      Pre-existing Jest setup files. Unrelated to the above.
```

Unit tests live next to the code as `*.spec.ts` and are run by Jest through Nx. Playwright specs
live here and are invisible to Jest, because the root `jest.config.ts` uses `getJestProjects()` and
only picks up registered Nx projects.

## Running locally

```bash
npm run e2e:gisday        # full local suite; starts `nx serve gisday-angular` itself
npm run e2e:gisday:ui     # same, in Playwright's UI mode
npm run smoke:gisday      # smoke suite against https://txgisday.org
```

First run needs the browser once:

```bash
npx playwright install chromium
```

To run the local suite against a server you already have up, set `E2E_BASE_URL` — the config then
skips starting one:

```bash
E2E_BASE_URL=http://localhost:4200 npm run e2e:gisday
```

To point the smoke suite elsewhere:

```bash
SMOKE_BASE_URL=https://staging.txgisday.org npm run smoke:gisday
```

## The two suites do different jobs

**`test/e2e`** is hermetic. It builds and serves the code in the commit, so a failure means *this
change* broke something. It can block a merge.

**`test/smoke`** talks to a deployed environment. A failure means the deployment is unhealthy,
which may have nothing to do with any commit, so it must never gate a PR. It is read-only and must
stay that way — it runs against production on a schedule.

## CI

| workflow | trigger | gates a PR |
|---|---|---|
| `e2e.yml` | push/PR touching GIS Day or the suite | yes |
| `smoke.yml` | every 6 hours, plus manual | no |

`e2e.yml` is path-filtered rather than driven by `nx affected`, because Playwright is set up
standalone here — see the comment in `playwright.config.ts` for why, and what it would take to
change that.

## Unit tests are not yet run in CI

There is deliberately no workflow running `nx affected:test`. The suite does not pass: **144 of 201
projects fail**, on breakage that predates this work and is unrelated to application code — `build`
passes. The causes are catalogued in **#963**, along with the local Docker workflow for iterating on
them (~30s per project rather than ~17 minutes per CI round).

A job that is permanently red teaches people to ignore CI, so the test job will be introduced by the
PR that makes it green, not before.

Scale of the problem, from the audit in #963:

```
1,057  spec files
  859  are Nx scaffolds asserting only that a class can be constructed  (81%)
  197  contain real assertions

  417  test failures, of which 327 are those scaffolds                  (78%)
```

So most of the work is deletion, not repair.

## Known gaps in the Playwright suites

- **Assertions are structural, not content-based.** Routes load, the app boots, nothing throws, no
  request 5xxs. They do not yet assert page content, because the suite had not been run against a
  live app when it was written. Content assertions should be added per page as each is covered.

- **Authenticated flows cannot be tested against a local build.** `common.config.ts` holds Auth0
  settings as build-time placeholders (`___ANGULAR_AUTH0_DOMAIN___`) substituted at deploy, so a
  locally served build treats the literal placeholder as a hostname and the Auth0 hand-off dies
  with ERR_NAME_NOT_RESOLVED. The guard spec works around this by asserting only that the visitor
  left the guarded route. Covering anything past the login redirect needs real or mocked Auth0
  config — a decision to make before building it.
