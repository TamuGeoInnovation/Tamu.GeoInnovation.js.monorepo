# Laptop: current tasks

## Batch g16 (gisday: before and after images for #441, the admin Speakers list's Sessions column; 24 November 2026, about 12:50 AM Central, from `work (gisday)`) (Medium) - **after g14, before g15; on your signed-in stack**

`feat/441-speaker-sessions` on the fork, at `463ef05c8`, is PR 3344; its admin images need a sign-in, which only you have.
Fast-forward only; don't merge `development` into it. With made-up data (a season with a few made-up speakers: one in two
sessions, one in one hidden session, one in none):
1. **Before**, from the merge-base: Admin, Speakers at 1280 px. **After**, from `463ef05c8`: the same list (the Sessions
   column), and the list with "Only speakers in no session" ticked; then the after list at 390.
2. Commit them to `docs/screenshots/441-speaker-sessions/`, add a Before | After table to
   `docs/releases/unreleased/441-speaker-sessions.md` (and drop its "screenshots to follow" line), run
   `collate-release-notes.mjs --check` in Docker, push, and report `laptop/reports/2026-11-24-g16.md` with
   "images pushed (441): <sha>" first. Overnight rules: no package.json or lock changes; never production; txgisday-dev only.

## Batch s8 (security: #1550, drop `baseUrl` and the last `ignoreDeprecations` from the tsconfigs; 23 November 2026, about 9:10 PM Central, from `work (security)`) (Low) - **WITHDRAWN, moved to work (the security director itself, on the shortest queue)** (rule 3 of *Working unsupervised overnight*: home and laptop are each about eight deep). Do not run it.

[#1550](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1550): `"ignoreDeprecations": "6.0"` stops working
in TypeScript 7, and it is there only to keep `baseUrl`. Read the issue first: it says where the two remaining uses are and why
`paths` breaks without `baseUrl` (TS5090), and the fix it proposes (each `paths` entry written relative, `./libs/...`).

- Branch `chore/1550-drop-baseurl` from the latest `development`. Make the change the issue describes, in
  `tsconfig.base.json` and the other place it names, and nothing else; if a project's own tsconfig sets `baseUrl` too, list it.
- Prove it: `npx tsc --showConfig` on one app and one library resolves the same `paths` as before; then the **full**
  check, `scripts/check-in-volume.sh <branch>` (every project's build, lint and test read these paths), Exit line read; and
  Jest's `moduleNameMapper` or Vitest's aliases, if either is derived from `paths`, still resolve (a test run proves it).
- No visible change: say so in the PR body and use the `no-visible-change` label in the text you give me.
- The maintainer is asleep and asked for everything to reach a pull request without him. Push to the fork and say
  "branch ready: chore/1550-drop-baseurl", with the PR body (from the template) in your report
  `laptop/reports/2026-11-24-s8.md`, naming this as "security batch s8". If it turns out larger than the issue says (more
  than a handful of files, or anything Nx generates), stop at the report with what you found and a recommendation.

## Batch g15 (gisday: triage the 2022-era GIS Day backlog that needs a signed-in admin, #521 to #567; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Low) - **after g14**

Five GIS Day issues from 2022 sit open with no status, and checking each needs a signed-in admin, which you have:
[#521](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/521), [#536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/536), [#541](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/541), [#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545), [#567](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/567). For each, check today's code and your signed-in local stack with made-up data,
and put it in one row of a table in your report: **done already** (with the file or PR; the director closes it), **small and still
wanted** (build it, one branch each, with before/after images), or **needs the maintainer** (the choice, options, a recommendation;
don't build it). #567 (one landing page per organization) is the same goal as #2072 and is a product decision: say so and leave
it. The maintainer is asleep and asked for everything to reach a pull request without him. So: decide what you can from the code and the records, choose the conservative option when a choice is needed, and put any real decision in your report as a question with options and a recommendation, then carry on with the rest. Made-up data only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only. Each branch from the latest `development`, red first where a test can show it, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body text in the report.
Report `laptop/reports/2026-11-24-g15.md`.

## Batch g14 (gisday: #1756, the date and time picker's popup opens off screen at phone width; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Medium) - **after 13 (your current GIS Day queue: 8, 11, 12, 13 in that order)**

[#1756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1756): at 390 px the shared picker's popup (`libs/ui-kits/ngx/forms/src/lib/components/date-time-picker/`) opens off the
left edge. It's a shared component, so fix it behind its existing interface (no caller changes), and check every GIS Day form
that uses it still opens its popup in view at 1280 and 390. Red first (the popup's box within the viewport at 390); before/after
images of one GIS Day admin form at 390 and 1280; the bug-fix check with `ui-kits-ngx-forms` and every app that uses the picker
(find them). The maintainer is asleep and asked for everything to reach a pull request without him. So: decide what you can from the code and the records, choose the conservative option when a choice is needed, and put any real decision in your report as a question with options and a recommendation, then carry on with the rest. Made-up data only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only. Each branch from the latest `development`, red first where a test can show it, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body text in the report.
Report `laptop/reports/2026-11-24-g14.md`.

## Batch a11 (aggiemap: #3271, a legend entry with no symbol on dev; 23 November 2026, about 8:40 PM Central, from `work (aggiemap)`) (Medium) - **after 10**

**First batch with the new id scheme** (`DIRECTOR.md`, "Batch ids carry their director's letter", the maintainer's 2A tonight):
the id is the project word's first letter plus that project's own number for this machine, so this is aggiemap's eleventh to
you. Report it as written - `laptop: batch a11 done`, never `batch 11 done`, because gisday has a batch 11 here too. That
collision is not hypothetical: your gisday batch 7 and security's batch 7 shared a number, your `finished batch 7` closed
both in `tools/queued.sh`, and security's #3265 then waited invisibly until you said so in a progress push. Thank you for
that line; it is the only reason anyone found it. `tools/queued.sh` now judges a shared id per director, and
`bash tools/queued.test.sh` covers it.

### #3271 - Freshman Student Selectable is in the legend with no symbol

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3271>

You found this yourself in batch 1. `legend.spec.ts:311` fails on dev, on all three attempts; the other legend tests in the
file pass, so the map and the run are fine.

**Two things are already ruled out, so do not spend time on them:**

1. **It is not a stale dev build.** The issue wondered whether dev was behind the #1988 fix. Dev has been serving the
   13 November build (`dev-2026-11-13`, `68d7b974c`) and 197 commits have merged since, but **none of them touch
   `libs/maps/feature/legend/`, `libs/maps/feature/layer-list/`, or any Freshman or permit-select definition** - checked with
   `git diff --stat dev-2026-11-13..origin/development` over those paths, which comes back empty. A dev build is running
   tonight and it will not change this.
2. **It is not the spec.** It passed for #1987 and #1988 and still passes for the other maps in the same file.

**So the question is the service, and the rule here is to ask it before changing anything**
(`CLAUDE.md`, "Ask the service before you change a definition or a popup template"). Four faults in one week looked like a
field rename and none was; **#2500 is this exact shape** - the portal item's renderers keyed on fields the republished service
no longer had. A legend entry with no symbol is what that looks like from the outside.

**A. Find out why the symbol is missing, without changing a definition.**

1. Find the layer: the Freshman Selectable Parking map's definitions, and which layer draws
   **Freshman Student Selectable**. Say which file and which source id.
2. **Query dev's service for that layer** and record, in the issue:
   - its `drawingInfo`/renderer: type, the field(s) it keys on, and how many classes or unique values it declares;
   - whether those fields exist on the layer, and how many of its records carry a non-null value in each (a count, not a
     guess - the pattern from #1961, where the field was right and filled 116 of 116);
   - its `objectIdField`, and whether the layer really has it (#2510: a layer declared one it did not have, so every query
     returned 500).
3. **Check the portal item too, not only the service.** #2500 was the portal item's renderer, not the service's. If the map
   reads a portal item id, fetch that item's data and compare its renderer's fields against the service's fields.
4. **Compare production.** The issue says production was not checked. Query the same layer on production's service and say
   whether its renderer and fields differ. That single comparison usually names the cause.

**B. Then one of two endings, and not a third.**

- **If the data or the portal item is at fault** - a renderer keyed on a field that is missing or empty - **that is a GIS-team
  fault, not ours.** File an issue for it with the counts from step A, add the spec to `allowedServiceFailures` (or the right
  list) in `test/smoke/aggiemap/environments.json` with the issue number beside it so it stays visible, and push the branch.
  **Do not rename anything to another field, and do not hard-code a symbol.** A hard-coded symbol with no reason beside it is
  indistinguishable from an oversight, which is how 95 of them accumulated (#1028, #1508), and the fix would look like a fix
  and change nothing a visitor sees - worse than the bug, because the issue gets closed.
- **If ours is at fault** - the definition overrides something it should not, or the layer is not the one the map draws - fix
  it, with the reason written beside any override (`docs/map-layers.md`), and prove `legend.spec.ts` red before and green
  after. Before and after screenshots of the legend on that page, into
  `docs/screenshots/3271-freshman-legend-symbol/`, committed as they are taken.

**Either way:** a branch `fix/3271-freshman-legend-symbol` or `test/3271-freshman-legend-symbol` on your fork, a
`.pr-body.md` from `.github/pull_request_template.md` as the last commit, an entry in `docs/releases/unreleased/` if a visitor
sees any difference, and the findings on the issue. I open the PR.

**Roughly:** 45 to 75 minutes, most of it reading service responses. If step A's comparison names the cause in ten minutes,
say so and stop there rather than doing the rest.

**If you are blocked:** put it in the report under **Questions for the director (aggiemap)** with options and a
recommendation, carry on with the next batch, and do not wait on an answer.

## Batch 13 (gisday: #3314, a chart of check-ins by hour across GIS Day week; 23 November 2026, about 10:00 PM Central, from `work (gisday)`) (Low) - **after 11 and 12**

[#3314](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3314), decided by the maintainer (keep
the by-day chart, add an hourly one under it). Branch `feat/3314-check-ins-by-hour` from the latest `development` after
#2893's PR merges; if it hasn't, from `feat/2893-check-ins-dashboard-rest`, and say so. Reuse the dashboards' shared
chart (look in `libs/gisday/platform/ngx/core/.../admin/pages/dashboards/shared/`) and extend it with the option it
lacks rather than writing a second chart. Hours in Central time, across the season's GIS Day days, the dashboard's site
filter applied (the API, as #3024 did). Red first; images on your signed-in stack with made-up check-ins spread across
the days and hours (before and after at 1280, after at 390); `app: gisday` in its release entry; check; push; report
`laptop/reports/2026-11-23-13.md` with "branch ready" and the PR body.

## Batch 12 (gisday: #3244's phone images again, now that the table scrolls in its own box; 23 November 2026, about 8:35 PM Central, from `work (gisday)`) (Medium) - **with batch 11, on the same signed-in stack**

Your batch 4 showed `floating-table` couldn't make #3244's counts table fit. Home has put the table in the admin
dashboards' scroll box, moved to `gisday-platform-ngx-common` (`home/reports/2026-11-23-82-gisday.md`).
`feat/3244-vgi-submission-counts` on the fork is now at `bdf59f7f9`.

From `bdf59f7f9`, with batch 197's made-up data as in your batch 4:
1. **Measure** at 360, 390 and 1280: the page's `scrollWidth` against the screen (it must equal it), and whether the table's
   box scrolls to show Discarded.
2. **If the page fits:** replace `after-submissions-phone.png` (390, the box scrolled to its start) and
   `after-submissions.png` (1280); add `after-submissions-phone-scrolled.png` (390, the box scrolled to its end); update
   the release note's table and alt text; also re-take one dashboard image (Admin, Dashboards, Check-ins, at 1024 px with
   its rail) to show the moved box still behaves as before. `collate-release-notes.mjs --check`, push fast-forward only,
   report `laptop/reports/2026-11-23-12.md` with "images pushed (3244): <sha>" first.
3. **If it still doesn't fit:** change nothing and report the widths.


**Also on batches 11 and 12 (added 9:05 PM Central):** add the line `app: gisday` to the release entry's front matter on each branch
(`2893-check-ins-dashboard-rest.md`, `3244-vgi-submission-counts.md`) in the same push as the images (#2835, PR 3311).

## Batch 11 (gisday: before and after images for #2893, the Check-ins dashboard's walk-ins and show-up rate; 23 November 2026, about 8:00 PM Central, from `work (gisday)`) (Medium) - **after 6, before 7 and 8; it needs your signed-in GIS Day stack**

Home built [#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893) on `feat/2893-check-ins-dashboard-rest` (`2ce9d7419` on the fork) and can't sign in, so the
admin images are yours. Read `home/reports/2026-11-23-80-gisday.md`, section 1, first: what changed, and what made-up
data shows it.

1. **Made-up data:** a season with a few events, made-up accounts that RSVP to some and check in to some, at least one
   walk-in (checked in with no RSVP) and one check-in outside its session's time. No email: block non-GETs except what
   seeding needs.
2. **Before**, from the branch's merge-base: Admin, Dashboards, Check-ins at 1280 px, and one event's row opened.
   **After**, from `2ce9d7419`: the same two views (the new walk-ins and show-up rate columns, and the outside-time mark
   on the opened row), and the table at 390 px.
3. Commit to `docs/screenshots/2893-check-ins-dashboard-rest/`, add the Before | After table to its release note (home's
   branch has the entry, or copy one), `collate-release-notes.mjs --check` in Docker, push to the fork fast-forward only,
   report `laptop/reports/2026-11-23-11.md` with "images pushed (2893): <sha>" first and the PR body from home's report,
   updated with the images.

Never production; txgisday-dev only; no pull request.

## Batch 10 (aggiemap: check every map's outbound links, #3285; 23 November 2026, 7:35 PM Central, from `work (aggiemap)`) (High) - **WITHDRAWN, moved to home batch a1** (23 November 2026, about 9:15 PM Central: you are eight batches deep and home had one batch outstanding, so this went to the machine that can start it tonight. Nothing was lost - you had not started it. Do not run it.)

Build the check that would have caught #3278, where Transportation Services told us a commencement map's link had
been landing on a 404. **Read the issue and both of its comments first** - they carry the whole design, and the
second one is the part that matters most:
<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3285>

**The hard part is not finding dead links. It is not crying wolf.** Building this today, a plain status-code check
was wrong **four different ways** against **one** genuinely dead link: an extensionless path that 404s for a
non-browser client, a 403 to an unfamiliar user agent, a refusal of Playwright's default identity, and a 403 the
origin reported as a 404 with an S3 error document as the body. A check that is wrong three times out of twelve gets
ignored within a fortnight, and then the real failure goes out with the noise.

1. **Follow the seven rules on the issue** (five in the body, two in my comment). In particular: navigate in
   Playwright with a normal desktop browser user agent and `Accept-Language`; a redirect passes and reports its new
   location; judge the page body, not the status alone; **403, timeouts, and a 404 whose body is a storage error or
   an empty document are `inconclusive`, never `failed`**; two strikes before a link fails a run; and an
   allowed-failures list like `environments.json`'s.
2. **Red first, and it must be red for the right reason.** `aggie.tamu.edu/graduation` was fixed by PR 3289, so you
   cannot use it live. Prove the check red against a deliberately dead URL of your own, and **also** prove that each
   of the four false-failure shapes above comes back `inconclusive` rather than `failed` - that second proof is the
   one that makes this check worth having. Use the real URLs named on the issue.
3. **Where it goes:** with the deployed-environment checks in `test/smoke/aggiemap`, not a unit test - it asks the
   internet a question and its answer changes without a commit. **Not in the `quick` tier.** Its row in
   `docs/testing.md`, and leave that file's counts alone, the Total included.
4. **Report what it finds**, per environment, with the final URL for anything that redirected.
5. **Check:** `scripts/check-in-volume.sh <branch> <the projects you touch>`.

An `Exit 1` whose only failure is `npm audit signatures` is a pass - see the note at the top of this file.

Branch on the fork with `.pr-body.md` last. **No pull request.**

## Batch 9 (aggiemap: two things broken on a phone, #3150 and #3149; 23 November 2026, 7:35 PM Central, from `work (aggiemap)`) (High) - **after 5**

Both were reported by the maintainer using the map on his own phone, and both are High. They are separate issues and
want **separate branches**, but they share a cause worth knowing before you start either.

**The shared trap: Angular's secondary outlets.** On mobile, panels load into `outlet-2`. A `router.navigate([...],
{relativeTo: ...})` from a component living in that outlet resolves *inside the outlet*, matches nothing, and fails
**silently** - no error, no console message, nothing happens. This has bitten this repository before: #2641, whose
fix is `primaryOutletRoute()` in `base-directions.component.ts`. **Read that first.** If you need it again, the rule
in CLAUDE.md applies - extend or move the existing helper (`libs/common/utils/routing` is where a second caller would
look for it), do not write a second copy in another file.

### A. #3150 - tapping a bus route on a phone does nothing

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3150>

Start at `bus-route.component.ts` in `libs/aggiemap/ngx/ui/shared/.../transportation/components/bus-route/`, at the
`selection() === 'route'` branch that calls `this.router.navigate([route.ShortName], {relativeTo: this.rt})`. The
mobile tree in `map.routes.ts` loads the bus list into `outlet-2`, which is the trap above.

**Prove the fault before fixing it**, on a phone-sized viewport against a local dev server: tap a route, and show
that the URL does not change and no panel opens. Then prove the fix.

### B. #3149 - routing is unreachable from the phone menu

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3149>

Two separate faults, and the issue says which is which. The phone menu
(`main-mobile-sidebar.component.ts`) has no Directions entry at all; and `omnisearch.component.ts` around line 135
navigates to `map/d/trip` - **the desktop route, hard-coded inside the mobile library**. Line 187 of the same file
shows the correct relative form.

**Leave `bus-stop.component.ts`'s `busMapPath = 'map/d/bus'` alone.** That one is deliberate and documented: it is a
share link, and the guard rewrites `d` to `m`. Changing it would look like a fix and break sharing.

### Both

- **Red first** for each, in its own branch, failing against the unfixed code for the stated reason.
- **Before and after images at phone width** for each, into `docs/screenshots/<issue>-<slug>/`, and a desktop capture
  as the control - a thing that looks broken on a phone and is also broken on the desktop is a different bug.
- Release entry each, with its *What to test on dev* row saying to use a phone or a phone-sized window.
- **Check** each branch for the projects it touches.

Two branches on the fork, each with its own `.pr-body.md` last. **No pull requests.**


> **Decided (the maintainer, 23 November 2026, about 7:00 PM Central), answering your batch 3 Question 1:** your
> option **A**. A check whose Nx targets all passed and whose only failure is `npm audit signatures` counts as a
> **pass**. Name the step in your report; never report a bare `Exit 1`, and never report it as a pass without saying
> which step failed. **No issue is filed** - CI's own `npm audit signatures` passed again on PR 3294 at about 7:00 PM,
> so there is nothing in the repository to fix.
>
> It is **not** your machine's setup, so do not chase it: the home machine sees exactly the same thing at the same
> minute. That endpoint answers `200 text/plain`, four bytes `OK`, for `oxc-parser@0.156.0` from either machine, while
> `nx@22.1.0`'s answers proper JSON - one bad object, cached at the CDN edge serving this network. **Do not work
> around it**: no `--no-audit`, no editing the check script, no `.npmrc` change. See `DIRECTOR.md`.
>
> **Your batch 3 Question 2 (merge order): A, as you recommended.** #3279 is pull request 3294, open now. PR 3282 is
> the director's to update afterwards, with the November basemap becoming the default on dev **and** production - the
> maintainer's decision this evening - so do not touch `basemaps.definition.ts` or `development-only.ts` again.


## Batch 8 (gisday: #3090, preview a submission's uploaded files in the admin; 23 November 2026, about 7:00 PM Central, from `work (gisday)`) (Low) - **after 7**

[#3090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3090), decided by the maintainer on 16 November and held until after GIS Day, which is now over. Read the
issue and both comments first. Branch `feat/3090-submission-file-preview` from the latest `development`.

1. **PDFs and images preview as they are**: an admin-only API route serves a submission's file inline
   (`Content-Disposition: inline`, the right `Content-Type`), and the admin submission view shows it with next and
   previous between that submission's files. Reuse the admin's existing submission page and `libs/ui-kits/ngx/**`
   before building anything (CLAUDE.md, "Reuse before building").
2. **PowerPoint is converted to PDF on the server for the preview**, keeping the original `.pptx` for download.
   LibreOffice headless, in the API's image or a small container beside it. **Before building that half, measure and
   report** what it does to the `gisday-nest` image (size before and after) and how long one conversion of a made-up
   10-slide deck takes; if the image grows by more than about 300 MB, stop after step 1 and ask in the report which way
   to go, with your recommendation.
3. **Tests, red first** where one can show it: a non-admin is refused the route; a file of another submission cannot be
   reached through it.
4. **Images** of the preview with a made-up PDF and a made-up deck, at 1280 px, in
   `docs/screenshots/3090-submission-file-preview/`, and a release-note entry in `docs/releases/unreleased/` (copy an
   existing GIS Day entry's front matter). Full check (`scripts/check-in-volume.sh`, affected); push to the fork; "branch
   ready" with the PR body text in `laptop/reports/2026-11-23-8.md`. If the API's image changes, say exactly what the
   deploy needs (kubernetes-config is the director's).

Made-up files and people only; no email; never production; txgisday-dev is the only Auth0 tenant you may touch.

## Batch 7 (gisday: #2363, run the GIS Day provider specs on the query-checking data source; 23 November 2026, about 7:00 PM Central, from `work (gisday)`) (Medium) - **after 6 and the aggiemap batches ahead of it**

[#2363](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2363). Most GIS Day provider specs mock their repositories, so a query typeorm itself would refuse still
passes CI; that is how #2356 reached production. `libs/gisday/platform/data-api/src/lib/_base/query-checking-data-source.ts`
(PR 2360) fixes that with no database, and two specs use it so far.

Branch `test/2363-query-checking-provider-specs` from the latest `development`. Do what the issue's To do says, for
`libs/gisday/platform/data-api` and `libs/gisday/competitions/data-api`: put every provider spec that mocks `find`,
`findOne`, `count` or the like on the query-checking repository, at least for each method that builds a `where` or
`relations` from loaded entities, keeping their assertions. **Any query typeorm refuses is a bug: file it as its own
issue (Bug, `bug`, assignee `danielgoldbergtamu`; the director sets Priority and the project), fix it on its own branch
with its spec, and list it in the report.** Check with `scripts/check-in-volume.sh <branch>
gisday-platform-data-api,gisday-competitions-data-api,gisday-nest`; push to the fork; "branch ready" with the PR body
text in `laptop/reports/2026-11-23-7.md`, and how many specs moved, by file. No visible change.

## Batch 7 (security: #3265, the basemap source-scan test that overruns its 5 s limit; 23 November 2026, about 7:00 PM Central, from `work (security)`) (Low) - **after 6**

`libs/maps/feature/basemap/src/lib/shared/basemaps.definition.spec.ts`, "is used only by views that let the basemap
decide the spatial reference", failed two full checks today at 9.5 s and 5.9 s while the machine was busy, and passed
alone. #3265 has the cause: `sources()` walks every `.ts` under `libs/` and `apps/` on each call, and that test reads each
file twice.

- Branch `fix/3265-basemap-source-scan` from current `origin/development`, pushed to `fork`.
- Red first: show the test overrunning under load (for example the project's test alongside a full check, or with Vitest's
  `--testTimeout` lowered), and record the time.
- Fix: walk the tree once per spec file (a lazily cached `sources()`), read each file once and test both patterns on the
  same string. Keep every assertion as it is. Only if it is still near the limit, an explicit timeout with a comment
  saying why.
- Green: the same load as the red run, with the time; then `scripts/check-in-volume.sh <branch> maps-feature-basemap`.
- No PR (the director opens it). Draft `.pr-body.md` text in the report, built from `.github/pull_request_template.md`,
  `Closes #3265`, label `no-visible-change`. Report `laptop/reports/2026-11-23-7.md`, then "branch ready".

## Batch 6 (gisday: before and after images for #3292, the Winners page's dropdowns; 23 November 2026, about 6:35 PM Central, from `work (gisday)`) (Medium) - **right after the gisday batch 4, while its GIS Day stack is still up**

There are two batches numbered 4 above (one `aggiemap:`, one `gisday:`), written by two directors at once; this one is
6 so it cannot collide again. It is short: about fifteen minutes on the stack you already have up.

**The branch:** `feat/3292-winners-author-first` on the fork, at `8d6b53ef8` (`173c194f3` plus an older test updated to the new labels), one change: `entryLabel` in
`libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/research-competition/pages/winners/winners.component.ts`.
On the admin Winners page (Admin, Research Competition, Winners) each place's dropdown offered an entry as its title,
then its people in brackets, so a long title cut off the names. Now it is `Main Author - Title (with Others)`.

1. **Data, made up only:** a season with accepted research submissions in at least two competitions. Give one a long
   title (60+ characters) and two or three made-up people, so the cut-off shows. **No email:** block non-GETs except
   what seeding needs, as batch 197 in `work-lab-leila/reports/` describes.
2. **Before**, from the branch's merge-base (`git merge-base HEAD origin/development`): open a competition's 1st place
   dropdown at 1280 px, and capture it open (`before-winners-dropdown.png`).
3. **After**, from `8d6b53ef8`: the same view (`after-winners-dropdown.png`), and the same at 390 px
   (`after-winners-dropdown-phone.png`).
4. **Commit** the images to `docs/screenshots/3292-winners-author-first/` and add
   `docs/releases/unreleased/3292-winners-author-first.md`, copying an existing entry's front matter (for example
   `3244-vgi-submission-counts.md`): a Before | After table, and a *What to test on dev* row saying it cannot be checked on dev
   (no GIS Day dev site, #1525) and that it is checked on production by opening the Winners page. Run
   `node scripts/collate-release-notes.mjs --check` in Docker, then push to the fork, fast-forward only.
5. **Report** `laptop/reports/2026-11-23-6.md`, first line "images pushed (3292): <sha>".

**Don't:** touch production, run `kubectl`, change any Auth0 tenant but txgisday-dev, or open a pull request.

## Batch 5 (aggiemap: Remote Campus Rebranding, #3161; 23 November 2026, 6:25 PM Central, from `work (aggiemap)`) (High) - **after 3**

From the GIS/Transportation team (`chelseycooke`), and High at the maintainer's word. Texas A&M has new naming
conventions for its Washington DC, McAllen and Galveston locations, and the maps still use the old ones.

**Don't touch:** `libs/maps/feature/basemap` and `test/smoke/aggiemap/development-only.ts` - they are batch 3's, and
the director is changing them again for pull request 3282 straight after. Branch from the latest `development`.

### A. #3161 - the three remote campus maps and the Campus Maps landing page

The issue lists every string. Take them from the issue, not from this file, in case it is edited:
<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3161>

In short: on `/all-maps`, DC's and McAllen's descriptions change (Galveston's does not); and each of the three maps'
**sidebar title** changes - "Washington DC Campus", "Galveston Campus", "McAllen Campus".

1. **Find every place each name is written before changing any of them.** The definitions are
   `libs/ts/events/ngx/src/lib/definitions/campus/dc-bush-school.definitions.ts`, `galveston.definitions.ts` and
   `mcallen.definitions.ts`, and the landing page's entries are elsewhere - but a name like "DC / Bush School"
   also appears in layer titles, two spec files (`campus-overlay.spec.ts`, `campus-thumbnails.spec.ts`) and
   possibly in search sources. **Report the full list in your report before deciding what to change.** The issue
   asks for the sidebar title and the landing-page description only; a layer called "DC / Bush School Basemap" is a
   different string and changing it is not obviously wanted. **Where you are unsure, change the two the issue names
   and list the rest as a question** rather than sweeping.
2. **Do not change route paths or ids.** `/campus/dc-bush-school/map/d` and the layer ids stay as they are: they are
   in shared links and in saved settings. This is a wording change only. Say so in the pull request body.
3. **Red first.** A unit assertion on each map's configured title, failing before the change.
4. **Before and after images** for all three maps' sidebars and for `/all-maps`, into
   `docs/screenshots/3161-remote-campus-names/`. Six captures at least. The dev server is fine for these.
5. **Check:** `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` and whatever else your change
   touches. Defaults are fine.
6. Release entry with its *What to test on dev* row, naming all four pages.

**One thing to flag, not to solve:** the issue opens by saying the university is "introducing updated logos and
naming conventions", but every item it lists is text. If new logo files are meant to come with this, nobody has sent
any. Say in your report that you did not change any logo and that none was supplied.

Branch on the fork with `.pr-body.md` as the last commit. **No pull request** - that is the director's.


## Batch 4 (gisday: #3244's counts table on a phone, re-checked after its fix; 23 November 2026, about 5:05 PM Central, from `work (gisday)`) (Medium) - **after 3**

The lab is paused (see `DIRECTOR.md`), so this comes to you. It is small: one fix to confirm and two images to replace.

**The branch:** `feat/3244-vgi-submission-counts` on the fork, at `f458eb400`. Work on it in place, fast-forward
only, no force, and don't merge `development` into it (the director does that when opening the pull request).

**What changed:** the lab's batch 197 (`work-lab-leila/reports/2026-11-23-197.md`, read it first: it has the made-up
data and how it seeded it) found the VGI Submissions page 429 px wide on a 390 px phone, with the new "Submissions by
category" table's Discarded column cut off. `f458eb400` gives that table the shared `floating-table` class, which the
admin layout (`admin.component.scss`) makes 100% wide and lets wrap, as every other admin table.

1. **Run GIS Day locally from `f458eb400`**, signed in as the test admin, with made-up data only: a VGI season with
   categories and a handful of submissions in each status, as batch 197 describes. Its seed is not on the branch;
   recreate it with made-up names (`Made-up bench` and the like). **No email**: block every non-GET as batch 197 did.
2. **Measure** at 360, 390 and 1280 px: the page's `scrollWidth` against the screen, and whether every column of the
   counts table is visible. Record the numbers in a table.
3. **If it fits at 360 and 390:** replace `docs/screenshots/3244-vgi-submission-counts/after-submissions-phone.png`
   (390) and `after-submissions.png` (1280) with new captures, keep the other three, update their alt text and the
   release note's Before | After table if it describes the overflow, run
   `node scripts/collate-release-notes.mjs --check` (in Docker), commit, and push to the fork.
4. **If it still does not fit:** change nothing, and say in the report by how much, with the page and table widths, and
   what you would do instead (for example a box that scrolls sideways around the table). Don't push a fix of your own
   without saying so in the report.
5. **Report** `laptop/reports/2026-11-23-4.md`: the measurements, the pushed sha, and "images pushed (3244): <sha>"
   on its first line.

**Don't:** touch production, run `kubectl`, change any Auth0 tenant but txgisday-dev, or open a pull request.

## Batch 3 (aggiemap: dev's basemap gallery raises a sign-in dialog, #3279; 23 November 2026, 4:55 PM Central, from `work (aggiemap)`) (High) - **first**

You filed this one yourself in batch 2, and it blocks the smoke test you wrote there, so it comes back to you.
Your own recommendation was B: fix #3279 first, and then #3225's new test proves itself on dev the first time it
runs. That is what this is.

**Don't touch:** `libs/maps/feature/basemap`'s definitions as they stand on `feat/3225-basemap-20261119-pr`
(pull request 3282, open) beyond what this task needs, and nothing in `libs/aggiemap/ngx/common` touched by
pull request 3281. Branch from the latest `development`, not from either of those.

### A. #3279 - the September cache answers `499 Token Required`, so the settings page asks a visitor to sign in

`Hosted/VTBase` is secured now. The development gallery still offers it, so opening the settings page on dev raises
a portal sign-in dialog over the gallery.

**Decided by the maintainer, 23 November 2026, 5:20 PM Central:** remove it, which was your own recommendation (A).
He also decided **not** to ask the GIS team why `VTBase` was secured: it is retired, and the removal is the whole
answer. So do not file a data fault for it and do not wait on them. Take the September cache out of the development gallery, since its
comparison is settled (#2515), and take its `development-only.ts` entry out with it.

1. **Confirm the service's state first**, as `CLAUDE.md` requires before changing a definition: request
   `Hosted/VTBase/VectorTileServer` anonymously and record what it answers. If it answers 200 now, stop and say so
   in the report - the fault would be somewhere else and removing the entry would look like a fix and change
   nothing.
2. **Remove the entry** from `aggiemapGalleryBasemaps`, and its `Hosted/VTBase/VectorTileServer` entry from
   `DEVELOPMENT_ONLY_SERVICES` in `test/smoke/aggiemap/development-only.ts`. `development-only-gates.spec.ts` fails
   if those two disagree, so run it.
3. **Red first.** A unit assertion that the development gallery does not offer the September cache, failing before
   the removal.
4. **Prove the dialog is gone**, on a local dev server: open the settings page, and show no sign-in dialog and no
   `499` in the network log. Before and after images into `docs/screenshots/3279-september-cache/`.
5. **Then run #3225's new smoke test**, from `feat/3225-basemap-20261119-pr`'s spec with this fix applied, against
   your local dev server. It has never been green anywhere. Say whether it passes, and in particular whether the
   layers come back exactly as they opened - the part you could not read in batch 2.
6. **Check:** `scripts/check-in-volume.sh <branch> maps-feature-basemap,aggiemap-ngx-discover,aggiemap-angular`.
   Defaults are fine; your Docker has 23.5 GB.

Release entry with its *What to test on dev* row. Branch on the fork with `.pr-body.md` as the last commit.
**No pull request** - that is the director's.


## Batch 2 (aggiemap: two GIS-team requests, #3223 and #3225; 23 November 2026, 12:44 PM Central, from `work (aggiemap)`) (Medium) - **after 1**

Both came from the GIS team (the issues' author is not the maintainer). The maintainer asked for this batch as a
test of whether this machine can take AggieMap work, so **say in the report what failed because of the work and what
failed because of setup** - they are different answers and only one is about the issues.

**The rule that governs both tasks, from `CLAUDE.md`: ask the service before you change a definition or a popup
template.** Four faults in one week looked like a one-word field rename and not one of them was (#657, #1961, #2500,
#2510). In two of the four, making the obvious change **would have looked like a fix and changed nothing a visitor
sees**, which is worse than leaving the bug, because the issue gets closed. Both tasks below look like one-word
changes. Neither is.

### A. #3223 - Nature Rx becomes Nature Spaces, and the sidebar label comes from `Area Name`

Two changes the GIS team wants before this layer goes to production:
- the title and layer name from "Nature Rx" to "Nature Spaces"
- the information sidebar's main label from the attribute **`Area Name`**, not `Campus`

Before editing anything:

1. **Query the service.** Confirm a field named `Area Name` exists, and **how many records carry a non-empty value**
   (116 of 116 is the answer that clears #1961's trap; 0 of 116 is a different issue entirely). **If the field is
   missing or empty, that is a data fault for the GIS team**: file it, say so in the report, and do not rename to a
   field that is also empty.
2. **Confirm the component you are about to edit is the one the layer actually draws.** #1961's field was right all
   along and the component had been unused since #418. Find the popup component the layer's definition names, and
   prove it is the one rendering, before changing it.
3. **Where the title comes from.** Read [`docs/map-layers.md`](../docs/map-layers.md) first. A layer's symbology,
   title and order come from its service, and overriding any of them in a definition needs a reason written beside
   it. If the service still publishes "Nature Rx", work out whether the right fix is the service (the GIS team's) or
   a documented override here, and say which in the report. Do not add an uncommented hard-coded title.
4. **A layer named `nature-rx-layer` failed to load on dev** when a director checked `dev.aggiemap.tamu.edu` on
   17 November: `[@arcgis/core/layers/FeatureLayer] #load() Failed to load layer (title: 'Nature Rx',
   id: 'nature-rx-layer')`. Find out whether that is the known development-GIS-server gap (`CLAUDE.md`, "Things that
   look broken but are not") or a real fault. **A rename on a layer that does not load changes nothing a visitor
   sees**, which is exactly the failure mode above.
5. **Gating.** Nature Rx is not on production. Check what `test/smoke/aggiemap/development-only.ts` says about it -
   `DEVELOPMENT_ONLY_SERVICES`, `DEVELOPMENT_ONLY_LAYER_SOURCES` - and that
   `development-only-gates.spec.ts` in `aggiemap-ngx-discover` still passes. Renaming a service the suite watches by
   its old name will fail that spec, which is the check working.
6. **Every bug gets a test** (`CLAUDE.md`). If the label was reading the wrong attribute, the test asserts the label
   comes from `Area Name`, and it fails against the unfixed code first. Prove that, and say so.

### B. #3225 - the new basemap, `TAMU_BaseMap_20261119`

Portal item `8a52e139679145debc6d2bec377ef38d` on the GIS portal, published 19 November and, the GIS team says, ready
for dev.

1. **It goes on dev only.** The issue asks for production "when you can"; that is the GIS team asking, and
   **the maintainer decides when anything moves to production** (#1229). Add it gated with `TestingService`, as the
   dated campus basemaps in `aggiemapGalleryBasemaps` are, and add it to `DEVELOPMENT_ONLY_SERVICES` in
   `test/smoke/aggiemap/development-only.ts` with the pages that request it, so the suite fails if production ever
   asks for it. Read "Which gate" in `CLAUDE.md` before choosing: a thing that reads a service is left out of the
   build; structure is gated at run time.
2. **Nothing about basemaps is low risk.** #2477/#2536 is the case to read: a basemap **sprite override blanked the
   whole map on production**, was reverted in a hurry together with an innocent gallery fix, came back a week later,
   and nothing noticed in between **because no test switched basemaps and switched back**. If you add a basemap, add
   the check that switches to it and away again.
3. If the portal item will not load, note that `gis.tamu.edu` has returned **intermittent HTTP 400** on another FCOR
   basemap item (a director hit it on 13 November). Try more than once and from the container before concluding the
   item is wrong; if it is the server, that is a finding for the GIS team, not a code change.
4. Before/after of the gallery with the new entry, same as any visible change.

### How to check on this machine

Your `STATUS.md` says Docker here has about **15.4 GB**, so `scripts/check-in-volume.sh`'s default `-m 16g` is at or
over this machine's limit. Use the scoped, bug-fix form rather than `affected` - these are small, contained changes:

```bash
scripts/check-in-volume.sh <branch> <each project you edited>,aggiemap-angular
```

If a run is killed for memory, set `CHECK_MEMORY=12g` and `CHECK_PARALLEL=4` and say so. **Report the exact values
you used and the exit code either way**: [#3000](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3000) is open on exactly this - the documented defaults assume an affected set
that is not always what you get, and a second machine's numbers are what that issue needs. Read the script's own
`Exit N` line from its log; do not pipe `nx` output into `tail`, `head` or `grep`.

### The rest

- **One branch per issue**, from the latest `development`, pushed to **`fork`** (`danielgoldbergtamu`), never to
  `TamuGeoInnovation`. Last commit on each is a `.pr-body.md` drafting the pull request body, built from
  `.github/pull_request_template.md` with every section filled in.
- **Do not open the pull requests.** The director does that, with the real check results. Do not merge anything, do
  not push tags, do not touch production, and do not run a non-read `kubectl`.
- **Screenshots as soon as they are taken**, into `docs/screenshots/<slug>/`, committed with the work. A "before"
  stops being obtainable the moment the fix is on disk.
- **Both issues need their fields finished** - the director is setting Type, Project and Status and asking the
  maintainer for Priority; you do not need to.
- **File what you find**, as a GitHub issue, the moment it comes up, and list the numbers in your report.
- Report `laptop/reports/2026-11-23-2.md` and say **"batch 2 done"**, with per-task results, the check command and
  exit code, and the setup-versus-work split asked for above.

## Batch 1 (gisday, for every director: make this machine ready for anything; 23 November 2026, from `work (gisday)`) (High) - **do this now**

**The maintainer's instruction (23 November 2026, relayed by the GIS Day director): the laptop is to be set up
completely, and you are to prompt him directly with every command it needs that you cannot run yourself.** This is
the one exception to "a listener never asks the maintainer": for this batch, ask him in your own chat. Record it under
**Told directly**.

Goal: when this batch is done, any director can give this machine any batch a development machine takes - AggieMap,
GIS Day or security - and nothing fails for want of setup.

1. **Audit first.** Compare this machine against `CLAUDE_SETUP.md` (every phase, including 6), `docs/gisday-local.md`,
   the smoke suite's README (`test/smoke/aggiemap/README.md`, `test/smoke/gisday/`), `tools/visual-baselines/README.md`,
   and what `home/STATUS.md` and `work/STATUS.md` say those machines can do. Write the gaps as a checklist in your
   `STATUS.md` under **Setup**, each marked done, yours, or the maintainer's. At least:
   - GIS Day local end to end: `scripts/gisday-local.sh`, its containers, its settings kept outside the repository
     (`C:/TAMU/gisday-local/`), and **signed-in** checks: `auth0-dev.local.env` for the **txgisday-dev** tenant only.
   - The Playwright image pulled, and one smoke spec run against dev for each app (AggieMap `one`, GIS Day), so a test
     batch can't fail on the first download.
   - An **SSH key** registered with GitHub (or HTTPS proven) so kubernetes-config can be cloned and pushed; a
     kubernetes-config clone at `C:\TAMU\kubernetes-config` on `master`. Kubernetes-config *work* still goes to `work`,
     but a clone costs nothing.
   - Docker's memory: if WSL's limit can go above about 15.4 GB on this hardware, say how (a `.wslconfig` change is his
     to make), and set `CHECK_MEMORY`/`CHECK_PARALLEL` to what fits until then.
   - `BUILD_TIMES_MACHINE=laptop` as a user environment variable.
   - The AggieMap dev server volume (`tamu-js-dev-nm`) installed from the current lock, and the server starting clean.
   - Anything else the documents or the other machines' status show this one lacks. Host Python is optional; say if
     something you'd be given needs it.
2. **Then ask the maintainer, in one message, for everything that is his**, as his global instructions say:
   Windows PowerShell 5.1, one command per block, each block that depends on a folder starting with its own `cd "<folder>";`,
   in the order they must run (a prerequisite gets its own earlier step), with what each does in a line. **Secrets go
   in through a hidden `Read-Host -AsSecureString` prompt written straight to the file, never pasted into chat or
   shown back**; never read `local-db.env`, and never print a secret's value. Anything needing a browser sign-in
   (GitHub SSH key page, Auth0 dashboard) is a numbered step for him with the exact page. Decisions go as numbered
   options with a recommendation. Ask once; when he says "done" or "written", verify each item yourself.
3. **Do everything that is yours** meanwhile, without waiting on his part.
4. **Prove it**: a bug-fix check (`scripts/check-in-volume.sh development gisday-angular,gisday-nest`), GIS Day local
   signed in as a made-up test user on txgisday-dev (no real names or emails, no real emails sent), one AggieMap smoke
   spec on dev, and one GIS Day smoke spec on dev. Report each result with its exit code.
5. Report `laptop/reports/2026-11-23-1.md`: the checklist, what was done by whom, what still can't be done and why.
   Update the **What this is** section of your `STATUS.md` so a director can see what this machine can now do.

Never: production, kubectl against the cluster, Auth0 tenants other than txgisday-dev, accepting Auth0 consent without
the maintainer saying so, or working around a permission refusal.
