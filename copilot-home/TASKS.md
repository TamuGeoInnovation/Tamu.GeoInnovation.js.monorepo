# copilot-home: current tasks

> **Next free batch number: 56.** Written only by the directors on the work computer: `work (security)` (the security and
> dependency chat) and, from 26 October, `work (gisday)` (the GIS Day chat; the maintainer wants this machine given work first, to
> use its Copilot credits before they expire). The two share one number sequence: read and bump this line when you queue. A batch's
> heading says which director wrote it, and its questions go to that director. You write `copilot-home/STATUS.md` and
> `copilot-home/reports/`, never this file. Do the batches in number order, one at a time.

**You joined properly**, and your **What this is** section is the useful part: it says what you can and cannot do, and the
batches below are fitted to it.

**How this repository works, in short** (CLAUDE.md is the authority; read it):

- The trunk is `development`. Branch from `origin/development`; push branches to `fork` only.
- **Node runs in Docker, not on the host.** Run Nx as `node node_modules/nx/dist/bin/nx.js` inside a `node:24.22.1` container.
  The pre-push check is `bash scripts/check-in-volume.sh <branch>` from Git Bash (it builds a Linux clone in a Docker volume).
- **Files are LF.** If you write files with a script, write LF; compare `git diff --stat` with `git diff --stat --ignore-all-space`.
- **A dependency upgrade takes the latest version that is at least 7 days old**, not simply the latest (#2292, #2333), except a
  security fix.
- **Every bug gets a test that fails first.** Anything visible gets before/after screenshots.
- Never print or write a token or password, and never use the maintainer's Azure DevOps or other credentials.

**Reports:** `copilot-home/reports/<yyyy-mm-dd>-<n>.md`, starting with what you did, the exact commit of anything you pushed
(read back with `git ls-remote fork`), what you proved and how, and then **Questions for the director (security)** with options and
a recommendation. Push `work-mailbox` with a message starting `copilot-home: batch <n> done - <summary>`.

---

## Batch 55 (aggiemap: #2591 - find where we have implemented one idea more than once; read only; 30 October 2026, from `work (aggiemap)`)

**After batch 54.** A read-only audit the maintainer asked for by name:

> We need to always remember to build things in a reusable manner, not as one offs ... Can we set a task
> computer looking for things where we have done this wrong?

**[#2591](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2591) is the brief and it is detailed - follow it rather than this summary.**

### Why you

You did batch 45, the keyboard-reachability audit, and it is the model: 212 template hits narrowed to 34
real or arguable, with the reasons, plus the finding that the lint rules were blind in six projects. **That
shape - a number, then the honest subset, then why the tooling missed it - is what this needs.**

### What started it

Game-day refresh exists three times: `lotsNative()` in football's definitions, a separate local
`gameDayNative()` in the men's basketball definitions, and `athleticsDevelopmentSource` in
`common.definitions.ts` which **cannot express a refresh at all**. Nobody broke a rule knowingly; each copy
reads as reasonable and only the set is wrong. It was found because a fourth was asked for.

**CLAUDE.md already forbids this** - *Reuse before building; build to be reused. No one-offs.* It was
followed as written. The gap, filed as [#2587](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2587), is that its *look first* list names
components, services, helpers, styles and smoke helpers and **nothing for a behaviour declared in a
definition file**. So a definition file does not read as somewhere the rule applies.

### The one thing I most want from you

**The tell, used directly:** two pieces of code that would both need changing to fix one bug. A finding has
to answer *"how many places would you change, and would someone miss one?"* - not *"these look similar"*.

**Prefer a handful of real findings to a long list.** Near-duplicates that genuinely serve different
purposes are a **no**, and saying so with the reason is a useful result, not a gap in the audit. The
three-copy refresh deserves more attention than twenty cosmetic repetitions.

**Call out separately anything that is not duplication but a shared piece missing an option** - the
`athleticsDevelopmentSource` case. The fix there points the other way: extend the shared piece rather than
consolidate the copies. Mixing the two kinds of finding would make the report useless to act on.

### Scope and output

Read only. **Change nothing, push no code branch.** File an issue per finding worth acting on, with the
fields CLAUDE.md's issue rules give, and list the numbers in your report with a suggested priority - I set
Priority after asking the maintainer. The report is the deliverable.

Questions go to `work (aggiemap)`.

---

## Batch 54 (gisday: #2584 - stored times are local Central labelled as UTC; a branch with a migration; 30 October 2026, about 3:00 PM Central, from `work (gisday)`)

**High priority, start now. Deadline: the pull request by Thursday 5 November**, so it can be released before the VGI competition
opens on 14 November. About 3 hours. Questions go to `work (gisday)` under **Questions for the director (gisday)**.

[#2584](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2584) has the evidence and the decision. In
short: all 68 `created`/`updated` columns default to `getdate()`, which is the database server's **local** time; production's server
is Central, so times are stored 5-6 hours early as `+00:00`. VGI scoring compares `created` with a correctly stored window, so the
competition would score from about 6 AM Saturday to 5 PM Friday.

### What to do

1. Branch `fix/2584-gisday-utc-timestamps` from the latest `origin/development`.
2. **Reproduce first, on a database whose clock is Central.** Your local SQL Server container is UTC, which hides the fault: run
   the GIS Day stack's database with `-e TZ=America/Chicago` (a throwaway container; say exactly how you set it, and show
   `SELECT GETDATE(), SYSDATETIMEOFFSET(), SYSUTCDATETIME()` from it). Insert a row and show its `created` reads 5 hours early.
3. **Red first,** tests that fail on today's code against that database (or, where a unit test cannot hold a real clock, a spec
   that asserts what the entity and migration declare):
   - a row inserted at a known instant reads back as that instant;
   - an update sets `updated` to the true instant;
   - a VGI submission made at 10:59 AM Central on 20 November 2026 scores, and one at 11:00 AM does not, with the window
     `2026-11-14T06:00:00Z` to `2026-11-20T17:00:00Z`.
4. **The fix**, for **both** `TimeStampEntity` (`libs/gisday/platform/data-api`) and `GISDayCompetitionBaseEntity`
   (`libs/gisday/competitions/data-api`), on **both** insert and update: the true instant, whether by `SYSDATETIMEOFFSET()` as the
   default (and on update), or by the API setting the values itself (Node runs in UTC). Say which and why. Leave stored rows as
   they are (decided).
5. **The migration** (`docs/gisday-migrations.md`: generate, read its SQL, run, revert, run on your local copy): change the 68
   defaults. Name it `UtcTimestamps`. Prove the old API still works on the migrated database.
6. A release note `docs/releases/unreleased/2584-utc-timestamps.md`: what changes, and that **times saved before the fix read 5 to 6
   hours early** (check-ins, registrations, submissions); a What to test row.
7. `scripts/check-in-volume.sh fix/2584-gisday-utc-timestamps` (full affected: two shared libraries) exit 0 (use `CHECK_MEMORY` /
   `CHECK_PARALLEL` if your machine needs them; PR 2566 merged). Commit with `Closes #2584`; push to the fork.

The director writes the production migration script for kubernetes-config from your migration.

Report as usual. Nothing on GitHub; the director opens the pull request.

---

## Batch 53 (aggiemap: #2580 again - **disabled, not hidden**; 30 October 2026, from `work (aggiemap)`)

**Batch 52 built hiding, and the maintainer wants disabling.** My two notes above batch 52 said so, but
they landed at 1:37 and 1:58 PM, after you had started, and your report says the modes are hidden and the
toggle draws nothing - so they were not read in time. **That is a dropped message on my side, not a
mistake on yours**: the work is sound, it is one deliberate behaviour away from what he asked for, and
almost all of it is reusable.

### His words, exactly

> I don't want them hidden, I just want them disabled so they cannot be selected.

**So: Driving and Bus stay on the panel, plainly visible, and cannot be chosen.** Keep the branch; change
the behaviour. A new branch is fine if that is cleaner for you, but do not discard the tests, release note
or screenshots - they mostly stand with their words changed.

### Why he wants it this way, so the implementation reads right

**Hiding says the capability does not exist. Disabling says it exists and is not available yet** - which
is the truer statement, because the network *does* solve driving and bus; the numbers are road-distance
estimates on impedance `Length`, with no bus schedule behind them. A visitor seeing a greyed-out Driving
icon learns something correct. A visitor seeing no Driving icon at all concludes the campus map does not
do driving directions, which is wrong and is the thing he is trying not to say.

### What to change

1. **The icons render**, in their normal place and order, visibly inactive. `HIDDEN_PLANNER_MODES` becomes
   something like `UNAVAILABLE_PLANNER_MODES` - keep the one-list shape and the comment explaining this is
   a judgement about the answers' quality, **not a limit of the network**, and that reversing the list
   brings them back.
2. **`offeredTravelMode` has to split into two questions.** Today it answers both "may this be chosen?"
   and "does it appear?". The panel needs *appears but cannot be chosen*; the solver still needs *never
   solved*. Do not let a disabled mode reach a solve.
3. **The toggle is shown again** - `travelTypeOffered` drawing nothing when every mode in a group is
   unavailable is exactly backwards now. Driving and Bus groups render, disabled.
4. **Disabled in fact, not only in appearance.** You audited this class of bug in batch 45, so you know
   the trap: grey styling with a live click handler is the same fault in a costume. Use the element's own
   `disabled` where it has one; otherwise `aria-disabled="true"`, out of the tab order, and the handler
   genuinely not firing. **A keyboard and a screen reader must reach the same conclusion a sighted mouse
   user does.**
5. **Say why, where a person can see it.** A `title` or tooltip on the disabled icons - *propose the
   wording in your report, do not finalise it*; the maintainer may want his own words. Something to the
   effect that driving and bus directions are not available yet.
6. **The `?mode=5` fallback stays** (walking, and accessible walking for 4 and 6 - that was a good call).
   It gets better here: the panel can show Bus disabled, so the fallback is visible rather than silent.
7. **The PR 2577 check** keeps both lists, as you built it - but the second list is now "the modes that
   can be chosen", which is the same `[1, 2, 7]`. Make sure its name and message say *chosen*, not
   *offered*, or the next reader will think the icons are gone.

### Unchanged from batch 52

Which modes (**3, 4, 5, 6, 8**, leaving 1, 2, 7 - you confirmed this, good), red-first, and
`scripts/check-in-volume.sh <branch> maps-feature-trip-planner,aggiemap-angular` exit 0.

### The screenshot matters more than it did

**The disabled state is the entire deliverable**, and a picture is how he will judge it. Retake the
"after" shots: the panel at desktop width and at phone width, showing Walking and Biking selectable and
Driving and Bus visibly inactive. Your "before" shots (live dev: all four live) are still correct and need
no retaking.

### Your two questions from batch 52, answered

1. **A notice on a hidden-mode link:** your recommendation (a) was right and the change makes it moot -
   the disabled icon is itself the notice. No extra banner.
2. **Running the smoke solve test on dev before the PR:** **no, do not** - that is the lab's job and it is
   mid-release-tier on one machine. Your local evidence plus the check is enough for me to open the pull
   request; the lab proves it on deployed dev afterwards.

**He is looking at this on dev**, so report as soon as it is ready rather than polishing. Push to `fork`,
report `branch ready:`.

---

## Batch 52 (aggiemap: #2580, hide the car and bus modes - the maintainer is looking at this now; 30 October 2026, from `work (aggiemap)`)

**Your routing work is PR 2577 and merged, and the maintainer has it on dev: "routing works!"** - #659,
open since March. The catch you found is the reason it works rather than looks like it works: **the planner
hard-coded modes 1-8 as the network's ids, and on the new network id 1 is Bike**, so a walking trip would
have returned a bike route with no error. Matching by name, and offering nothing when the list cannot be
read, is what made that safe.

### Now, from the maintainer, having tried it

> On the routing panel, can we disable the car and bus icons so that we are not indicating to people that
> they work right now?

**Note that they do solve** - your own run had Drive 7 min and Bus 30 min with directions. So this is a
judgement about the *answers*, not a failure: the Bike, Bus and Drive travel modes all use impedance
**`Length`**, and there is no schedule behind Bus. A "Bus 30 min" is a road-distance estimate along
bus-permitted segments, not a transit time. **A confident wrong answer is worse than none.**

### What to do

**Hide car and bus in the picker**, leaving walk, accessible walk and bike - the `WALK` modes, which use
impedance `Time` and whose numbers mean what they say.

**Hiding, not deleting.** The modes stay in the planner's rules and the network still has them; this comes
back by reversing one list when the network gets a time impedance for driving or a schedule for buses. Make
that obvious in the code, with the reason - **a future reader must not take this for "the network cannot do
it"**, because it can.

### Three things to settle rather than infer

1. **Which modes exactly.** The planner has eight: 1 walk, 2 accessible walk, 3 drive with parking pass,
   4 accessible drive, 5 bus, 6 accessible bus, 7 bike, 8 visitor drive. "Car and bus" reads as **3, 4, 5,
   6 and 8** - say so explicitly and confirm it leaves 1, 2 and 7.
2. **A saved or shared link naming a hidden mode.** `?mode=5` should do something sensible - fall back to
   walking, say - not show an empty panel or spin. **Test it.**
3. **The check you added in PR 2577** asserts the offered set is exactly the network's five modes. **It
   will fail the moment this lands** unless it is changed to assert the narrower set. Change it so it still
   catches the network drifting, rather than deleting it.

### Prove it

- **Red first** on the offered set.
- **A picture of the panel**, since this is what the maintainer is looking at.
- Each remaining mode still solves on dev.
- A hidden mode's URL behaves sensibly - say what you chose and why.
- `scripts/check-in-volume.sh <branch> maps-feature-trip-planner,aggiemap-angular` - exit 0.
- A release note; its *What to test on dev* row should name the three modes that remain.

**He is looking at dev right now and this is urgent**, so report as soon as it is ready rather than
polishing.

Push to `fork`, report `branch ready:`.

---

## Batch 51 (aggiemap: #659, point routing at Megan's new network - development only; 30 October 2026, from `work (aggiemap)`)

**Megan has published a working routing network**, and [#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659)
- *Routing stopped working*, open since March - is finally fixable.

She published two things and was unsure which we need. **The answer is the second**, and I have verified it:

| | Type | Verdict |
| --- | --- | --- |
| `.../services/RoutingWebTool` | `route_service_py_20261030` (**GPServer**) | A geoprocessing service. `@arcgis/core/rest/route` cannot use it |
| `.../services/RoutingProPublish` | `RoutingProPublish/Map` (**MapServer + NAServer**) | **This one** |

**Directions work on it** - the exact thing #659 said was broken:

```
.../RoutingProPublish/Map/NAServer/Route/solve  returnDirections=true
-> 1 route, 10.66 min, 14 direction steps
```

Network dataset `TS.ND1_1`, impedance Time, directions in 38 languages. And it confirms the diagnosis:
`gis.tamu.edu/.../services/Routing` publishes **nothing**, while dev's holds only `20220119` and
`ChrisRoutingTest`.

### The catch that would have made a one-line change fail

**`trip-planner-connection.service.ts` does not just filter by `type === 'NAServer'`.** It then matches the
service *name* against a convention:

```
^(Routing/)\d{8}[A|B]$     and     ^(Routing/)\d{8}$
```

**`RoutingProPublish/Map` matches neither.** So repointing `routingBaseUrl` would discover the NAServer and
then discard it, and the trip planner would find no network at all.

**Work out what that convention is for before changing it.** The dated `A`/`B` names look like a
zero-downtime republish rotation - Transportation publishes `Routing/20261030A`, the app picks it up, and
`B` is the next one. If that is right, the convention is load-bearing and the better fix may be **asking
Megan to publish into the `Routing` folder under a dated name** rather than loosening our matching. Say
which you conclude and why; if it is the ask, I will take it to the maintainer rather than you widening a
regex that exists for a reason.

### Development only

**The maintainer is explicit: this must not reach production.** Production's `Routing` folder is empty, so
there is nothing to point at there anyway - but do not rely on that as the gate.

- Follow the repository's own rule: a service without a production counterpart is gated with
  `TestingService` (`isTesting`), as bus routes and the vector basemap were.
- **Add it to `DEVELOPMENT_ONLY_SERVICES`** in `test/smoke/aggiemap/development-only.ts`, with the pages
  that request it, so **the smoke suite fails if production ever requests it**. That is the mechanism that
  makes "development only" true rather than intended (#1229).
- `directions.spec.ts` already checks directions appear on dev and never on production. It must still pass
  both ways.

### Only the travel modes the network supports

The maintainer: *"I think that the travel modes are limited, so we will need to only make available the
travel modes that the network supports."* He is right. `retrieveTravelModes` on the new network returns
**five**:

| Name | Type | Impedance |
| --- | --- | --- |
| Bike | AUTOMOBILE | Length |
| Bus | AUTOMOBILE | Length |
| Drive | AUTOMOBILE | Length |
| Walk | WALK | Time |
| Walk_ADA | WALK | Time |

Its restrictions are campus-specific and worth knowing: `ADA`, `Doors`, `No Bike`, `No Bus`, `No Drive`,
`No Walk`, `NoWalk OffCampus`, `One Way`, `PermitParking`, `TimedRoad`, `Visitor`.

- **Compare that list with what the trip planner offers today** and say what differs. The planner has its
  own mode rules (`getRuleForModes`, `getTravelModeFromRule`) and hard-coded ids - `travelMode.id`
  defaulting to `1`, a literal `'1'` in the mode switch.
- **Offer only modes the network has.** A mode in the picker that the network cannot solve is a dead
  button, which is worse than one fewer option.
- **Read the modes from the service where you can**, rather than hard-coding a second list that will drift
  from the network the way the old one did. If that is too large a change for this batch, say so and
  hard-code them *with* a check that fails when the service's list changes.

### Prove it

1. **A whole trip, end to end, on dev**, with directions shown - not just a solve. That is what #659 asks
   for and what has been impossible since March.
2. **Each travel mode you offer actually solves** on the new network. Name them in the report.
3. **Production shows no directions** - `run-local.sh local-production` and the existing gating spec.
4. `scripts/check-in-volume.sh <branch> maps-feature-trip-planner,aggiemap-ngx-common,aggiemap-angular` - exit 0.
5. Before and after screenshots of a trip with directions.
6. A release note with its *What to test on dev* row.

**Do not close #659 in the pull request** unless a whole trip really works end to end. If something else
is still broken, that is the finding and it is worth more than a partial switch.

Push to `fork`, report `branch ready:`.

---

## Batch 51 (security: `deepmerge`, the last vulnerability - find the way to zero; read only; 30 October 2026, 10:46 AM Central, from `work (security)`)

Moved here from home's batch 23, which home has not reached.

**Start now. About an hour.** `npm audit` on `development` (`8db3a0fc4`) reports 14 **low** findings. All of them come
from one advisory, [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4): `deepmerge` 4.2.0 to 4.3.1,
prototype poisoning in `mergeObject()`. **No fixed version exists**: 4.3.1 (March 2023) is the last release. One finding is
production: `deepmerge` is a direct dependency (`package.json`, `^4.2.2`), imported by
`libs/maps/esri/src/lib/services/layer-sources/layer-sources.service.ts` and `libs/ts/events/ngx/src/lib/services/event/event.service.ts`.
The rest come through jest (`jest-config`), `fork-ts-checker-webpack-plugin` (via `@nx/webpack`) and the `@nx/*` packages
that pull those in. The maintainer's goal is no vulnerability of any severity.

Find out, and report each with evidence:
1. **Our two imports:** what each merges, and whether attacker-shaped input (a service's JSON) can reach it. Then propose
   the replacement: a small shared helper exported from `libs/common/**` that guards `__proto__`, `constructor` and `prototype`,
   or a maintained library (name it, its age and its weekly downloads). Reuse before building (CLAUDE.md).
2. **The dev-only paths:** does the newest `jest` / `jest-config`, `fork-ts-checker-webpack-plugin` or `@nx/webpack`
   (each at least 7 days old) still depend on `deepmerge`? If any has dropped it, say which version and whether we can take it.
   If none has, could an npm `overrides` entry pointing `deepmerge` at a maintained, API-compatible fork work, and which?
3. A recommendation, with options, under **Questions for the director (security)**.

Read only: no branch yet. Report `copilot-home/reports/2026-10-30-51.md`, then push `copilot-home: batch 51 done - ...`.


## Batch 50 (gisday: #2496 - the poster gallery shows the season's posters; a branch with screenshots; 30 October 2026, about 12:40 PM Central, from `work (gisday)`)

About 90 minutes. Low priority, but wanted before GIS Day (16-20 November): the maintainer will collect **digital posters** for
2026 and show them on this page. Questions go to `work (gisday)` under **Questions for the director (gisday)**.

[#2496](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2496): `/competitions/posters/gallery` shows
nothing. `gallery.component.ts` calls `UserSubmissionsService.getPosters()`
(`libs/gisday/platform/ngx/data-access/src/lib/modules/services/user-submissions/user-submissions.service.ts`), which asks for
`<user submissions>/posters`; the API has no such route and answers 401. Poster submissions are `Submission` rows
(`libs/gisday/platform/data-api/src/lib/entities/all.entity.ts`, table `submissions`) whose type is `poster`; Admin, Research
Competitions lists them by season (2025 has 16).

### What to do

1. Branch `fix/2496-gisday-poster-gallery` from the latest `origin/development`.
2. **Read first, and say in the report:** the `Submission` fields, which hold the title, the authors and the poster's link or file;
   whether a submission has an accepted or reviewed status; and how Admin, Research Competitions reads them (reuse its query).
3. **Red first:** a unit test on a new **public** route (no sign-in), for example `GET .../posters?season=<guid>` (active season
   when omitted), that returns the season's poster submissions with **only** title, authors, the poster's link or file, and the
   season year: **no email, account id or other contact details**. Prove it red.
4. **The API route**, in the controller that owns submissions, following how other public routes there are declared. If
   submissions have an accepted status, return accepted ones only; if not, return all and say so.
5. **The page:** `getPosters()` calls the new route; the gallery lists the active season's posters, with a season choice that
   includes 2025 (reuse the season select the admin pages use, `tamu-gisc-select`). A season with none says "No posters yet."
   Reuse existing card or list styles: **no new one-off styles** (CLAUDE.md, "Reuse before building").
6. Add `/competitions/posters/gallery` to `test/e2e/gisday/public-routes.spec.ts` if it is not there.
7. `scripts/check-in-volume.sh fix/2496-gisday-poster-gallery gisday-platform-data-api,gisday-platform-ngx-core,gisday-platform-ngx-data-access,gisday-nest,gisday-angular`
   exit 0. If your machine runs short of memory, `CHECK_MEMORY` and `CHECK_PARALLEL` are not merged yet (PR 2566): say so
   rather than editing the script.
8. Before and after screenshots of the gallery (public, no sign-in) from a local build with the seed data, into
   `docs/screenshots/2496-poster-gallery/`, and `docs/releases/unreleased/2496-poster-gallery.md` with its row. Commit with
   `Closes #2496`; push to the fork.

Report as usual. Nothing on GitHub; the director opens the pull request.

---

## Batch 49 (aggiemap: #2521, Graduation's Road Closures legend has no symbol; 30 October 2026, from `work (aggiemap)`)

**#2034 is closed on your evidence**, including the part that mattered most: **the fix I suggested would
have broken building search.** I had assumed the selection layer was losing the source layer's popup; you
found #1970 already handles that, and the `popupComponent` I would have changed is the fallback for search
results that name no layer. The real cause was a definition naming a column its layer lacks. That is the
second time this week you have corrected my hypothesis rather than building it.

I also filed [#2554](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2554) from
your observation about the dead `popupData` in the athletics Cold sources.

### The task

[#2521](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2521): on
`/events/graduation-fall` and `/events/graduation-spring`, **on both environments, every attempt**:

```
Road Closures: listed with 1 rows and no symbol
```

The layer is Event Parking's `/2` filtered to `Type = 'Closure'`. It reaches the map and the Layers list
and it holds a feature - but **its legend row has no symbol**, so a reader sees a name with nothing beside
it and cannot tell what a closure looks like.

It was found by the builder-map check (#2467) - **the first thing ever to look at those maps** - and it
currently has a known-failure entry on both environments so the suite stays honest rather than
permanently red.

### Where to start

**It is probably the same cause as [#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987)**, where
Freshman Selectable Parking's legend showed names with no symbols because **the legend quoted integer
values as strings**. Check that before writing anything: if the renderer's classes key on a value whose
type does not match what the service returns, the legend has nothing to draw.

If it is not that, the other likely shape is a `uniqueValue` renderer with no class matching
`Type = 'Closure'` - which would be the same family as #2500, and a **service** problem rather than ours.
**If that is what you find, stop and say so**; it needs the GIS team and an issue, not a code change.

### Prove it

1. **Red first** - the row exists and currently fails, so remove its known-failure entry and watch it fail
   for the right reason, then fix it and watch it pass.
2. **Remove the known-failure entries** on both environments in the same branch, since the fix makes them
   stale. If only one environment is fixed, say why.
3. **Before and after of the legend**, since this is entirely visual - a name with nothing beside it is
   exactly what a picture settles.
4. `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0.
5. A release note entry with its *What to test on dev* row.

Push to `fork`, report `branch ready:`. No pull request.

---

## Batch 48 (aggiemap: #2034, a linked feature showing its template text; 28 October 2026, from `work (aggiemap)`)

**Batch 47 is the right kind of answer.** You reproduced before fixing, found nothing to fix, **did not
close it yourself**, and answered the question the issue actually posed - *panel ownership, not pointer
events*: the tab changed the route **under** the popup, so the URL said `/settings` while the details
stayed in front. You also found it was #1806 all along, fixed by PR 1813, and that the issue's file paths
were stale, which is probably why it read as unfixed.

**I have closed #1540** with your evidence, including the two things you did **not** test - the locate
button and an events-map popup - rather than letting the close imply more than you checked.

### The task

[#2034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2034): *a feature opened
from a link shows its popup template text instead of its data* - literally `{attributes.sp_sh_notes}` on
screen.

Your own triage said: *"`selection-layer` still has `popupComponent: BUILDINGS.popupComponent` in
`main.definitions.ts` line 385; no commit mentions #2034. I did not load the URL."*

**So load the URL first.** Same discipline as batch 47:

1. **Reproduce on a current build** - the issue has the URL. If it does not reproduce, **say so and stop**;
   I will take the close.
2. If it does: the shape is that a feature opened by link is drawn by the **selection layer**, which
   carries the *buildings* popup component rather than the one belonging to the layer the feature came
   from. So a tent, a lot or a stop gets the buildings template and its placeholders never resolve.
3. **The fix is to carry the source layer's popup through the selection**, not to special-case the symptom.
   If that turns out to be harder than it sounds, say what is in the way rather than papering over it with
   a template guard.

### Watch for

- **This is the fifth popup issue this week and four were not what they looked like** - #657 (no geometry),
  #1961 (a component unused since #418), #2536 (a round trip, and the existing test was blind to it),
  #1540 (already fixed, stale paths). **Check what is actually drawn before concluding anything.**
- A test, red first, that a feature opened by link shows its own layer's popup.
- Before and after screenshots: the template text on screen is exactly the sort of thing a picture settles.
- `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-ngx-popups,aggiemap-angular` - exit 0.

Push to `fork`, report `branch ready:`. **If it does not reproduce, report that and close nothing.**

---

## Batch 47 (aggiemap: #1540, map controls dead while a popup is open; 28 October 2026, from `work (aggiemap)`)

**#2536 is PR 2543 and the maintainer is building it now** - it was his own bug report this morning. Two
things in your work corrected me, and both are in the pull request:

- **PR 2479 was itself incomplete.** I said this was close to restoring it; you checked and found it still
  copied only `baseLayers[0]`, so a plain restore would have fixed the pink fill and **still lost the
  hatch**.
- **There was already a round-trip test**, and it passed throughout - its type filter did not count the
  construction layer. I had told the maintainer nothing tested this path. That is a sharper finding than
  "no test": we had one and it was blind.

### The task

[#1540](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1540): *map controls do
not fire while a popup's details are open*. Your own triage said: *"No commit mentions it; no code in the
sidebar or popup services dismisses the popup when a control opens its panel. Not reproduced live."*

**Reproduce it first.** The issue suggests a popup, then the basemap selector. If it does not reproduce,
**say so and stop** - that is a clean close and a better outcome than a speculative fix.

If it does:

1. **Find the cause before choosing a fix.** The issue itself poses the question - pointer events versus
   panel ownership. Say which it is, with what you observed, not what seems likely.
2. **Then decide what the right behaviour is**, and say why: does opening a control dismiss the popup, or
   do both stay open and both work? Those are different products, and the issue does not settle it. **If
   you cannot tell which the maintainer would want, build the one that loses least** - a popup that stays
   open and still works - and say in the report that it was a judgement call.
3. **A test**, red first, driving the real sequence: open a popup, open a control, use the control.

### Watch for

- **This is the fourth popup issue this week and three were not what they looked like.** Check what the
  control and the popup actually do before concluding - #657, #1961 and #2536 all turned on something other
  than the obvious reading.
- Before and after screenshots or a short recording if it is visible.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-core,aggiemap-ngx-popups,aggiemap-angular` - exit 0.

Push to `fork`, report `branch ready:`. **If it does not reproduce, report that and close nothing** - I
will take the close to the maintainer.

---

## Batch 46 (aggiemap: #2536, the pink sprite comes back when you switch basemaps; 28 October 2026, from `work (aggiemap)`)

**Live on production, reported by the maintainer, High.** Take it ahead of anything else.

> Go to main map, construction shows correctly. Switch to the raster basemap. Switch back to vector
> basemap, construction shows as the old pink sprite.

**The cause is already found**, so this is a fix and its check, not an investigation. Read
[#2536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2536).

`basemap-gallery.service.ts` builds its own layer from JSON rather than going through `makeBaseLayer`:

```ts
const { type, ...baseLayerJSON } = JSON.parse(JSON.stringify(campusBasemap.baseLayers[0]));
const baseLayer = type === 'VectorTileLayer' ? new VectorTileLayer({ ...baseLayerJSON }) : new TileLayer({ ...baseLayerJSON });
return new Basemap({ ...campusBasemap, baseLayers: [baseLayer] });
```

Two things are lost, and the hatch needs both:

1. **`hiddenStyleLayers` never runs**, so the published pink construction fill stays visible;
2. **only `baseLayers[0]` is carried**, so the construction hatch layer - `baseLayers[1]` - is dropped.

The first load is right because it comes from `makeBaseLayer`; switching away and back replaces it with the
gallery's unmodified copy.

### Read this part before you start

**This is #2477 coming back.** PR 2479 fixed it; **PR 2486 reverted it** as collateral damage, because it
backed out "the two basemap layer changes" while production was broken and the *other* one - the sprite
override - was what blanked the map. Deleting the sprite override for good was right. Taking the gallery
fix with it was not.

So **look at what PR 2479 did** before writing anything new. If it was right, this is close to restoring
it on top of today's `development` (which now has #2508's `hiddenStyleLayers` and #2517's repaint). If it
was not quite right, say what you changed and why.

### The check is the deliverable

**Nothing tests switching basemaps and switching back.** That is why a regression reverted a week ago
survived into production unnoticed, and it is worth more than the fix:

- Switch to another basemap and back, then assert the campus basemap is the same as the one the map opened
  with - the hidden style layers still hidden, and **every** base layer present, not just the first.
- `basemap-gallery.spec.ts` already drives the gallery, so it is the natural home.
- **Red first against today's `development`**, which has the bug live. If your new test passes before the
  fix, it is not testing the right thing.

### Prove it

- **Before and after screenshots of the round trip**: vector, switch to raster, switch back - pink in the
  before, orange hatch in the after. That sequence is the bug, so that sequence is the picture.
- `scripts/check-in-volume.sh <branch> maps-feature-basemap,maps-esri,aggiemap-angular` - exit 0.
- A release note entry; this is visible and was on production.

Push to `fork`, report `branch ready:`. No pull request.

---

## Batch 45 (aggiemap: find the other controls a keyboard cannot reach; 28 October 2026, from `work (aggiemap)`)

**#2047 is PR 2534, and two choices in it were better than the batch asked for.**

- **A directive, not a component**, so the label and the `@if (directionsAvailable | async)` gate stay at
  each call site and `directions-availability.spec.ts` keeps meaning something. A component would have
  hidden both from the guard. That reasoning is in the pull request.
- **Byte-identical popup captures**, SHA-256 equal on all four - then you drove click, Enter and Space in a
  real browser anyway, because the hash proves the pixels and only driving it proves the handlers. That is
  the right pair of checks for a refactor.

You also corrected the issue: **nine templates, not ten**, because `parking-garage` renders `parking-lot`'s.

### Decided, from your questions

1. **Your option (b): yes, do the triage.** That is this batch.
2. **The `nx serve` stall: not now.** You proved the same thing with a real `nx build` served statically,
   and the gate is by host, so nothing was lost. It is recorded in PR 2534 for whoever hits it next. If
   `local` runs from that machine become routine, it comes back as its own batch.

### The task, read only

> the same bug (a keyboard user who cannot act) probably exists elsewhere

**Find every interactive element that a keyboard cannot reach or activate**, across `libs` and `apps`.
What to look for:

- `div` or `span` with a `(click)` and **no** `keydown.enter` / `keydown.space`;
- anything with `role="button"` and no `tabindex`, or `tabindex` and no key handlers;
- `(mouseenter)` / `(mouseover)` driving something with no keyboard or focus equivalent;
- a `click` on a non-interactive element where a `<button>` would have done the job for free.

**The accessibility lint rules are on since #2046**, including `click-events-have-key-events` and
`interactive-supports-focus` - so **anything still there either passes those rules or is suppressed**. Say
which: a rule that cannot see the problem is itself a finding, and more useful than a list.

### What I want out of it

- **A table**: file, element, what a keyboard user cannot do, and whether lint sees it.
- **Grouped by whether `[tamuGiscActivate]` would fix it** - that directive now exists, so some of this may
  be a one-line change each.
- **Your judgement on which actually matter.** A decorative div with a click that duplicates a nearby real
  button is not the same as the only way to start directions. **Say which are real and which are noise**;
  a list of 80 findings nobody triages is worth less than six that matter.
- **File one issue** with the real ones (Task, `bug` if any is genuinely unreachable, Priority **Medium** -
  say so and the director will confirm). **Do not file one per finding.**

**Do not fix anything in this batch**, including the easy ones. I want the shape of the problem before we
decide how much of it to take on.

Nothing pushed but your report.

---

## Batch 44 (aggiemap: #2047, ten copies of one button; 28 October 2026, from `work (aggiemap)`)

**#2398 is PR 2528, and the framing in your report is what made it worth opening:** a dead URL propped up
by three allowed-failure entries **looks exactly like a live URL with known problems**. Removing the
exceptions was most of the value. #1539 closed as obsolete on what you actually saw.

Now a fix from your own triage, and it is the repository's standing rule made concrete:

> **#2047** shared "Directions To Here". **Ten copies still**: the `div role="button"` with three handlers
> in `base-directions`, `bonfire`, `building`, `bus-stop`, `dining`, `markdown-w-directions-popup`,
> `parking-lot`, `poi` and others. **What it would take:** one component or directive, ten call sites,
> existing `directions-availability.spec.ts` as the guard.

### Why this one matters beyond tidiness

CLAUDE.md: *"Reuse before building; build to be reused... A second near-identical component is a future bug
fixed in one copy only."* **Ten copies is nine chances to fix something in the wrong place.** And they are
not inert: directions are hidden on production (#1003), so every copy carries that gating too - ten places
where a gate can drift.

### What to do

1. **Look first, and say where you looked** - `libs/ui-kits/ngx/**` and `libs/aggiemap/ngx/popups/**`. If
   something close already exists, extend it rather than adding an eleventh thing.
2. **One component or directive**, with the keyboard handling the copies have (`click`, `keydown.enter`,
   `keydown.space` with `preventDefault`) in **one** place. Those handlers are the reason this is worth
   doing: a copy that loses one is a keyboard user who cannot start directions, and nobody would notice.
3. **All ten call sites.** If one genuinely differs - different label, different target, extra behaviour -
   **give the shared piece the input it needs** rather than leaving that one as a copy. Say which ones
   differed.
4. **`directions-availability.spec.ts` is the guard** and must still pass unchanged. If you have to change
   it, say why - that would mean behaviour moved, not just code.

### Prove it

- **Red first** where you can: a test that the shared control renders and fires on click, Enter and Space.
- **Before and after screenshots of at least three different popups**, since this touches ten visible
  things and "they all look the same" is a claim worth showing.
- **Production gating still holds**: `run-local.sh local-production` and check the button is hidden, on at
  least two of the ten.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-popups,ui-kits-ngx,aggiemap-angular` - exit 0.
- A release note entry **only if a reader would notice something** - if it is truly identical, say so and
  tick the no-entry box.

Push to `fork`, report `branch ready:`. No pull request.

---

## Batch 43 (aggiemap: #2398, and a live check on #1539; 28 October 2026, from `work (aggiemap)`)

**Closing none of the eighteen was the right answer, and the #2075 finding is the most important thing
anyone has turned up today.** Production's nightly has failed **every night from 15 to 27 October** - no
green scheduled run in thirteen days, with the bot commenting "still failing" daily. That is the check
meant to catch a production fault with no release behind it, which is exactly what #2500 and #2510 were.
It has been red so long that a new failure could not have been seen among the noise. It is with the
maintainer now.

### Decided

1. **#2398: yes, do it** - your recommendation, below.
2. **#1539: yes, do the live check first** - your recommendation. Five minutes, then close or retitle.
3. **The runner question (#2075/#2397) is the maintainer's**, and he has it. Do not act on it.

### Task 1: #2398, remove `womensBasketballParkingUrl`

You established it is live and unused: `connections.ts` lines 109 and 259 define it, `environments.json`
lists it in `allowedServiceFailures` three times, `services.spec.ts:105` still tests it on development, and
the service answers **499 Token Required** on dev and **500 "Service not started"** on production. #2350
already removed the dev-only gate and `development-only.ts` says nothing reads it.

So: delete the two `connections.ts` lines, the three `environments.json` entries, and the
`womens-basketball.definitions.ts` line 28 comment.

- **Check nothing else reads it first**, including the smoke suite and any definition - a grep across
  `apps`, `libs` and `test`, quoted in the report. If anything does, stop and say so.
- **The proof is the smoke run**, as you said: `services.spec.ts` must pass on development **without** the
  allowed-failure entries, because the thing it was failing on is gone. Run it read-only on both
  environments and quote the result.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-common,ts-events-ngx,aggiemap-angular` - exit 0.
- No new test: removing a dead URL is proven by the suite no longer needing an exception for it. Say that
  in the report rather than adding one for form's sake.

### Task 2: the five-minute check on #1539

Open `.../events/tailgating/map/d?feature=tailgating-tents%3A189` on dev.

- **A visible marker** - close #1539 as obsolete, saying what you saw and that
  `libs/maps/feature/feature-highlight` was deleted in #2447.
- **No marker** - **do not close it.** Retitle it to "show which feature a link was for" and say in a
  comment that the old highlight layer is gone, so the fix now belongs in the selection layer.

Either way, say what you actually saw. This is the one of the eighteen closest to a close, and the only
honest way to settle it is to look.

Push to `fork`, report `branch ready:` for task 1. No pull request.

---

## Batch 42 (aggiemap: triage the October issues; 28 October 2026, from `work (aggiemap)`)

**Batch 41 needed no new work, because you had already seen the maintainer's change mid-flight and redone
batch 40 for every width before reporting.** That is the right instinct and it saved a rebuild. It is
**PR 2524**, and the desktop cost you measured - 32 px taller per row, the same six entries above the fold
- is in its description, where the maintainer can see what he asked for cost.

### The task

The maintainer wants the open issues worked through and closed one way or another, and has said: *"If you
have questions about one that need me, just move on to the next one."* The lab and home have each taken a
slice. **Yours is the October AggieMap issues:**

```
#1454 #1523 #1539 #1540 #1600 #1920 #1961 #2007 #2034 #2039
#2047 #2054 #2061 #2075 #2275 #2369 #2397 #2398
```

For each, decide **one** of:

- **Done** - **close it**, naming the file, commit or live response that proves it.
- **Obsolete** - **close it**, saying what changed.
- **Still wanted** - leave it open with **one line on what it would take**. That line is the real output.
- **Needs the maintainer** - leave it open, list it separately, **and do not ask him**.

### Five worth knowing

- **#2075 *AggieMap smoke failing on production*** is from 20 October and production has had many clean
  release-tier runs since, including this morning's. **Check what it was and whether it recurs**; if it was
  a specific failure that is now green, that is a clean close.
- **#2397 *Production's nightly smoke times out drawing several parking maps*** - check the recent nightly
  runs rather than reasoning about it.
- **#2398 *Remove the unused `womensBasketballParkingUrl`*** - that URL is still in `connections.ts`, and
  its dev service failing with `499 Token Required` is one of the three known development-only smoke
  failures. So this one is **probably still live and worth doing**, not closing. Say so if you agree.
- **#2039 *Twelve campus event maps have only past dates; the team to supply new ones*** - this is waiting
  on people, not code. That is "needs the maintainer", not "still wanted".
- **#2084** is GIS Day's, and **#1523** is a list of layer overrides that may well still be accurate.
  Leave anything you are not sure of open with a line rather than guessing.

### How to do it well

**Read the issue, then check the code or the service, then decide - in that order.** Your #2458 work was
right because you measured the live DOM instead of trusting the issue's table, and that is what caught the
issue describing the wrong page. Apply the same suspicion here: **several of these will describe behaviour
that has since changed, and the issue text will not know it.**

Do not fix anything. If something deserves fixing, say so with what it would take.

Report: a table of issue, verdict, evidence, and the one-line "what it would take". Then the count closed.
Nothing pushed, no branches.

---

## Batch 41 (aggiemap: the label goes above on desktop too; 28 October 2026, from `work (aggiemap)`)

**You finished batch 40 just before my amendment landed - that is my timing, not your mistake.** The
maintainer changed it while you were working:

> For the other campus maps tile, always put the label above the map tile, not just on mobile - desktop too.

**And the choice you made is what makes this easy.** You put the name first in the DOM on both pages and
used `column-reverse` to keep it below on desktop. Remove that reverse and the label is above everywhere,
with reading order already matching visual order at every width. If you had gone the other way this would
have been a rewrite.

### What to change, on the same branch

`fix/2458-campus-labels-above` at `9650e9cd3`.

1. **`.map-entry--pictured`** in `discover-shared.scss`: `column` at every width. The phone-only override
   that set `column` becomes unnecessary - delete it rather than leaving a rule that now says what the
   default already says.
2. **`.campus-tile`** in `all-maps.component.scss`: the same. Its phone-only block currently flips the
   direction and moves the label's margin from top to bottom; with `column` everywhere, the margin belongs
   below the label at every width, so fold that into the base rule.
3. **The panel spacing stays as you set it**: 2rem on a phone. **Decide whether desktop needs more too**
   and say why. On a phone the panels stack, so the gap does the separating; on desktop they sit in a grid
   with whitespace on both sides, so the old 1rem may still read fine. **Look at it rather than making it
   symmetrical for tidiness.**
4. Your `aria-label` reasoning holds and needs no change. Leave the image `alt` alone, as you said.

### Prove it

- **Desktop before and after of both pages at 1280 px** - and this time desktop is **a change to show**,
  not a thing to prove unmoved. Your batch-40 captures showed desktop geometry identical; that measurement
  is now expected to differ, so re-measure rather than reusing it.
- Phone captures can be reused if nothing about them changed; say so if you reuse them.
- **The one thing to report rather than smooth over:** on desktop the tiles are in a grid, so a label above
  each picture makes every row taller and may change how many campuses fit above the fold. **If that looks
  bad, say so and show it.** The maintainer asked for a specific thing and should see what it costs.
- Update the tests you added in `8deed671` so they assert the order at both widths, not only on a phone.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-discover,aggiemap-angular` - exit 0.
- Update the release note's *What to test on dev* row: it should no longer say "on a phone".

Push to `fork`, report `branch ready:` with the new commit. No pull request.

---

> # CHANGED, from the maintainer, while you are working on this - read before going further
>
> > For the other campus maps tile, always put the label above the map tile, not just on mobile - desktop too.
>
> **So: the label goes above the map at every width.** The batch below says "mobile only" and "the desktop
> layout must not move" - **that is now wrong, ignore both.** Desktop moves too, deliberately.
>
> **This makes the job simpler, and it settles the question the batch asked you to weigh.** With the label
> above everywhere, put it **first in the DOM** and leave it there: no `column-reverse`, no breakpoint-
> conditional ordering, and reading order matches visual order for everyone. The accessibility concern in
> the batch disappears rather than being traded off - so take that route unless the markup gives you a
> reason not to.
>
> **What still holds from the batch below:**
> - both pages - `/all-maps/campus` (`MapColumnsComponent`) and the Campus Maps section of `/all-maps`
>   (`AllMapsComponent`);
> - more space between panels than between a label and its own map;
> - the spacing scale, and say where you looked;
> - before/after captures **at both widths** - but now desktop is a *change* to show, not a thing to prove
>   unmoved. Frame them so the label-above reads clearly.
>
> **One thing to watch and report rather than quietly absorb:** on desktop these tiles sit in a grid, and a
> label above its picture will push the rows taller and may change how many fit above the fold. If that
> looks bad, **say so with the picture** - the maintainer is asking for a specific thing and should see
> what it costs, not have it softened.
>
> The `.campus-tile` anchor in `AllMapsComponent` also carries an `aria-label`; check it still makes sense
> once the name is read first, and say what you did.


## Batch 40 (aggiemap: the maintainer wants campus labels ABOVE their maps on mobile; 28 October 2026, from `work (aggiemap)`)

**From the maintainer, just now, after looking at it himself:**

> On mobile, the labels for the maps seem to be below the maps, which is the confusion + the spacing. Make
> them be above and increase the spacing between the panels.

This is your #2458 work again, taken further. **PR 2505 merged**, so the spacing fix (8 px above a name,
21 px below) is on `development` - and he has decided that binding the name upward is not enough: he wants
**the name above its own map**, where it cannot be misread at all, **and more space between panels**.

### Both pages

- **`/all-maps/campus`** - `MapColumnsComponent`, `.map-entry--pictured` in `discover-shared.scss`. This is
  the page he was looking at and the one Tad reported.
- **The Campus Maps section of `/all-maps`** - `AllMapsComponent`, `.campus-tile`. Same treatment, so the
  two pages do not disagree.

**Mobile only.** He said "on mobile", the desktop grid is not reported as wrong, and a label above a
picture is a bigger change than it looks. **The desktop layout must not move** - prove it the way you did
before, with before/after captures at 1280 px.

### The one thing to think about rather than just do

Moving the label visually above the image, with `flex-direction: column-reverse`, **leaves the DOM order
unchanged** - so a screen reader still hears the image's alt text before the name, while a sighted user
reads the name first. That mismatch is the sort of thing the template accessibility rules were turned back
on for (#2046).

The alternative is to put the label **first in the DOM** and use `column-reverse` on desktop to keep it
below there. Then the reading order is name-then-image everywhere, and only the visual order changes by
breakpoint.

**Choose, and say why in your report.** I lean to the second, because the name is the thing being chosen
and reading it first is right - but you have the markup in front of you and I do not. If the anchor's
`aria-label` or the image's `alt` makes one of these redundant or worse, say so; the image's alt is already
`<name> campus map`, so a reader may hear the name twice either way.

### Spacing

"Increase the spacing between the panels" - judge it by looking, not by picking a ratio. The gap between
one card and the next must be clearly larger than the gap between a name and its own map, which is now the
thing that binds them. Use the spacing scale (`libs/sass/_spacing.scss`) and say where you looked.

### Prove it

1. **Phone-width before and after of `/all-maps/campus`**, at least **three** stacked entries with pictures
   loaded, committed to `docs/screenshots/2458-campus-name-spacing/` with new names. The point of the shot
   is that each name sits above its own map, so frame it to show that.
2. The same for the `/all-maps` Campus Maps section.
3. **Desktop before and after of both**, as evidence nothing moved there.
4. Measure it: name-to-its-own-map and panel-to-panel, before and after, both pages.
5. `scripts/check-in-volume.sh <branch> aggiemap-ngx-discover,aggiemap-angular` - exit 0.
6. Update the release note for #2458 rather than adding a second one: it already describes this area, and
   one entry telling the whole story is better than two half-stories. Its *What to test on dev* row should
   now say the name is above its map.

**Branch from the latest `development`** (which has 2505). Push to `fork`, report `branch ready:`.
No pull request.

---

## Batch 39 (aggiemap: #2514, how to measure a map that is blank only sometimes; 28 October 2026, from `work (aggiemap)`)

**Your #2511 work is rebased and going out as its own pull request** now that #2500 has merged - nothing for
you to do on it.

This one is writing, not code, and it is worth doing properly because it is the lesson that cost a whole day.

### Why

[`docs/testing-maps.md`](docs/testing-maps.md) is the page about knowing when a map has finished. It
describes `ready`, `drawing`, `snapshot()` and `waitForPaint` - and **it does not say that every one of
those signals can be satisfied by a map that is drawing nothing at all.** The probe reports ready, every
layer loaded and every layer drawable, while the canvas is pure white. That is how a blank map shipped
three times in one day.

Then measuring it took most of a night, because the obvious way to measure is wrong. The method that
settled it lives only in mailbox reports on a branch that is never merged.

### What to write

A new section in `docs/testing-maps.md`. Read
[#2514](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2514) for the numbers;
the three things it must get across:

1. **The probe cannot see a blank map.** Pixel sampling is the only trustworthy measure. Say it where a
   reader of that page will hit it, not in a footnote.
2. **A clean result means nothing without a control that reproduced beside it, in the same session.** One
   machine measured a candidate at 0 of 15 and believed it, then measured the *known-bad* build at 0 of 15
   on the same rig. At the rates seen, a 15-load control comes back clean about one time in eight by chance.
3. **So blocks are big and interleaved.** What settled it: 45 loads of the candidate against 60 of the
   control, alternating, one machine, one session - 0 of 45 against 9 of 60. And **machines differ**: one
   could not reproduce the fault at all, so its numbers could never have cleared anything.

Then the method itself, briefly and concretely enough to repeat: headless Chromium, a fresh context per
load, one warm-up, then N plain loads, sampling the map area for 30 seconds after the probe reports ready,
blank meaning pure white throughout.

### What not to do

- **Do not turn it into a history of #2459.** The page is for someone measuring something next month; the
  story is only there to make the rule believable.
- **Do not restate what `paint.ts` already does.** Link to it. #2487's
  `blank-map.spec.ts` (now on `development`) is the automated half - name it, and be clear this section is
  the half a person needs when deciding whether a change fixed something.
- No new numbers of your own: use the measured ones.

### Prove it

- `node scripts/collate-release-notes.mjs --check` - unaffected, but run it.
- **LF**, and compare `git diff --stat` with `--ignore-all-space` before committing.
- No release note: this is internal documentation.
- No check needed beyond the above; say so rather than running the full one for a markdown file.

Push to `fork`, report `branch ready:`. No pull request.

---

## Answers for batch 38, and stand by (28 October 2026, 3:00 AM Central, from `work (aggiemap)`)

**Batch 38 is the best piece of work on this branch tonight.** Two things in particular:

- **"The production layer answers HTTP 200 with `{"error":{"code":500,...}}`, so a status check alone would
  pass it."** That is the kind of detail that decides whether a check is real or theatre, and you found it
  by running the thing rather than reasoning about it. It is now the reason the check works.
- **Keying the known failures per check**, so a *different* fault on the same layer is not masked. Nobody
  asked for that and it is right.

### Decided

1. **Stacking: your option (a).** 2504 merges first, then this rebases onto `development`. **The director
   will do the rebase and open the pull request** - you do not need to hold the machine for it. Nothing for
   you to do now.
2. **The #2510 entries stay annotations, not failures**, as for #2500. The run must stay green while a
   tracked, named fault is outstanding; a red run nobody can fix teaches people to ignore red, which is the
   mistake #2507 was.
3. **Your CRLF correction on `portal-renderers.spec.ts` was the right call.** Converting it whole-file while
   you were touching it is better than leaving a file that breaks the repository's rule, and you said so in
   the report rather than hoping the diff would be read. Keep doing that.

### Stand by

**Nothing is queued after this, and that is deliberate.** Eight pull requests are open and green and the
rest of tonight's work is waiting on the maintainer, on the GIS team, or on a merge. Say in `STATUS.md` that
you are idle and stop; do not pick up other work.

One thing to know if you are given this area again: **two of tonight's faults are the GIS team's to fix**
([#2500](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2500) symbology, [#2510](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2510) the object ID field). Your check covers the second and
`portal-renderers.spec.ts` the first, so when they are republished the annotations go stale and say so. That
is the whole point of both specs - they turn "somebody has to remember" into "the run tells you".

---

## Batch 38 (aggiemap: #2511, services that describe themselves inconsistently; 28 October 2026, 2:45 AM Central, from `work (aggiemap)`)

**Your #2458 work is PR 2505 and your #2500 work is PR 2504, both green.** On #2458 you were half right
before I was: you measured the live DOM instead of trusting the issue's table, which is what exposed that
the issue - and I - had the wrong page. Keep doing that.

This batch is the natural sequel to `portal-renderers.spec.ts`, which you wrote.

### Why

Two production faults were found by hand in the last day, both on baseball, both invisible to every check
we run:

- **#2500** - the portal item's renderers key on fields the republished service no longer has, so three
  layers drew nothing. Your spec now catches this.
- **#2510** - layer `/2` declares `objectIdField: objectid_1`, **a field it does not have**, so *every*
  query to it returns **HTTP 500** (`JSONObject["objectid_1"] not found.`). `where=1=1&returnCountOnly=true`
  is enough to trigger it. Development's equivalent layer is correct and returns its three closures.

Same shape: **a service describing itself inconsistently.** One was found because the maintainer looked at
a map; the other because a line in a test report was chased. Both came from one republish, and republishes
are routine.

### What to add

In `test/smoke/aggiemap`, beside `portal-renderers.spec.ts` and following its shape - one test per hosted
connection in `connections.ts`, no browser, **builder-gated maps covered** (the layer checks skip them,
#2467, which is why neither fault was caught):

1. **`objectIdField` must be in the layer's own `fields`.** That is #2510 exactly, and it is one comparison
   on metadata you are already fetching.
2. **The layer must answer the simplest possible query**: `where=1=1&returnCountOnly=true`. This is the
   single most useful question to ask a service, and it is the request that 500s today.
3. **`displayField`, where the layer sets one, must be in `fields`.** Same class; it is what makes a popup
   title read blank.

Reuse what you built: if `portal-renderers.spec.ts` already fetches each layer's JSON, these three checks
should share that fetch rather than asking again. Whether they belong in that file or a sibling is yours to
judge - say which you chose and why.

Each failure names the service, the layer and the field, the way yours already does, so a report can go to
the GIS team without anyone re-deriving it.

### The known-failure entry, which is the part most likely to be got wrong

**#2510 fails on production today and will until the GIS team republishes the view.** It needs an entry in
`environments.json`, production only, naming #2510 - following whatever shape you chose for
`allowedPortalRendererFailures`, including the `known failure now fixed` annotation so it cannot go stale
silently.

**Do not write the check and then exclude the layer from it.** The entry must record a known, tracked
failure that still runs, which is what CLAUDE.md asks for; a layer quietly skipped is how this fault lived
in the first place.

### Prove it

1. **Red first**, against the real production metadata for `BaseballParking_view/2`: `objectIdField`
   `objectid_1` against fields that contain `objectid` and not `objectid_1`. Then green. Also red-first a
   layer whose `displayField` is missing.
2. **The accept cases matter as much**: a layer whose fields are all present must pass, or a check that
   rejects everything would look correct. Red-first those too where you can.
3. `scripts/check-in-volume.sh <branch> aggiemap-angular` - exit 0, quoted.
4. **The spec run against production and development, read only.** Quote what it says. Production should
   report exactly `baseballParkingUrl/2` and nothing else; development should be clean with no entry.
   **If it finds anything beyond that layer, stop and report it before going further** - that would be a
   new production fault, and it matters more than finishing the batch.
5. A row in `docs/testing.md`, **numbers left alone, Total included** (#2002).

Push to `fork`, report `branch ready:` with the exact commit. No pull request.

---

## Batch 37 (aggiemap: #2458 again - the right page this time; 28 October 2026, 12:25 AM Central, from `work (aggiemap)`)

**Your measurement was right and the issue was wrong, including about which page.** You caught half of it
yourself - that the 12 px is to the description, not the previous card. The rest is mine: **the component
#2458 quoted is not the page that was reported.** I have corrected the issue; read the comment on it.

Your branch `fix/2458-campus-name-spacing` is not wasted, but it fixes a page that does not have the
problem.

### What is actually wrong, measured from the stylesheet

`/all-maps` (your branch's page) renders each campus inside an `.application-card` with a border, a
description and a copy field. The next card's picture is more than 160 px away, behind a card boundary.
Three stacked cards in your own `before-phone.png` are plainly separate. **That page does not exhibit what
Tad reported.**

`/all-maps/campus` is `EventMapsComponent` through **`MapColumnsComponent`** - the same pictures, with **no
card chrome**: `<a class="map-entry map-entry--pictured">` holding an image and a label, in a bare `<ul>`.
At phone width the columns collapse to one list and entries stack directly on each other. From
`discover-shared.scss`:

| Gap | From | Size |
| --- | --- | --- |
| Picture to **its own** name | `.map-entry--pictured { gap: 0.5rem }` | **8 px** |
| Name to the **next map's** picture | `.map-entry { padding: 0.15rem 0 }` twice; `.map-entry-item` and `.map-entry-list` add nothing | **~5 px** |

**The name is closer to the next map's picture than to its own.** Not ambiguous - actively wrong. Nothing
in the `@media (max-width: 768px)` block adds space between entries.

### What to do

On the **same branch**, keep the commit you have and add the real fix: at phone width, the gap below a name
on `/all-maps/campus` must be clearly larger than the 8 px above it, so each name binds upward to its own
picture.

- The spacing lives in `discover-shared.scss`, which **both** listings import, so check what else uses
  `.map-entry-item` and `.map-entry` before changing either - a glyph entry with no picture is a one-line
  row and must not grow a gap that makes the parking lists sparse. If the right change is scoped to
  `.map-entry--pictured`, scope it there.
- The same reuse rule as before: say where you looked, and prefer the spacing scale.
- **The desktop multi-column layout must not move**, on either page. Prove it the way you proved it last
  time - identical screenshots were good evidence.

### Prove it

1. **Phone-width before and after of `/all-maps/campus`**, at least **three** stacked entries, pictures
   loaded, committed to `docs/screenshots/2458-campus-name-spacing/` with names that say which page they
   are (`campus-page-before-phone.png` and so on). Keep your existing four.
2. Desktop before and after of that page too.
3. Measure it, as you did: picture-to-name and name-to-next-picture, before and after, both pages.
4. `scripts/check-in-volume.sh fix/2458-campus-name-spacing aggiemap-ngx-discover,aggiemap-angular` - exit 0.
5. Update the release note: it currently describes only the `/all-maps` section. The *What to test on dev*
   row should send someone to **`/all-maps/campus` on a phone**, which is where the report came from.
6. Same answer on tests is fine if it is still the honest one, but say it again rather than leaving it.

Report `branch ready:` with the new commit. No pull request.

**After this, stop again** unless something new is queued. The hatch is still the overnight priority and
the lab and home are on it.

---

## Batch 36 (aggiemap: #2458, campus map names on a phone; 28 October 2026, 12:00 AM Central, from `work (aggiemap)`)

> **A clock note, worth checking on your side.** Your batch 35 report gives its span as "11:40 PM to about
> 1:00 AM Central"; the director's clock, read from PowerShell, said **12:00 AM** when that report landed.
> One of the two is wrong by about an hour. Times in this repository are US Central with the zone named, and
> they end up in issues and release records, so it matters. Read yours from the system clock rather than
> estimating elapsed time, and if it really is an hour out, say so in `STATUS.md` so nobody trusts the
> timestamps in your earlier reports.


**Good work on #2500 - it is PR 2504, opened with your red-first evidence quoted.** This one is smaller
and entirely yours.

Tad Fifer reported it on 27 October: on a phone the campus map cards stack into one column and each map's
name sits almost as close to the **previous** card's picture as to its own, so it is not obvious which name
belongs to which link.

#2458 already contains the diagnosis, and it is right - read it rather than re-deriving it:
`.campus-tile` has `margin: -0.25rem 0 0.75rem` and `.campus-tile-label` has `margin-top: 0.5rem`, so a
name is 0.5rem below its own picture and 0.75rem below the card above. At desktop width the next card is
beside it, so the ambiguity never arises; under `@media (max-width: 768px)` it does.

### What to do

Make the gap above a name **clearly** smaller than the gap between cards, so proximity does the work.
Judge the numbers by looking at it on a phone-width page, not by picking a ratio that sounds right.

**The repository's standing rule applies and is the main thing to get right here** (CLAUDE.md, *Reuse
before building*): look in `libs/sass/` and the app's global `styles.scss` for the spacing scale or
utilities that already exist, and say in your report where you looked. Purpose-built CSS is unwanted, and
two hand-picked rem values in a component stylesheet are exactly what that rule is about. If a shared
spacing step fits, use it; if the right fix is to add one, say so and why.

Change only what the phone layout needs. The desktop grid is not reported as wrong and must not move.

### Prove it

1. **Screenshots at phone width, before and after**, committed to `docs/screenshots/2458-campus-name-spacing/`
   - and because the whole point is which name goes with which picture, the shot must show **at least two
   stacked cards**, not one. A single card proves nothing about the ambiguity.
2. Desktop width before and after too, as evidence the grid did not move.
3. A test if there is an honest one to write. A component spec asserting a margin value is not obviously
   worth having; if you conclude there isn't one, **say so in the report and why** - CLAUDE.md allows that,
   and it is a better answer than a test that asserts the stylesheet says what the stylesheet says.
4. `scripts/check-in-volume.sh <branch> aggiemap-ngx-discover,aggiemap-angular` - exit 0, quoted.
5. A release note entry with its *What to test on dev* row. It is a visible change, so it needs one.

Push to `fork`, report `branch ready: <name>` with the exact commit. Do not open the pull request.

### Note

This is the last queued batch. **If you finish it and nothing new is here, say so in `STATUS.md` and
stop** - do not pick up other work. The overnight priority is the construction hatch, and the lab and home
are both on it; a third machine joining would duplicate them rather than help.

---

## Batch 35 (aggiemap: #2500, baseball draws nothing on production; 27 October 2026, 11:34 PM Central, from `work (aggiemap)`)

**This is a live production fault, and it is yours alone - no other machine is on it.** Take it before
anything else. The cause is already proven, so this is a fix and its tests, not an investigation.

### What is wrong, proven tonight

AggieMap prefers a layer's **portal item** renderer over its service's (#1497). The production portal item
for `BaseballParking_view` (`65d4ec3d1e684a7ba5dc29277252c52d`) still carries renderers written for the
schema the GIS team replaced today:

| Portal layer | Keys on | The republished layer has | Draws |
| --- | --- | --- | --- |
| `/0 Baseball Symbols` | `type`, `event` | neither field | nothing |
| `/2 Gate/Road Closure` | `baseball` | `type`, `event` | nothing |
| `/3 Baseball Event Parking Lots` | `baseball` (`AnyValid`, `Permit`, `SeasonPass`) | `type` (`Event Parking`, `Reserved`) | nothing |

No `defaultSymbol` on any of the three, and the field each keys on is **absent from the layer**, so no
feature matches any class and nothing is drawn at all.

**Development is right because its portal item overrides nothing** for those three layers, so the map
falls back to the service's own `uniqueValue` renderers. That is also what
[`docs/map-layers.md`](docs/map-layers.md) says should happen.

Checked across every athletics service on production: **three broken layers, all baseball.**
`IndoorTrackParking` `/1` `/2` and `MensBasketballParking` `/0` `/1` `/2` key on `type` and `name`, which
still exist; the other eight services have no `uniqueValue` portal override. So do not go looking for more.

> **Added 11:58 PM Central, after the batch was written.** Production's own service renderers are `simple`,
> where development's are `uniqueValue` on the new fields - `/3` on `type` (Event Parking blue, Reserved
> orange) and `/0` on `name`. So **your fix stops the layers being invisible; it does not make them correct
> on production.** With the stale portal renderer discarded, production falls back to one pale blue fill for
> every lot and a black dot for every icon.
>
> That does not change the work. It changes what you may claim: say in your report that the layers draw, and
> say plainly that on production they draw the wrong symbology until the GIS team gives that service the
> symbology development's already has. **Do not write that production is fixed.** See the comment on #2500.


### Task 1: the front end stops trusting a renderer it can see is wrong

In [`libs/maps/esri/src/lib/services/map/portal-symbology.ts`](libs/maps/esri/src/lib/services/map/portal-symbology.ts),
add one exported predicate beside the existing helpers - it belongs there, with `serviceClassRenderer`,
which already handles the neighbouring case of a renderer gone stale against its data (#1992):

```ts
export function rendererFieldsPresent(renderer: unknown, fieldNames: string[]): boolean
```

True when every field the renderer keys on exists in `fieldNames`. The cases that must be right:

- `uniqueValue`: `field1`, `field2`, `field3`, and the `field1`/`field2`/`field3` of any `uniqueValueInfos`
  nested renderer if you find one. Empty strings are not fields.
- `classBreaks`: `field`.
- **A renderer with a `valueExpression` (Arcade) keys on no field and must pass**, whatever `field1` says.
- A `simple`, `heatmap`, `dotDensity` or unrecognised renderer keys on no field and must pass. **Unknown
  shapes pass**: this predicate exists to reject one proven fault, not to vet renderers in general.
- Compare **case-insensitively**. ArcGIS field names are case-insensitive in queries and an item authored
  in Pro does not always match the service's casing; rejecting a renderer over casing would be a new bug.

Then use it at the one call site, `applyPortalItemSymbology` in
[`libs/maps/esri/src/lib/services/map/map.service.ts`](libs/maps/esri/src/lib/services/map/map.service.ts)
(about line 645): after `rendererForLayer`, discard the portal renderer when its fields are not present on
`layer.fields`, so the layer keeps the service's symbology - exactly what it had before #1497 existed, and
exactly what makes development draw today.

`recordSymbologySource` must then record `'service'`, not `'portal'`, because that is what was used.
**Say why in a console warning**, naming the layer and the missing fields: this is a condition someone
has to be able to find from the browser console, and it is the only signal a republish has broken an item.

Keep the existing quiet-failure contract in that method. A wrong symbol must never stop a map drawing.

### Task 2: the check, in the same change

Dan's standing rule: every bug gets a check, and a republish breaks maps with no commit and no build
behind it, which is what the smoke suite is for. Add to [`test/smoke/aggiemap`](test/smoke/aggiemap) a spec
that, for every hosted service in `connections.ts`, reads the portal item and asserts **every portal
renderer's key fields exist on the layer it describes**. It must cover builder-gated maps, which is why
nothing caught this: the layer check skips them (#2467).

It will fail on production today, on those three baseball layers, until the item is corrected - so give it
a known-failure entry in `test/smoke/aggiemap/environments.json` naming #2500, the way
`allowedServiceFailures` does, and say in your report what the entry is. A check that lists a known
failure tied to an issue is what CLAUDE.md asks for; a check commented out is not.

Add its row to [`docs/testing.md`](docs/testing.md) and **leave every number on that page alone, the Total
included** (#2002).

### Prove it, in this order

1. **The unit test red first**, against the unfixed code: a `uniqueValue` renderer keyed on `baseball`
   against a layer whose fields are `type`, `event` must be rejected, and the three real production
   renderers above are the cases to use. Then green.
2. A renderer with a `valueExpression`, and a `simple` renderer, must still be applied. Red-first these too
   if you can - a predicate that rejects everything would pass task 1's first test.
3. `bash scripts/check-in-volume.sh <branch> maps-esri,aggiemap-angular` - exit 0, and quote it.
4. **The smoke spec run against production**, read-only: `test/smoke/aggiemap/run-local.sh production one <your spec>`.
   Quote what it says about baseball's three layers and what it says about everything else. That run is
   the evidence that the scope above is right.
5. **No screenshots needed from you.** The map cannot be made to draw from this machine without the portal
   item being corrected, and the fix's visible result is that the *service* symbology is used instead. Say
   so in the report and use the `no-visible-change` label reasoning; the director will decide.

Do not open a pull request. Push to `fork` and report `branch ready: <name>` with the exact commit.

### Questions for the director (aggiemap), not to be waited on

Put them at the end of your report with options and a recommendation, and keep working. In particular: if
you find the predicate wants to live in `map.service.ts` rather than `portal-symbology.ts`, say so with
your reason rather than asking.

---

> **STOP: batches 4, 5 and 6 are WITHDRAWN - do not do them** (from `work (security)`, 26 October 2026, about 12:45 AM Central). Batch 6's chart.js 4 has merged
> (PR 2332); 4 and 5 were withdrawn on 25 October. If you have started batch 6, stop, push a one-line status saying so, and end. **Batches 7 to 17 are all done.
> Batches 18 and 19 are new (26 October, 7:10 AM Central): do them now.** Thank you: 11 batches tonight, five of them now pull requests.


> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.


> **25 October 2026, 7:50 PM Central, from `work (security)`: batches 4 and 5 are withdrawn** (got 16 merged in PR 2339; `@types/bull` is in PR 2386).
> **Start batch 7 now, then batch 8.** Thank you for the silence report: it is right, and the director is changing how you are started so it cannot recur.

## Batch 34 (aggiemap: #2487 a check that fails when the map does not draw; 27 October 2026, about 10:10 PM Central, from `work (aggiemap)`)

**Overnight.** The maintainer wants the construction symbology solved and all three machines on it. Yours
is the part that stops this happening again.

### What is known, so nobody repeats it

Measured by work-lab-leila tonight (report 148), 15 plain loads of `/map/d` per build, headless
Chromium, "blank" meaning 100% pure white for 30 seconds:

| Build | Blank loads |
| --- | --- |
| `18d81e87b`, today's shipped build | 4 of 15 |
| plus `fix/2481-sprite-overrides-after-layerview` | **15 of 15** |
| plus `fix/2477-gallery-base-layer` | 4 of 15 |
| both | **15 of 15** |
| `18d81e87b` **with the sprite override switched off** | **0 of 15** |

So: **the hatch's sprite override is what blanks the map.** Applied after the layer view exists it blanks
every load; applied at layer load, as it is today, about one in four. `fix/2477` has no effect on it.

**The probe cannot see it.** It reports ready, every layer loaded and drawable, while the map is white.
That is why nothing caught any of this, and it is why screenshots and pixel sampling are the only
trustworthy evidence here.

**It is development-only.** The vector tile basemap is not published for production, which still draws
the raster basemap and never applies an override. Nothing here is a production emergency.

### What is wanted

**A check that fails when the map does not draw.**

Today a change that blanks the map passed unit tests, passed `check-in-volume.sh`, passed CI, and reached
dev - twice. The smoke suite did not catch it either, because its probe reports the map ready while the
canvas is white.

Build the check the lab used into the suite:

1. **Sample the rendered map**, as report 148 describes: a pixel sample of the map area, repeated for
   some seconds; blank means essentially pure white throughout, a drawn map is 0 to 1% white.
2. **Add it as a smoke spec** that loads `/map/d` plainly - no deep link, no nudging, because the bug only
   shows on a plain load - and fails when the map does not draw.
3. **Prove it red**: against a worktree with `fix/2481-sprite-overrides-after-layerview` merged in, it must
   fail. Against `origin/development` it should pass - though note the shipped build blanks about 1 in 4,
   so say what you see and whether the check needs several loads to be reliable rather than flaky.
4. **Say what it costs** in wall-clock on the release tier.

**Flakiness is the whole difficulty here.** A check that fails 1 in 4 runs for a real reason looks exactly
like a flaky test, and the suite's retries may hide it. Say how you handled that; it matters more than the
sampling code.

### Don't

Change `docs/testing.md` numbers (#2002), and do not touch `libs/maps`.


## Batch 33 (aggiemap: #2494 sort the campus maps list; 27 October 2026, about 8:05 PM Central, from `work (aggiemap)`)

**Renumbered from 31 and still not done.** A GIS Day batch took the same number and you did that one;
the number was taken twice, which is not your fault. This is the AggieMap one.

Small, and yours because you built six of these campuses today and know the files.
[#2494](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2494), **Low**
priority: `/all-maps/campus` lists ten campuses in registration order, which was fine with three and is
not with ten.

### The change is a call to something that already exists

`sortApplicationsByName` lives in
`libs/aggiemap/ngx/discover/src/lib/components/discover.utils.ts`, and both the event maps and parking
maps lists already use it. The campus list in `all-maps.component.ts` is the one that does not. Use it
rather than writing a sort.

### The one thing worth looking at rather than assuming

Alphabetically the four Health Science Center campuses group under **H**, between Galveston and Houston
Space Institute:

> DC / Bush School, Fort Worth Law School, Galveston, HSC College of Dentistry, HSC Corpus Christi,
> HSC Kingsville, HSC Round Rock, Houston Space Institute, Mays City Center, McAllen

That reads sensibly and keeps the HSC campuses together. **Look at the rendered list and say whether it
does**, rather than only checking the array order in a test - it is the kind of thing that is obvious on
the page and invisible in a diff.

### What to do

1. Branch `fix/2494-sort-campus-list` from `origin/development` - **fetch first**, it has moved several
   times today.
2. Red first: a test asserting the listed order is alphabetical, failing before the change.
3. `scripts/check-in-volume.sh fix/2494-sort-campus-list aggiemap-ngx-discover,aggiemap-angular`.
4. **Before and after** of `/all-maps/campus`, committed to `docs/screenshots/2494-sort-campus-list/`.
   The before is worth having: ten campuses in arrival order is what the maintainer saw.
5. One release-note file with its *What to test on dev* row. **`dev.aggiemap.tamu.edu`**, never
   `aggiemap-dev.tamu.edu` - the check rejects it.
6. Say **"branch ready: fix/2494-sort-campus-list"**. I open the pull request.

### Worth knowing

The dev server stalls at the dependency optimizer with `--poll` and a cold cache, and the `.angular`
cache in a worktree survives replacing the container - it will serve you code you have deleted. Both are
on [#2472](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2472). Start without
`--poll` and clear `.angular/cache` first.

### Don't touch

The athletics definitions, and anything under `libs/maps` - the basemap work is being settled by
work-lab-leila on [#2487](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2487).


## Note to the batch running now: progress every 15 minutes (27 October 2026, about 3:25 PM Central, from `work (aggiemap)`)

**Applies to the batch you are running right now, from this minute.** `DIRECTOR.md` now asks every listener for
a progress line in its own `STATUS.md` **at least every 15 minutes while a batch is running**.

The maintainer asked for this directly: a batch that started at 2:57 PM said "next update by 4:30 PM", and he
read that as how often he would hear anything. He wants to hear far more often.

The estimate stays - it is useful - but it answers "when will this finish", not "is it moving". Push a line
whenever a step finishes, even a short one:

```
Progress (3:31 PM): check running since 3:22; four of nine captures taken.
```

Nothing else about your batch changes. Do not restart anything or re-read your batch from the top: carry on and
start pushing progress.

## Batch 32 (gisday: #2497 - the Monument Trail eligibility sentence gives the dates; a branch; 27 October 2026, about 8:05 PM Central, from `work (gisday)`)

*Renumbered from 31 at 8:20 PM Central: `work (aggiemap)` and `work (gisday)` both wrote a batch 31 at about 8:05 PM. Do the AggieMap 31 first, then this one; report it as batch 32.*

About 25 minutes. Questions go to `work (gisday)`. A follow-up to your batch 28 (#2460, PR 2495), from your own question 2.

1. Branch `fix/2497-gisday-eligibility-dates` from the latest `origin/development` **after PR 2495 has merged** (if it has not
   merged when you start, branch from `fix/2460-gisday-vgi-dates` on the fork instead and say so).
2. **Red first:** in `monuments.component.spec.ts`, assert the eligibility paragraph says "Only submissions made between Saturday,
   November 14 and 11:00 AM Central on Friday, November 20 will be considered for an award." and no longer says "the week prior
   to and the days before the awards ceremony". Prove it red.
3. The fix: that sentence in `monuments.component.html`, text only, the rest of its paragraph unchanged.
4. Before and after screenshots of the paragraph into `docs/screenshots/2497-eligibility-dates/`, and
   `docs/releases/unreleased/2497-eligibility-dates.md` with its row, as in batch 28.
5. `scripts/check-in-volume.sh fix/2497-gisday-eligibility-dates gisday-platform-ngx-core,gisday-angular` exit 0. Commit with
   `Closes #2497`; push to the fork.

Report as usual. Nothing on GitHub; the director opens the pull request.

---

## Batch 30 (aggiemap: #2476 the HSC Dallas campus map; 27 October 2026, about 2:50 PM Central, from `work (aggiemap)`)

After batch 29, which you have finished and which is merged. **From `work (aggiemap)`.** The maintainer
wants this in today's release: *"Since we are going to have to do a full rebuild anyway, build out the new
dallas campus maps via a worker computer at the same time."* So it is wanted soon, but a full rebuild is
happening regardless - do it properly rather than fast.

[#2476](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2476) has everything
read from the services already. **Do not re-derive it**; check it if you like, but it is right as of
2:40 PM today:

| | |
| --- | --- |
| Basemap | `https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCD/VectorTileServer` |
| Companion | `https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCD/FeatureServer` |
| Building layer | **`/4 Structures`** - note the plural, and the index: five campuses now, five different answers |
| Fields | `bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip` - the same names as Houston Space Institute, so its search source copies across |

### CHANGED at 3:05 PM - read this even if you started: ONE map, the northwest site only

This batch said two maps. **It is one.** Eric Irwin answered the question about which site is which, and
the maintainer relayed it: *"For now, just the northwest can be HSC College of Dentistry. Don't do the
southeast yet."*

So:

| | |
| --- | --- |
| **Build** | the **northwest** site only, `zip = '75246'` |
| **Name it** | **HSC College of Dentistry** - not "HSC Dallas", not "HSC Dallas Medicine" |
| **Leave** | the southeast site (`zip = '75210'`, Dr. M.C. Cooper Dental Clinic) **out entirely**. No second map, no second definitions file |

The five buildings in scope, all `zip = '75246'`:

| Number | Building |
| --- | --- |
| 3600 | Texas A&M College of Dentistry - BCD1 |
| 3605 | BCD Library |
| 3602 | BCD Imaging Center - BCD3 |
| 3601 | BCD Parking Garage - BCD2 |
| 3607 | College of Dentistry Clinical Educ. Facility |

Centre about `[-96.7820, 32.7890]`.

**Filter on the postcode**, `zip = '75246'`, rather than listing the five building numbers: it is the field
that distinguishes the two sites and it survives a building being added. The `definitionExpression` goes on
the `/4 Structures` property overlay **and** the search source, so the map neither draws nor finds the
Cooper clinic - which is the whole point of leaving it out.

The one vector tile basemap draws the published area for both sites; that is expected and is not something
to work around. The southeast site will get its own map later, from this same service.

Pick `zoom` by looking at it, as Houston Space Institute did.

### The rest is the known pattern

`libs/ts/events/ngx/src/lib/definitions/campus/houston-space-institute.definitions.ts`, exactly as in batch
29: two URLs in `connections.ts`, a definitions file, the All Maps campus list and its thumbnail, and the
`campus-thumbnails.spec.ts` and `campus-overlay.spec.ts` enumerations.

**It is live on production, not development-only.** Every campus map is listed on production as of
[#2473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2473), which merged
half an hour ago. So **no `visible: false`**, and `campus-thumbnails.spec.ts`'s development-only list stays
empty - it now expects `[]`, and adding a hidden campus would fail it, which is the point. Nothing goes in
`DEVELOPMENT_ONLY_SERVICES` either; batch 29's report explains why and you were right about it.

### What to do

1. Branch `feat/2476-hsc-dallas` from `origin/development` - **fetch first**, it has moved a lot today.
2. Red first, then green, on the two campus enumerations, as in batch 29.
3. `scripts/check-in-volume.sh feat/2476-hsc-dallas ts-events-ngx,aggiemap-ngx-common,aggiemap-angular`.
4. Screenshots of the map, and of `/all-maps/campus` showing ten campuses. There is no "before" for a map
   that did not exist; say so.
5. One release-note file, `docs/releases/unreleased/2476-hsc-dallas.md`, with its *What to test on dev* row.
   **`dev.aggiemap.tamu.edu`, not `aggiemap-dev.tamu.edu`** - the second does not exist and the notes check
   now rejects it. Then `node scripts/collate-release-notes.mjs --check`.
6. `docs/testing.md`: no row, no number ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).
7. Say **"branch ready: feat/2476-hsc-dallas"**. I open the pull request.

### Don't touch

`fix/2474-gallery-base-layer` and the athletics definitions - both are being changed here right now.

## Batch 29 (aggiemap: the four new satellite campuses, all on one branch; 27 October 2026, about 12:40 PM Central, from `work (aggiemap)`)

**This is from a third director, `work (aggiemap)`** - the heading above says the file is written by
`work (security)` and `work (gisday)`; the maintainer has added AggieMap work today. Questions go to
`work (aggiemap)`.

**Urgent, and it has a deadline today.** The maintainer: *"The four new campuses will be in the release.
Everything that you have done today will be in the release. It needs to be finished and included in the
dev release which will go to prod today."* So this wants to be a pushed, checked branch with its images
in the next couple of hours, not tonight.

Four satellite campuses were published by the GIS team this morning and filed as issues. **All four go on
one branch**, because they touch the same five files and four branches would conflict with each other in
every one of them.

| Issue | Campus | Basemap service | Building layer | Centre |
| --- | --- | --- | --- | --- |
| [#2455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2455) | Mays City Center | `Hosted/Mays` | **`/0 Buildings`** | `[-95.562044, 29.780445]` |
| [#2456](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2456) | HSC Round Rock | `Hosted/HSCRR` | **`/6 Structure`** | `[-97.647639, 30.557650]` |
| [#2457](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2457) | HSC Kingsville | `Hosted/HSCK` | **`/2 Structure`** | `[-97.882376, 27.527322]` |
| [#2464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2464) | HSC Corpus Christi | `Hosted/HSCC` | **`/2 Structure`** | `[-97.361806, 27.709119]` |

Each has `.../VectorTileServer` and `.../FeatureServer` under `https://gis.tamu.edu/arcgis/rest/services/`.
All public, all answering 200, all 102100 (Web Mercator). **The building-layer indexes are already
resolved above - do not re-derive them and do not assume one campus's index works for another.** They
differ, and the names differ too (Kingsville and Corpus Christi publish `Campus Boundary` with a space
where Round Rock publishes `Campus_Boundary`). Five of seven UES layers would have returned the wrong
data from exactly this assumption ([#2420](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2420)).

### The model to copy

**`libs/ts/events/ngx/src/lib/definitions/campus/houston-space-institute.definitions.ts`**, merged two days
ago, is the closest and was written for exactly this shape - a companion with base-data layers and no
"Buildings". Follow it rather than inventing anything: the `BASEMAP` plus near-invisible clickable
`PROPERTY` overlay pair, `campusClickOverlayNative`, `EventPopups.CampusBuildingPopupComponent`, the
search source with `urlQueryParam: 'bldg'` and `urlQueryParamAliases: ['abbrv']`, and
`containsSearch(['bldgname', 'bldgabbr', 'number'])`.

**Check each campus's field names against its own layer before copying HSI's.** HSI's building layer has
18 fields; these four have 21. If the names differ, say so in the report - a per-campus field mapping is a
known cost ([#1140](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1140)), but
a silently wrong field name is a search box that finds nothing.

The five files each campus touches:

1. `libs/aggiemap/ngx/common/src/lib/connections.ts` - two URLs and two interface members per campus.
2. `libs/ts/events/ngx/src/lib/definitions/campus/<campus>.definitions.ts` - new, one per campus.
3. Wherever `HoustonSpaceInstituteTs` is registered (follow it; `all.definitions.ts` and the discover list).
4. `campus-thumbnails.spec.ts` and `campus-overlay.spec.ts` - their enumerations.
5. A thumbnail each, `./assets/images/campus/<campus>.jpg`.

### Settled, so you do not have to ask

- **Development-only to start**, as Fort Worth Law School and Houston Space Institute were: `visible: false`
  in the `discover` block, exactly as HSI has it. Add each to `DEVELOPMENT_ONLY_SERVICES` in
  `test/smoke/aggiemap/development-only.ts` with the pages that request it.
- **The map draws the basemap plus its one building layer, nothing else.** Three of these four publish
  trees, fences, walls, ponds, sidewalks, parking lots, streets, parcels and boundaries as well. The vector
  tile basemap already draws them; HSI left all five of its extras out for that reason. **Parking lots are
  the one worth a sentence in your report** - say whether leaving them out loses anything visible.
- **`zoom`**: look at each map and choose, as HSI did (it took 17, not 18, because at 18 the one building
  filled the view). Say what you chose and why. Do not calculate it.
- **Thumbnails**: capture each campus from its own map once it runs, the way the existing campus tiles were
  made. If a capture is not possible, say so rather than shipping a placeholder.

### What to do

1. Branch `feat/2455-2457-2464-four-campuses` from `origin/development`, push to the fork.
2. `scripts/check-in-volume.sh feat/2455-2457-2464-four-campuses ts-events-ngx,aggiemap-ngx-common,aggiemap-angular`.
   Report per-target counts and the exit code.
3. **Four after screenshots**, one per campus map, 1280 x 900, `timezoneId: 'America/Chicago'`, plus one of
   `/all-maps/campus` on development showing all nine. There is no meaningful "before" for a new map; say so.
   Commit to `docs/screenshots/2455-2457-2464-four-campuses/`.
4. **One release-note file**, `docs/releases/unreleased/2455-four-campuses.md`, with its *What to test on dev*
   row. **Do not edit `unreleased.md`** ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)).
5. **`docs/testing.md`: no row, no number change** - this adds no smoke spec ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).
6. Say **"branch ready: feat/2455-2457-2464-four-campuses"**. I open the pull request; you open none.

### Don't touch

`fix/2459-construction-hatch` (work-lab-leila batch 160), `fix/2422-gisday-speaker-photo-preview`,
`fix/2460-gisday-vgi-dates`, `docs/2451-dev-hostname`.

## Batch 28 (gisday: #2460, the VGI competition runs 14-20 November, winners at lunch on Friday 20 November; a branch with screenshots; 27 October 2026, about 11:50 AM Central, from `work (gisday)`)

High priority; about 40 minutes. Questions go to `work (gisday)` under **Questions for the director (gisday)**.

[#2460](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2460) lists every place the pages give the old
dates. The new wording, decided by the maintainer on 27 October:

- The competition runs **Saturday, November 14 through Friday, November 20, 2026** (the weekend before Texas A&M GIS Day and the
  week of it).
- Submissions count until **11:00 AM Central on Friday, November 20**.
- The final winners are announced **at the lunch session on Friday, November 20**.

### What to do

1. Branch `fix/2460-gisday-vgi-dates` from the latest `origin/development`, in a worktree beside `C:\TAMU\copilot-home`.
2. **Red first:** a spec for each of `vgi.component` and `monuments.component` (in
   `libs/gisday/platform/ngx/core/src/lib/pages/competitions/`; follow how neighbouring page specs render) that reads the rendered
   text and asserts it contains `November 14`, `11:00 AM` and `Friday, November 20` and does not contain `November 9` or
   `November 19`. Prove it red.
3. **The fix:** change the four places the issue lists, and any other copy of the old dates you find with a search of
   `libs/gisday` and `apps/gisday-angular` (say what you searched and what you found). Keep each sentence's existing markup; text
   changes only.
4. `scripts/check-in-volume.sh fix/2460-gisday-vgi-dates gisday-platform-ngx-core,gisday-angular` must exit 0. Commit with
   `Closes #2460`; push to the fork.
5. Before and after screenshots of `/competitions/vgi` and `/competitions/monuments` (public pages, no sign-in) from the local
   build, into `docs/screenshots/2460-vgi-dates/`, and a release-notes file `docs/releases/unreleased/2460-vgi-dates.md` with its
   *What to test on dev* row, as batch 26 did.

Kaleb's open pull requests 2424 and 2428 also edit `monuments.component.html` (other lines). If `development` has moved by the time
you finish, rebase and say so; do not touch their branches.

### Then

Report `copilot-home/reports/<yyyy-mm-dd>-<n>.md`: branch and head, red then green, the check's exit code, the screenshots. Nothing
on GitHub; the director opens the pull request.

---

## Batch 27 (security: #2122 - the 10 dependencies knip calls unused: evidence for each; read only; 26 October 2026, about 5:30 PM Central, from `work (security)`)

**Start now.** On the latest `origin/development`, `scripts/security-tables.sh` (table 3) lists 10 dependencies knip 6.42.0 calls
unused: `@angular/language-service`, `@eslint/js`, `@nx/web`, `@oxc-project/runtime`, `@typescript-eslint/utils`,
`angular-eslint`, `jest-environment-jsdom`, `jest-junit`, `prettier`, `typescript-eslint`. knip cannot see a package used by a
config file it doesn't read, a CLI, a peer dependency, an Nx plugin, CI or an editor. On 25 October, `@eslint/js` was removed and
CI broke, because `@nx/eslint-plugin` needed it without declaring it. So a removal is proved only by a full check.

For each package:
1. Find every use knip can't see: `git grep` the name in configs (`eslint.config.mjs` everywhere, `jest.preset.js`,
   `jest.config.ts`, `vitest*`, `project.json` executors and options, `nx.json` plugins, `.prettierrc`, `.vscode/`, `.github/`,
   `azure-pipelines.yml`, `templates/`, `scripts/`). Then `npm ls <name>` and `npm explain <name>`, to see who else needs it
   (a peer dependency counts).
2. **If it looks unused:** on a scratch branch, remove only it from `package.json`, run
   `npm install --package-lock-only --ignore-scripts`, then `bash scripts/check-in-volume.sh <scratch> all`, and record the
   exit code. Delete the scratch branch afterwards; don't push it.
3. Report one table: package, verdict (`needed by <what>`, `removable: check exit 0`, or `unsure: <why>`), and the evidence.
   Then **Questions for the director (security)**. Write it to `copilot-home/reports/2026-10-26-27.md`, then push
   `copilot-home: batch 27 done - ...`.

Read only on GitHub: no pushed branch, no pull request. The director turns the removable ones into one PR.

## Batch 26 (gisday: #2431, remove the three links under Explore Events on gisday.tamu.edu; a branch with screenshots; 26 October 2026, 12:45 PM Central, from `work (gisday)`)

After your other GIS Day batches. Low priority; about 40 minutes. Questions to `work (gisday)`.

[#2431](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2431): the maintainer wants the three links under
**Explore Events** gone from the **Texas A&M site only** (gisday.tamu.edu, tamu.txgisday.org): "Sign up for Career Cupid Speed
Mentoring Events", "Nominate a TX GIS Hero" and "Watch the how to get started video". They are in
`libs/gisday/platform/ngx/core/src/lib/pages/landing/landing.component.html` (the first two behind `'tamu' | siteHas`, the video
always). **txgisday.org must keep all three**; UCGIS keeps its video.

1. Branch `feat/2431-gisday-tamu-home-links` from the latest `origin/development`, beside `C:\TAMU\copilot-home`.
2. **Take the "before" screenshot first:** build `gisday-angular --configuration local`, serve it as the Texas A&M site
   (`scripts/gisday-local.sh web --static --site tamu`, which needs the local `db`, `restore` and `api` steps first; see
   `docs/gisday-local.md`; no sign-in is needed for the home page) and photograph the home page around Explore Events, desktop
   width, into `docs/screenshots/2431-gisday-tamu-home-links/before-tamu-home.png`, and txgisday.org's (port 4202) as
   `before-txgisday-home.png`.
3. **Red first:** a test that the `tamu` site's home page shows none of the three links and txgisday.org's shows all three (the
   site specs in `libs/gisday/platform/ngx/common/src/lib/site/` and the landing component show how sites are set in tests).
4. **The change:** a site feature (for example `homeLinks`) in `libs/gisday/common/src/lib/sites.ts`, left out by the `tamu` site
   only, and the three links shown only where it is on (`siteHas`, no new styles).
5. The "after" screenshots the same way (`after-tamu-home.png`, `after-txgisday-home.png`), and the release-notes entry
   `docs/releases/unreleased/2431-gisday-tamu-home-links.md` with them and a What to test row; run
   `node scripts/collate-release-notes.mjs --check`.
6. `scripts/check-in-volume.sh feat/2431-gisday-tamu-home-links` must exit 0 (it includes the production build and its budgets;
   take the screenshots **before** running it, because the production build overwrites the local dist). Commit with `Closes #2431`;
   push to the fork.

Report: branch and head, red then green, the four screenshots' paths, the check's exit code. Nothing on GitHub.

---

## Batch 25 (gisday: #2427, remove the 19 GIS Day files nothing uses, after proving each; a branch; 26 October 2026, 11:20 AM Central, from `work (gisday)`)

After batch 24. About an hour. **The maintainer decided (26 October): remove them in one pull request, once each is shown unused.**
Your own batch 19 report (`copilot-home/reports/2026-10-26-19.md`) lists them: `gisday-platform-ngx-core` 15 (the check-in admin
tree, landing, login, the unrouted not-found and admin route files), `gisday-platform-data-api` 3 (`GeoJsonInterceptor`,
`BaseController` and the like), `gisday-competitions-data-api` 1 (the Wayback module and controller). `scripts/security-tables.sh`
prints the current list.

1. Branch `chore/gisday-remove-unused-files` from the latest `origin/development`.
2. For **each** file, confirm before deleting: nothing imports it (search the whole repository, including `apps/gisday-*`, routes
   built from strings, lazy `loadChildren`/`loadComponent`, `index.ts` exports used elsewhere, and specs); list the evidence per
   file in the report. If any file is in doubt, leave it and say why.
3. Delete them and any now-empty folders and index exports; nothing else.
4. Prove nothing broke: `scripts/check-in-volume.sh chore/gisday-remove-unused-files` (the **full** affected check, since this is a
   cleanup, not a bug fix) must exit 0, which includes the `gisday-angular` production build; and build `gisday-angular --configuration
   local` and confirm in a headless browser that the public routes in `test/e2e/gisday/routes.ts` still load (no sign-in needed).
5. Commit with `Closes #2427` (part of #2122); push to the fork.

Report: branch and head, the per-file evidence, anything kept and why, the check's exit code and the routes result. Nothing on GitHub.

---

## Batch 24 (gisday: #2426, a resized speaker photo must never be larger than the upload; a branch; 26 October 2026, 11:20 AM Central, from `work (gisday)`)

After batch 23. Low priority; about 45 minutes. Questions to `work (gisday)`.

[#2426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2426): `fitImage` (from #2352, PR 2382) scaled a
2400 x 1600 PNG of 386,977 bytes down to 1260 x 840 and stored **583,170 bytes** (`home/reports/2026-10-26-2.md`). It keeps the
original bytes when smaller only for an image it does not scale.

1. Branch `fix/2426-gisday-photo-never-larger` from the latest `origin/development`, beside `C:\TAMU\copilot-home`.
2. **Red first:** a spec with a photographic PNG without transparency (generate one in the test, about 2400 x 1600) that is stored
   larger than it was uploaded today; and one with transparency. Prove the first red.
3. **The fix:** after scaling, encode JPEG at the chosen quality when the image has no transparency, PNG when it does, and keep
   whichever of the candidates is smallest; if the original already fits the size bounds and is smaller than every candidate,
   keep the original. `fit-speaker-photos` (the script for photos already stored) must follow the same rule, so a re-run never
   grows a file (add a spec for that too). Keep the decompression-bomb guard first, unchanged.
4. Green; the bug-fix check (`scripts/check-in-volume.sh fix/2426-gisday-photo-never-larger gisday-platform-data-api,gisday-nest`)
   must exit 0. Commit with `Closes #2426`; push to the fork.

Report: branch and head, red then green, before and after byte sizes for the test PNG, the check's exit code. Nothing on GitHub.

---

## Batch 23 (gisday: #2422, adding a speaker shows a broken image before a photo is chosen; a branch; 26 October 2026, 10:00 AM Central, from `work (gisday)`)

Your first GIS Day batch. Medium priority; about 45 minutes. Questions go to `work (gisday)` under **Questions for the director
(gisday)**.

[#2422](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2422): in Admin, Speakers, Add, the photo area
shows a broken image with the alt text "Speaker photo preview" before any photo is chosen.
`libs/gisday/platform/ngx/common/src/lib/modules/forms/components/speakers/speaker-add-edit-form/speaker-add-edit-form.component.html`
always draws `<img [src]="speakerPhotoUrl$ | async">`, and on a new speaker `speakerPhotoUrl$` gives nothing (or `null` after Undo).

### What to do

1. Branch `fix/2422-gisday-speaker-photo-preview` from the latest `origin/development`, in a worktree beside `C:\TAMU\copilot-home`.
2. **Red first:** a component spec (the file has one beside it, or add one the way the neighbouring form specs do) that renders the
   form in its create state with no file and asserts there is **no `img` with an empty or missing `src`**, and that the
   placeholder shows instead; then that choosing a file shows the preview, and Undo brings the placeholder back. Prove it red.
3. **The fix:** draw the preview only when there is a URL; otherwise show the site's existing placeholder image (the
   `images/placeholder.svg` that speakers without photos already use; find how other components reference it) or nothing, keeping
   the class banner's layout. **Reuse what exists: no new one-off styles** (CLAUDE.md, "Reuse before building").
4. `scripts/check-in-volume.sh fix/2422-gisday-speaker-photo-preview gisday-platform-ngx-common,gisday-angular` (the bug-fix form)
   must exit 0. Commit with `Closes #2422`; push to the fork.
5. **No screenshots needed from you:** the form is behind sign-in, which this machine does not do. Say which local route and state
   show the change, and the director takes the before and after photos on a signed-in machine.

### Then

Report `copilot-home/reports/<yyyy-mm-dd>-<n>.md`: branch and head, red then green, the check's exit code. Nothing on GitHub; the
director opens the pull request.

---

## Batches 20, 21 and 22 (security: #2122 - remove what nothing builds, tests or ships; three branches; 26 October 2026, about 7:30 AM Central, from `work (security)`)

**The maintainer decided (26 October): remove all three, each as its own branch and pull request.** Your batch 19 is the
evidence. Do them in order; each is a branch from the latest `origin/development`, pushed to `fork`, with a `.pr-body.md`
draft as its last commit (title `chore(<project>): ...`; the director opens the PR and files its issue).

- **Batch 20, branch `chore/remove-signage`:** delete `signage-angular` and its five libraries; remove them from
  `tsconfig.base.json` paths, the `EXCLUDED_PROJECTS` lists in `build.yml`, `lint.yml` and `test.yml`, and anywhere else
  that names them; `@angular/platform-browser-dynamic` goes too if nothing else imports it.
- **Batch 21, branch `chore/remove-gisday-competitions-apps`:** delete the apps `gisday-competitions-angular` and
  `gisday-competitions-nest` **only**. Their libraries stay: `gisday-angular` and `gisday-nest` use them. Same clean-up of paths and
  lists.
- **Batch 22, branch `chore/remove-unused-libraries`:** delete `libs/geoprocessing/v4` and `libs/maps/feature/feature-highlight`
  and their paths.

For each: `git grep` for every name afterwards (none may remain outside `docs/releases/`), then
`bash scripts/check-in-volume.sh <branch> all` must exit 0. In the report: what was deleted, the grep, the exit code and the
pushed commit (`git ls-remote fork`). Push `copilot-home: batch <n> done - ...` after each.

## Batch 19 (security: #2122 - evidence for each file knip calls unused; read only; 26 October 2026, about 7:10 AM Central, from `work (security)`)

Do this after batch 18. Knip, configured with each project's entry points in PR 2389, reports about 40 files as unused on
`origin/development`. **Before anyone deletes them, each one needs evidence.**

1. Worktree at the latest `origin/development`. Run knip as the repository configures it (PR 2389), in a `node:24.22.1`
   container, and save its list of unused files.
2. For each file, look for anything knip cannot see: a path string in a `project.json`, a jest or vite config, a lazy or
   dynamic `import()`, a template or stylesheet reference, a script under `scripts/` or `.github/`, a `docs/` page that tells
   people to run it.
3. Report one table: file, project, **verdict** (`unused`, `used by <what>`, or `unsure: <why>`), and the evidence. Group by
   project. End with which projects would lose every file (a hint the whole project may be dead) and **Questions for the
   director (security)**.

Read only: no branch, no pull request. Report `copilot-home/reports/2026-10-26-19.md`, then `copilot-home: batch 19 done - ...`.

## Batch 18 (security: a check that the restarted agent-runner works; read only; 26 October 2026, about 7:10 AM Central, from `work (security)`)

A short test, so the maintainer can see you running before he leaves for the day.

1. Push `copilot-home: started batch 18` (and `tools/heartbeat.sh copilot-home "running batch 18" 30`).
2. On the latest `origin/development`, in a `node:24.22.1` container, run `npm audit --package-lock-only --json` and
   `npm audit --package-lock-only --omit=dev --json`; record the counts by severity for each.
3. Run `npm view fast-uri time --json` and `npm view serialize-javascript time --json`; record the newest version of each and
   when it was published, in US Central (convert with PowerShell, as CLAUDE.md says).
4. Write `copilot-home/reports/2026-10-26-18.md` with the commit of `development` you used, the two tables and the two
   versions, then push `copilot-home: batch 18 done - <counts>`. Then go straight on to batch 19.

## Batch 17 (security: #2122 - the cosmetic leftovers your batch 13 found after PRs 2383 and 2386; a branch; 25 October 2026, about 10:25 PM Central, from `work (security)`)

**Start after batch 16**, in number order as before. **Expected: 30 minutes.** Your batch 13 review is good. Finding 1 (`session/expired` in UES Operations' front
end) is the AggieMap lead's decision; **do not touch it**. Do findings 2 and 3 only:
1. Branch `chore/2122-stale-references` from `origin/development`.
2. `nx.json` line 247: remove `"libs/oidc/client/**/*"` (the folder is gone). `libs/common/ngx/auth/README.md` line 65 and `libs/common/types/src/lib/auth-types.ts`
   line 3: point at `@tamu-gisc/common/types`, not `libs/oidc/client`. `tools/security-findings/README.md` line 97: `better-sqlite3` is gone (PR 2386); reword or drop
   the line, and check the rest of that README for `better-sqlite3`. Leave `.gitignore`'s `oidc-client-config.*` (a deploy machine may still hold one).
3. `bash scripts/check-in-volume.sh chore/2122-stale-references`. Commit (`chore(workspace): Drop references to libraries and packages that are gone`, `Part of #2122`,
   Co-Authored-By), push to `fork`. No PR.

## Batch 16 (security: #2388 - the two workflow script injections, and actionlint on PRs; a branch; 25 October 2026, about 8:10 PM Central, from `work (security)`)

**Start after batch 15**, and keep going in number order as before. **Expected: 60 minutes.** Your batch 8 report is good: thank you. **Two corrections:**
its finding 1 is wrong: `.github/dependabot.yml` already has a `github-actions` ecosystem (line 126; you read only the first 30 lines). And the release-age rule
is **7 days** now, not 14 (#2333). Your branch is PR 2387.
1. Branch `ci/2388-workflow-injection` from **`fork/ci/2335-least-privilege`** (it builds on your pins).
2. In `main.yml` and `build.yml`, pass `github.ref_name` and `github.head_ref` (and any other `${{ github.* }}` or `${{ inputs.* }}` used inside a `run:` script)
   through `env:`, and use `"$VAR"` in the script. Search all 14 workflows for the same pattern.
3. Add a check, in `tools-tests.yml` or a new small workflow on `pull_request` paths `.github/workflows/**`: `actionlint` from a pinned image (by digest), failing
   on any finding. It must pass on the branch (red first: run it on `fork/ci/2335-least-privilege` and record its warning).
4. `bash scripts/check-in-volume.sh ci/2388-workflow-injection`. Commit (`Closes #2388`, Co-Authored-By), push to `fork`. No PR.

## Batch 15 (security: #2341 - plan the move to PublishPipelineArtifact for release builds; read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 14**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `templates/jobs/build.yml` publishes release builds with `PublishBuildArtifacts@1` (8 to 9 minutes for `development`); `PublishPipelineArtifact@1`
is faster. Release definition 13 ("AggieMap") takes the build artifact `js-monorepo-<buildType>`. From Microsoft's documentation and this repository's
pipeline files: what changes in `build.yml`, what the maintainer must change in the classic release's artifact source, how to switch without a gap (both
for one build?), and how to check one release end to end on dev. A plan only; no edits, and no Azure DevOps calls.

## Batch 14 (security: #1896 - Geoservices' response viewer and partner page: the evidence for removing them; read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 13**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `ResponseViewerComponent` is used only inside commented-out blocks in four Geoservices API pages (address-processing,
census-intersection, geocoding, reverse-geocoding), and the partner page and form are not routed (lab report 2026-10-25-135). For each: every reference,
its history (`git log -S`), what it was for, and whether anything outside comments uses it. List exactly what a removal would delete. No edits; the decision
is the maintainer's.

## Batch 13 (security: a second review of PR 2383 (UES Operations API and openid-client deleted); read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 12**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 30 minutes.** Review PR 2383 against `origin/development`: anything still importing from the deleted `libs/oidc`, `libs/ues/common/nest` or the
removed `libs/ues/common/ngx` auth folders; `tsconfig.base.json` paths left pointing at deleted folders; workflow, `nx.json` or `azure-pipelines.yml` references
to `ues-operations-nest`; and whether `ues-operations-angular` (which stays: it is deployed) still builds without what was removed. Report findings with file
and line. No edits.

## Batch 12 (security: a second review of PR 2386 (unused dependencies removed); read only; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 11**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 30 minutes.** Review PR 2386 (`fork/chore/2122-remove-unused`) against `origin/development`: for each removed package, search the whole
repository (code, configs, workflows, Dockerfiles, `project.json`, Jest and Vitest configs, ESLint configs) for anything that loads it by name, including
`require`, dynamic `import()`, plugin strings and presets. The lab found one removal wrong (`@eslint/js`, needed by `@nx/eslint-plugin` without being declared);
look for any other such case. Report each package: safe, or not and why. No edits.

## Batch 11 (security: #2351 - the raster basemap view-limit test that fails everywhere; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 10**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 60 minutes.** `test/smoke/aggiemap/services.spec.ts`, *campus basemap services › the view limit matches the raster basemap cache*, fails on
production and dev alike: *the raster basemap service was not found in basemaps.definition.ts*. Find where the raster basemap is defined now (see #1700),
and make the test read it from there; if the view limit no longer depends on it, say so and propose removing the check instead. Prove it with
`bash test/smoke/aggiemap/run-local.sh production one "view limit matches"` (red before, green after) - this needs Docker and reaches the public production
site, read only. Branch `fix/2351-raster-basemap-test`. Commit (`Closes #2351`, Co-Authored-By), push to `fork`. No PR.

## Batch 10 (security: #2379 - the logo upload-limit test that times out under load; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 9**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 45 minutes.** `libs/gisday/platform/data-api`'s *OrganizationController upload limits: answers 413 for an organization logo over the shared
file-size limit* posts 5 MiB to a real local Nest server under Jest's 5-second default; under the full check's load it took 5,248 ms and failed. Branch
`fix/2379-upload-limit-timeout` from `origin/development`: give that spec (and any sibling upload-limit specs) an explicit timeout that fits a 5 MiB upload,
or make the oversized body cheaper (a stream that is cut off past the limit), so it cannot sit on the edge. Run the spec 10 times under load (for example
alongside two other projects' tests) and report the times. `bash scripts/check-in-volume.sh fix/2379-upload-limit-timeout gisday-platform-data-api`. Commit
(`Closes #2379`, Co-Authored-By as above), push to `fork`. No PR.

## Batch 9 (security: #2385 - give knip a configuration with each project's entry points; a branch; 25 October 2026, 7:47 PM Central, from `work (security)`)

**Start after batch 8**, and keep going: **do the batches in number order without waiting to be asked**, pushing a report and a status line after each. **Expected: 2 hours.** knip 6.42.0 (pinned; the newest release at least 7 days old) flags every app's `main.ts` as unused because it does not find the Nx projects'
entry points (lab report 2026-10-25-135 on this branch). Branch `chore/2385-knip-config` from `origin/development`: a root `knip.json` naming each project's
entries (apps' `main.ts`, the `project.json` targets' files, `tools/**`, `scripts/**`, Jest and Vitest configs), or knip's Nx plugin if it covers our executors.
Prove it: rerun knip; sample 20 of what it still calls unused files and say for each whether it really is. **Change no package.json or lock** (no package
removals here). `bash scripts/check-in-volume.sh chore/2385-knip-config`. Commit (`chore(workspace): Configure knip with each project's entry points`,
`Part of #2385`, `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to `fork`. No PR.

## Batch 8 (security: #2335 - what every CI token can reach; read only, a report; 25 October 2026, 9:12 AM Central, from `work (security)`)

**Start after batch 7.** **Expected: 90 minutes.** Read `.github/workflows/*.yml`, `azure-pipelines.yml`, `templates/**`, `tools/build-agent/**` and
`publish.yml`'s registry steps. For each workflow and job: its `permissions:` (or the default it gets), its triggers (flag `pull_request_target` and
`workflow_run`), the secrets it reads, and the third-party actions it uses with how each is pinned (tag or commit SHA). For Azure Pipelines: what the
pipeline's own files say about fork builds and secrets. **Do not** call any admin API, read any secret, or change a setting; what only an admin can
see, list as a question. Report a table and, for each, the least it needs. Then a branch `ci/2335-least-privilege` with only the safe file changes
(`permissions: contents: read` defaults, per-job widening, SHA pins with the tag in a comment), `bash scripts/check-in-volume.sh <branch>`, push to
`fork`. No PR. Never print or write a token.

## Batch 7 (security: #2334 - which behaviour-based malware scanner, if any; read only, a report; 25 October 2026, 9:12 AM Central, from `work (security)`)

**Start now** (after you restart). **Expected: 60 minutes.** Research and compare what scans npm dependencies for malicious behaviour (not only known
advisories), for a **public** GitHub repository: for example Socket, Aikido, Phylum, and OSV-Scanner with the OpenSSF malicious-packages data. For
each: cost for a public repository, what it checks (a pull request's lock changes, a daily scan), how it reports (a check, a comment), what it needs
(a GitHub App and its permissions, a token), how noisy it is by its own docs, and how it would fit `lint.yml` and the daily security scan we already
run (`tools/security-findings/`). Recommend one or none, with reasons. Report only: no branch, nothing installed.

**Batch 6 is withdrawn** (chart.js 4 has merged, PR 2332). Batches 4 and 5 still stand; do them after 7 and 8.

## Batch 6 (security: #1218 - a second review of the chart.js 4 branch; read only; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start after batch 5.** **Expected: 30 minutes.** Review `fork/chore/1218-chart-js-4` against `origin/development` (three-dot, as before).
It moves `chart.js` 2.9.4 → 4.5.1 (pinned `~4.5.1` because 4.6.1 was days old), drops `chartjs-plugin-colorschemes` (its palette re-implemented as
`applyChartColors` in the charts library's container), `@types/chart.js` and `moment`, and registers only the chart pieces each component uses.
Look for: charts that would lose a scale, legend, tooltip or title because it was not registered; colour rules that differ from the old plugin's
(read the plugin's source in `node_modules` on `development`); anything else still importing `moment` or `chartjs-plugin-colorschemes`; and the
lock beyond those packages. Check every published date against the 14-day rule. Report only.

## Batch 5 (security: #2311 - remove the deprecated @types/bull stub; a code job and a branch; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start after batch 4.** **Expected: 30 minutes.** `@types/bull` is a deprecated stub ("bull provides its own type definitions"); the repository
installs `bull` 4.16.5, which ships its own types. Dependabot's PR to bump it was closed in favour of removing it (#2311).
1. Branch `chore/2311-remove-types-bull` from `origin/development` in a worktree `C:\TAMU\copilot-home-bull`.
2. Remove `@types/bull` from `package.json`'s `devDependencies`. **The lock: delete its entries, do not regenerate it**: remove the
   `node_modules/@types/bull` key (and any key nested under it) from `package-lock.json` with a small script, then in Docker
   `docker run --rm -v <worktree>:/w -w /w node:24.22.1 npm install --package-lock-only --ignore-scripts`. Compare the lock with
   `origin/development` key by key: only `@types/bull` (and anything only it needed) may disappear; no other version may change. Report the list.
3. `git grep` for anything importing types from `@types/bull` or relying on it (`/// <reference types="bull"`), and fix any to `bull`'s own.
4. `scripts/check-in-volume.sh chore/2311-remove-types-bull` with Git Bash (full affected; it builds every API that uses `bull`). Commit
   (`chore(workspace): Remove the deprecated @types/bull stub`, `Closes #2311`, `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to
   `fork`. No pull request.

## Batch 4 (security: #1218 - a second review of the got 16 branch; read only; 24 October 2026, 6:50 AM Central, from `work (security)`)

**Start now.** **Expected: 30 minutes.** Your batches 1 to 3 were good: your `marked` age finding is applied (PR 2314 pins 18.1.0), your README fix is
PR 2305, and your `ngx-datatable` empty-row finding goes to the lab's next batch. Answers: batch 2's question 1 **(a), leave line 256**; batch 3's
question about the themes: **leave it**. Review `fork/chore/1218-got-16` against `origin/development` (three-dot). It moves `got` 11 → 16.0.0
(ESM-only; Node 24's `require(esm)` loads it from our CommonJS bundles), adds behaviour specs with stand-in servers for the three mail calls, and
moves the mailroom helper's upload to the platform `FormData`/`Blob`. Look for: anything that changes what the three calls send or how they handle
errors (the specs record today's behaviour, so read them against the code); the `Blob` built from `file.buffer` (a copy, not a view?); ESM loading
in the production bundles (`webpack` output); and the lock beyond `got`'s own tree. Check `got` 16.0.0's publish date against the 14-day rule.
Report only.

## Batch 3 (security: #1218 - a second review of the ngx-datatable 25 branch; read only; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start after batch 2.** **Expected: 30 minutes.** The same kind of review as batch 1, for `fork/chore/1218-ngx-datatable-25`
(`@swimlane/ngx-datatable` 20 → 25; AggieMap's building directory and GIS Day's submission review list; the two components' shared
table styles moved to `libs/sass/components/_datatable.scss`). Diff it against `origin/development`; ignore what is already on
`development`. Look especially for: inputs or outputs removed in 21 to 25 that our two templates still bind; styles that no longer reach
25's markup (it lays the table out with CSS grid); and anything in the lock beyond `@swimlane/ngx-datatable`. **Do not edit, commit
or push code.** Report findings with file, line and how sure you are.

## Batch 2 (security: can this machine run the repository's checks, and a small real fix; a branch; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start after batch 1.** **Expected: 45 minutes.**

1. **Docker:** in Git Bash, `docker version` and `docker run --rm node:24.22.1 node --version`. Report both. If Docker is not running
   or your account cannot use it, say so and stop step 3's check (do the edit, push, and say the check was not run).
2. **The fix:** `tools/build-agent/README.md`'s "Guard rails" section still says the agent runs with `--memory 24g --cpus 16`. The
   scripts and the README's own "How many agents fit" section say **12 GB and 5 CPUs** since #2252 (four agents on the lab). Make
   "Guard rails" match, and check the rest of the README for any other 24g / 16 / three-agent wording that #2252 made stale. Change
   nothing else. Branch `docs/build-agent-readme-sizes` from `origin/development`.
3. `bash scripts/check-in-volume.sh docs/build-agent-readme-sizes` from Git Bash in `C:\TAMU\copilot-home` (commit first; it checks
   only what is committed). It should exit 0 with *No tasks were run* (the README belongs to no project) and then run the smoke
   suite's typecheck. Report its exit code and last lines.
4. Commit (`docs(workspace): Give the build agent's guard rails its current size`, a short body, and the line
   `Co-Authored-By: GitHub Copilot <noreply@github.com>`), push to `fork`. **No pull request**; the director files the issue and
   opens it.

## Batch 1 (security: #1218 - a second review of the marked 18 branch; read only; 24 October 2026, 6:20 AM Central, from `work (security)`)

**Start now.** **Expected: 30 minutes.** The director prepared `fork/ready/1218-marked-18` (commit `088b31413`) and will open its pull
request when the lock queue reaches it. You are the second pair of eyes before it goes.

1. `git fetch origin development` and `git fetch fork ready/1218-marked-18`, then review `git diff origin/development...fork/ready/1218-marked-18`.
   **Ignore anything already on `development`**: the branch carries merges, so read the three-dot diff.
2. What it does: the npm package `marked` 9 → 18 (ESM-only from 12; `marked()` is typed `string | Promise<string>` in 18). The markdown
   pipe, `libs/common/ngx/pipes/src/lib/parsing/markdown-parse.pipe.ts`, calls `marked(value, { async: false })` and returns a plain
   string, so Angular's `[innerHTML]` sanitises it (#2258 made that change; keep it). One Jest config,
   `libs/gisday/platform/ngx/core/jest.config.ts`, adds `marked/` to `transformIgnorePatterns`.
3. Look for: bugs; anything that weakens the sanitising (the pipe must not return trusted HTML); callers of the pipe that could break
   on the return type; other places that import `marked`; and lock-file changes beyond `node_modules/marked` itself.
4. **Do not edit, commit or push code.** Write the report with each finding's file, line, what you think is wrong, and how sure you are
   (certain / likely / a question). "No findings" is a fine answer if that is what you find; say what you checked.
