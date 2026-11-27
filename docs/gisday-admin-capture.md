# Photographing GIS Day admin pages without signing in

A change to a GIS Day admin page needs before and after images, and no machine can sign in to a local site: Auth0 never
skips its consent screen for one, and a session cannot accept it. So the images are made with the sign-in and the API
answered by the browser itself. Home built this for #3747 and the lab for #440 and #3346, each from scratch;
[`test/e2e/gisday/admin-capture.ts`](../test/e2e/gisday/admin-capture.ts) is the one copy, and this page says how to use it
(#3806).

**Nothing leaves the browser, and nobody signs in.** Auth0 is answered with made-up, unsigned tokens for a made-up admin,
and the API with fixtures you write. What is drawn is the build's own components, so the images show what the change
does. They do not show that the API does it: say so in the pull request, and prove the API with its own specs.

## What it gives you

| Function                                                    | What it does                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `serveBuild(dir)`                                           | Serves a static build, such as `dist/apps/gisday-angular`, as its container does: any path that is not a file gets `index.html`. Returns its address and `close()`                                                                                                                                                                                                       |
| `captureContext(browser, { width, height })`                | A browser context at that size, in US Central, with **service workers blocked**: the site registers one, and the stubs never see a request it makes, so it would reach the server instead                                                                                                                                                                                |
| `signInAsAdmin(context, url, { permissions, roles, site })` | Signs in as an admin. Fills the build's placeholders (`___ANGULAR_SITE___` and the four `___ANGULAR_AUTH0_...___`) in every script, as a deployed container does, and answers Auth0's `/authorize` and `/oauth/token`. The ID token carries `roles` (`GIS Day Admin` by default), which the site reads; the access token carries `permissions`, which the API would read |
| `stubApi(context, url, answers)`                            | Answers `/api/...` from `answers`: each a `path` (a string, or a RegExp), and a `json` or `body`, optionally a `method`, `status`, `headers` or `delayMs`. A call nothing matches gets `[]` and is listed in `unanswered`, so you can see what the page asked that you did not give it                                                                                   |
| `capture(page, out, { schemes, element })`                  | Writes `<out>-light.png` and `<out>-dark.png`, or `<out>.png` for one scheme; of the whole page, or of one element                                                                                                                                                                                                                                                       |

The GIS Day site has no dark scheme yet, so its light and dark images are the same; ask for `schemes: ['light']` until
it has one.

[`admin-capture.spec.ts`](../test/e2e/gisday/admin-capture.spec.ts) proves each of these, in the GIS Day E2E suite: an
admin page opens with the stubs and not without them, the API receives the permissions asked for, an unanswered call is
answered `[]` and listed, and one image is written per scheme at the size asked.

## Making images

A capture is a small Playwright file in [`test/e2e/gisday/captures/`](../test/e2e/gisday/captures), named
`<page>.capture.ts`. [`playwright.capture.config.ts`](../playwright.capture.config.ts) runs them; the E2E suite does not,
and CI never does. Two are there to start from, each one of the earlier captures on the shared helper:

- [`accounts-dashboard.capture.ts`](../test/e2e/gisday/captures/accounts-dashboard.capture.ts): Admin > Dashboards >
  Accounts with made-up counts, as for #3747. `CAPTURE_STATE=busy` shows it while Auth0 is rate-limiting the API.
- [`speakers.capture.ts`](../test/e2e/gisday/captures/speakers.capture.ts): Admin > Speakers with made-up speakers, and on a
  build with #440's Session tag filter, filtered to Panel.

1. **Build the site for production, once on `development` and once on your branch** (a worktree for each, or one after the
   other; the before has to be built before the change is on disk). From Git Bash at the root of the checkout:

   ```bash
   MSYS_NO_PATHCONV=1 docker run --rm -m 8g -v "$(pwd -W):/w" -v tamu-js-dev-nm:/w/node_modules -w /w -e NX_DAEMON=false \
     node:24.22.3 node node_modules/nx/dist/bin/nx.js build gisday-angular --configuration=production
   ```

2. **Run the capture in the Playwright image**, pointing `CAPTURE_BUILD` at the build and `CAPTURE_OUT` at the images'
   folder:

   ```bash
   MSYS_NO_PATHCONV=1 docker run --rm -m 4g -v "$(pwd -W):/w" -v tamu-js-dev-nm:/w/node_modules:ro -w /w \
     -e CAPTURE_BUILD=dist/apps/gisday-angular -e CAPTURE_OUT=docs/screenshots/<slug>/after \
     mcr.microsoft.com/playwright:v1.65.1-noble \
     node node_modules/@playwright/test/cli.js test --config=playwright.capture.config.ts speakers
   ```

   The last word picks the capture by its file name. Each prints the files it wrote and the API calls it answered `[]`.

3. **Look at every image before using it.** A page waiting on a call you did not answer draws its empty state, which
   can look like the change.

For a new page, copy the nearer of the two, change the path, the answers and what to wait for. Wait for something the
fixtures put on the page, not for a fixed time.

## Things that are easy to get wrong

- **A blank page and a `chrome-error://` address** is a placeholder left unfilled: the build sent the browser to
  `https://___angular_auth0_domain___/authorize`. Call `signInAsAdmin` before the first `goto`.
- **A stub that is never asked, and an answer that is `text/html`**, is the site's service worker fetching past the stubs.
  Use `captureContext`, which blocks it, or pass `serviceWorkers: 'block'` to your own context.
- **A PDF shown in the page draws as a blank frame** in Playwright's default headless shell. The capture config uses the
  full Chromium (`channel: 'chromium'`), whose PDF viewer draws it.
- **Made-up data only.** Names, emails and organizations are made up (`example.edu`), never copied from the database:
  the images go into this public repository.
