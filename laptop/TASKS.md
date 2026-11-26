# Laptop: current tasks

## Batch s10 (security: ArcGIS `@arcgis/core` 5.1.27 to 5.2.9, with amCharts 5.18.0 to ~5.20.8, in one change; 26 November 2026, from `work (security)`) - **after g45**

**The maintainer has stopped new GIS Day and AggieMap work so the machines can take the modernization plan.** He approved this as **one hand-made pull request moving `@arcgis/core` and `@amcharts/amcharts5` together.**
- **Why by hand:** `@arcgis/core` 5.2.x needs amCharts `~5.20.8`. We pin amCharts 5.18.0, and `.github/dependabot.yml` ignores amCharts outright, which #3288/PR 3291 did because a newer amCharts installed a second copy. So Dependabot cannot propose this at all.
- Branch `chore/arcgis-5.2` from the latest `development`. Move `@arcgis/core` to 5.2.9, or the latest 5.2.x at least 7 days old, and amCharts to what it requires. **Exactly one copy of amCharts must remain in the lock**: prove it with `npm ls @amcharts/amcharts5`. Move `@esri/calcite-components` too if `@arcgis/core` requires it.
- **Keep or adjust the amCharts `ignore` in `dependabot.yml`**, with its comment saying why. If the ignore can become "move together with `@arcgis/core`", say how.
- **Update `docs/upgrades/README.md`:** the ArcGIS row, a row in "How we got here", and its blocked mark removed.
- Run the full check with a clean `npm ci`, then **the smoke suite's release tier against your local dev server** (`run-local.sh local release`). Every map draws from ArcGIS. Before and after screenshots of the main map, one event map and the GIS Day RSVP chart (amCharts) go to `docs/screenshots/arcgis-5.2/`.
- Push; "branch ready" with `.pr-body.md`; `Closes #ARCGIS`, which the director fills in. **This one is visible, so it needs a release-notes entry file and the images.**
Report `laptop/reports/2026-11-26-s10.md`.


## Handed over (26 November 2026, from `work (gisday)`)

**The maintainer has put GIS Day on hold.** The machines focus on upgrades, directed by the security chat. Every batch below marked "from `work (gisday)`" that is not finished now belongs to **the security chat**. Send its reports and questions there, not to `work (gisday)`. No new GIS Day batches will come until the maintainer restarts them.

## Batch g45 (workspace: #3718, strict-library pull requests stop invalidating each other's counts; after g44) (High)

**The maintainer, 26 November:** the machines focus on infrastructure for a while. #3718 is why today's strictness pull requests had to be rebuilt again and again. Its body gives the three changes:
- count only errors in a library's own files;
- keep each library's count beside its own `tsconfig.lib.json`, not in one shared list;
- a library that becomes clean is a notice, not a failure.

1. Branch `fix/3718-strict-lib-counts` from the latest `development`.
2. Change `scripts/check-strict-libs.mjs` and its tests (`scripts/check-strict-libs.test.sh`), red first for each rule. Migrate today's `scripts/strict-lib-errors-known.txt` into the new places, re-measuring each library by the own-files rule, then delete the shared file. Update anything that names it (CLAUDE.md, docs).
3. **Prove the point** in the report: two branches each changing a different strict library, merged in either order, both checks passing, with no re-count.
4. `scripts/check-in-volume.sh fix/3718-strict-lib-counts` (affected). Read the `Exit` line.
5. Draft `.pr-body.md` from the template as the last commit. Push. No pull request: I open it, from your branch.
6. Report `reports/<date>-g45.md`.

## Batch g44 (gisday: wrap-up after today's merges; 26 November 2026, from `work (gisday)`) (High) - **now**

**The maintainer:** wrap up what's in flight, start nothing new, and log issues for anything found. This batch is wrap-up only. File an issue for anything wrong (fields as CLAUDE.md says, Priority by estimate), and don't fix it.

1. **Your health reading (#3708).** Run `tools/machine-health.sh laptop` from the mailbox checkout. Commit `laptop/HEALTH.json`. Put `tools/health.sh`'s laptop row in the report. Fix nothing it shows: list anything amber or red.
2. **Your leftovers from g41:**
   - **`wt-3327`'s four untracked screenshots** (`docs/screenshots/3327-form-data-false-values/`). PR 3349 merged without them. Compare them with the images PR 3349's body links. If they're the same captures, or older ones, delete the worktree and branch, recording the tip. If they're different and better, keep them and say so.
   - **`fix/3593-competitions-ngx-core-strict`:** its pull request (3642, opened from a `-pr` copy) merged. If every file it touches has been in `development` at some point, delete it and record the tip. Otherwise keep it and list the files.
3. ~~Today's GIS Day merges, signed in~~ **dropped:** the maintainer is holding GIS Day work while the machines do infrastructure (26 November, 1:15 PM).
4. Report `reports/2026-11-26-g44.md`.
## Batch a62 (aggiemap: #3722, the phone accessible-toggle check never reaches the phone; 26 November 2026, from `work (aggiemap)`) (High) - **medium**

**This is yours because it needs a phone-sized window, and the lab could not make one.** It is one of three fixes
blocking the dev tag, and the tag is blocking the lab's release tier. a62 sits behind your queued security work; take it
next.

### What it is

`development-only.spec.ts:268` opens `/map/m/trip` and looks for `#direction-accessible-mode`. It times out at **120 s
on all three attempts** — about six minutes of the quick run on its own.

The lab's diagnosis, which I am passing on rather than vouching for: **a wide window is redirected from `/map/m/trip` to
`/map/d/trip`**, so the phone template that holds the toggle never loads, and the failure screenshot shows the desktop
planner. The check came with #3468's fix (`ea941e9dc`, PR 3529), after the last tag, so this was its first deploy.

### The part that is actually open, and must not be assumed

**Nobody has confirmed the phone layout offers the toggle at all.** The lab said so plainly: *"Not verified: whether the
phone layout itself offers the toggle on dev."* So there are two possibilities and they need different fixes:

- **The check is wrong** — it must set a phone viewport before navigating. Then the fix is the check.
- **The application is wrong** — the toggle is missing from the phone template too. Then the check was right to fail,
  and the fix is in `libs/`, with before/after images and a release-notes entry.

**Settle that first, in a real phone-sized window, before changing a line.** Tell me which it is.

### What to do

1. **Open `/map/m/trip` on development at phone width** (375 px) in a real browser and say whether
   `#direction-accessible-mode` is there.
2. **If the check is at fault:** set a phone viewport in the spec before navigating, and prove it — red against the
   current check, green after. Quote both.
3. **Say why 120 seconds**, not 30. A selector that is simply absent should fail fast; three two-minute timeouts cost
   six minutes of a six-to-ten minute tier. If it is waiting on a navigation rather than a selector, that is worth its
   own line in the report.
4. **Check the sibling cases.** If this one navigates to `/map/m/...` without setting a viewport, others may too, and
   they would be passing only because they do not look for anything phone-specific. Name any you find; do not fix them
   here.

### Scope

`no-visible-change` **if** the fix is in the check. **If it turns out to be the application, stop and tell me** —
that is a different pull request with images, and the maintainer decides whether it rides with this one.

**Branch** `test/3722-phone-trip-viewport` from the latest `development`, pushed to the fork. `check-in-volume.sh`,
then **`pre-pr-check.sh`**, and give me its last line. Body text in the report with a `Title:` line. **Open no pull
request.**

**Report** `laptop/reports/2026-11-26-a62.md`. Questions `Q-a62-<n>`.

## Batch s9 (security: #3727, Socket's 13 findings, highest severity first; 26 November 2026, from `work (security)`) (Medium) - **now**

**The maintainer's decision:** all 13 get handled, not just the severe ones, highest severity first. [#3727](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3727) has the table with what the director has already traced. Read it to the end. Each row ends either as a **branch** or as a **written reason**, posted as one comment on #3727 per row.

**Don't touch:** `home` is running s83 (removals of `ng-packagr`, `webpack-cli`, `@typescript-eslint/utils` and `@angular/platform-server`, for #3719, #3725 and #3726). Don't build on those branches. Expect a lock conflict with them when merging, and follow CLAUDE.md's rule for regenerated locks.

In order:
1. **`es-toolkit` (rows 1 to 3, 1 High and 2 Medium).** Find the version that fixes each of the three. Socket's alert pages and es-toolkit's GitHub releases and changelog are where to look; GitHub's advisory database has none. If 1.53.2 (6 November) fixes all three and is within `@esri/calcite-components`' `^1.39.8`, make it a lock-only update: branch `fix/3727-es-toolkit`, `npm update es-toolkit --package-lock-only --ignore-scripts`. The lock diff may move only `es-toolkit`. If no released version at least 7 days old fixes them, say so and stop that row: security fixes are the exception to the 7-day rule, but the director decides that.
2. **`minimatch` (row 4).** Find what pulls in 10.2.5 (`npm ls minimatch`). Move that parent up, or use an `overrides` entry to 11.0.1+ **only if** the parent accepts it. Branch `fix/3727-minimatch`. If either needs a major change of a parent, list the options and stop.
3. **`countries-and-timezones` (row 5).** Confirm who `jcfranco` is: the npm profile, the GitHub account, and whether they belong to the Calcite/`timezone-groups` organization. Also diff 3.10.0 against 3.11.0 for anything that isn't data: install scripts, network calls, obfuscated code. Report what you found. Nothing to build.
4. **`@vaadin/vaadin-usage-statistics` (row 6).** Which of our packages pulls in `@vaadin/component-base`? Does any production bundle contain the statistics code, and would it send anything from a production host? Its install script is already refused. Report, with the evidence.
5. **`cron-parser` and `node-abort-controller` (rows 7 and 8).** What would replacing or upgrading `bull` and `fork-ts-checker-webpack-plugin` take? Give options and a recommendation. Don't build it.
6. **`@yuku-core/*` (rows 9 to 13).** Which of our tools needs `yuku-parser`, and is it still used? Report.

For each branch: a clean `npm ci` and a **full** check (`scripts/check-in-volume.sh <branch>`), push it to the fork, then say "branch ready" with the PR body drafted from the template in `.pr-body.md` (`Closes` nothing: #3727 stays open until every row is done; write `Part of #3727`). There is no visible change.
Report `laptop/reports/2026-11-26-s9.md`, with **Questions for the director (security)**.

## Batch g43 (gisday: finish #3668's branch, guards on the last 3 routes; 26 November 2026, from `work (gisday)`) (High) - **now**

**The maintainer's decision on Q-g224-1: (a).** Guard the 3 routes still open with the existing admin-only account permissions: `create:users` for adding, `delete:users` for deleting (and `create:users` for any update). Nothing changes in Auth0. He'll decide later under #1899 whether to remove them.

**Don't open a pull request.** The maintainer wants the open ones merged first. Push the branch and report; I open it when he says.

1. Work on the lab's branch `fix/3668-gisday-write-route-guards` (on the fork, `69283c8a0`), in its own worktree. Merge the latest `development` into it.
2. **Find the 3 routes:** the write routes (`@Post`, `@Patch`, `@Put`, `@Delete`) in `libs/gisday/platform/data-api` with no `JwtGuard` and `PermissionsGuard`. They're in the two controllers for what a new account is asked when it signs up. The lab's g224 report (`work-lab-leila/reports/2026-11-25-g224.md`) describes them without naming them. **Don't write the routes into the mailbox or onto GitHub.** The code will show them when it merges, and that's fine.
3. Add `@UseGuards(JwtGuard, PermissionsGuard)` and `@Permissions([...])` to each, as the other guarded controllers on the branch do.
4. **A spec per controller, red first,** in the style of the lab's specs on the branch: no permission gets `403` and the provider isn't called; with the permission, the route reaches the provider. Watch each fail on the unfixed code.
5. `scripts/check-in-volume.sh fix/3668-gisday-write-route-guards gisday-platform-data-api,gisday-nest`. Read the `Exit` line.
6. Update `.pr-body.md`: every route on the list is now guarded, so `Closes #3668` is true. Keep it as the last commit. Push.
7. Report `reports/2026-11-26-g43.md`: guards added (by count), tests red then green, the exit code. No route names.
## Batch g42 (gisday: open the three finished branches as pull requests; 26 November 2026, from `work (gisday)`) (High) - **now**

**The maintainer's decision (10:50 AM, 26 November):** the work is done and only needs pull requests, and you open them. Everything in flight gets settled, opened and merged before the backlog starts again. In this order:

| Order | Issue | Branch on the fork | Notes |
| --- | --- | --- | --- |
| 1 | #3668 (High, security) | `fix/3668-gisday-write-route-guards` (the lab's g224) | `no-visible-change`. **In prose, say only "the routes #3668 names".** The diff shows them, and that's fine |
| 2 | #3635 | `fix/3635-rsvp-submission-type-routes-img` (your g38: code and screenshots) | Visible: before and after images, plus its release entry. **Open from the `-img` branch, then delete `fix/3635-rsvp-submission-type-routes` from the fork**, so one branch maps to one PR |
| 3 | #3667 | `chore/3667-remove-initial-survey` (your g39) | `no-visible-change` (nothing linked the page). The body gives the migration's SQL and its up/down result from g39 |

**For each, the new rule (#3706, PR 3709): no `-pr` copies.**

1. Merge the latest `development` into the branch itself.
2. Take the drafted `.pr-body.md` text, then `git rm .pr-body.md` in a commit on the same branch.
3. Build the body from `.github/pull_request_template.md`, every section filled, with `Closes #<issue>` and nothing else after a closing keyword.
4. Run `scripts/pre-pr-check.sh <branch> '<title>' <body file> [projects] [--label no-visible-change]`. Open only on `Exit 0`, and put that last line in the body.
5. Push, then `gh pr create --repo TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo --base development --head danielgoldbergtamu:<branch>`, ready (not a draft).
6. Fields, as CLAUDE.md's Pull requests section says:
   - assignee `danielgoldbergtamu`;
   - the issue's labels;
   - project **GIS Day Angular + NestJS**, Status **In Progress**;
   - the issue's Status to In Progress.
7. Pin any image link to a commit SHA, and check it answers 200.
8. Delete `.pr-body.md` from the worktree, and remove the worktree.

**Docker:** this machine is yours, but run one check at a time.

Report `reports/2026-11-26-g42.md` with the three pull request links and each pre-pr-check line. I'll check each and hand the maintainer the merge commands.
## Batch g41 (workspace: clean up this machine's branches, worktrees and volumes; 26 November 2026, from `work (gisday)`) (Medium) - **now**

**The maintainer's decision, 26 November:** clean up finished branches on every machine before any new work. The fork
(`danielgoldbergtamu`) has already gone from 625 branches to 30; the record of the ones that were never merged is
#3705. Your clone still has its local copies, worktrees and volumes. This is cleanup, not new work.

1. **Count first:** local branches, worktrees, `tamu-js-*` volumes. Free disk.
2. `git fetch --prune fork` and `git fetch --prune origin`.
3. **Delete a local branch when** its fork branch is gone, or its tip is already in `origin/development`
   (`git merge-base --is-ancestor <branch> origin/development`). **Keep** a branch that has commits on no remote
   (they exist only on this machine): list each in the report with its last commit and one line on what it holds.
   Keep the mailbox branches and `development`.
4. **Remove a worktree** whose branch you deleted, unless it holds changes. A worktree with only a leftover
   `check.out` or a `.pr-body.md` may be force-removed. Anything else uncommitted: keep it and list it.
5. `bash scripts/tidy.sh --yes` for the volumes and merged worktrees.
6. If a safety prompt stops a deletion, don't work around it: stop, write the exact command into the report, and the
   director gives it to the maintainer.
7. Report `reports/2026-11-26-g41.md`: before and after counts, everything kept and why.
## Batch a57 (aggiemap: #3490, the phone's directions use the desktop templates; 25 November 2026, 2:10 PM Central, from `work (aggiemap)`) (Medium) - **now**

**a52 is accepted and open as [PR 3697](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3697) -
and you were right to ask about the issue it names.**

Its body said `Closes #3679`, which I had closed as not-a-fault an hour earlier. `pre-pr-check` accepted it because it
only checks that a closing reference **exists**, not that the issue is open - worth knowing, since that is a gap a
drafted body can walk straight through.

So I filed **[#3696](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3696)**, which states
the thing your work actually fixes: *the routing check never drives into campus, so it would pass if campus roads
stopped being drivable*. The pull request closes that instead, with a short section explaining why #3679 is not the
reference. Attaching this to a retracted non-fault would have put good work behind a wrong record.

**Your red proof is the model.** You could not make it red against production, so you moved the destination into the
core, quoted the real failure three times over, and said that the edit was made after the commit and restored with
`git checkout` with the worktree clean before the body commits. That last sentence is what makes the proof trustworthy
rather than just quoted.

### Why this batch

[#3490](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3490), from the #3062 scan. Two
duplications, and **the second has already drifted**, which is the part that matters:

- `trip-planner-directions-actions`: the base and mobile templates are **byte-identical**; the mobile class only
  re-declares the component, and its stylesheet changes two border colours.
- `trip-planner-directions`: base and mobile repeat the overview and the mode-switch list, and **behave differently** -
  desktop shows actions only `@if (result() && result()?.isFulfilled)`, the phone **always**, with no error and no
  "Calculating route" feedback.

So a visitor on a phone gets no feedback while a route is being calculated, and none when it fails. That is the drift
the duplication allowed, and unifying on the base templates fixes it as a side effect.

### What to do

1. **The base templates win**, with a `layout` input or a host class, as the issue says. Keep the mobile stylesheet's
   two border colours - that is a real difference, not drift.
2. **Decide and state what the phone should now show** while calculating and on error. Taking the desktop's behaviour
   is the obvious answer and is probably right, but it is a **change to what a phone user sees**, so say so explicitly
   rather than letting it arrive as a side effect of a refactor.
3. **The phone's bottom sheet relies on the mobile selectors** - the issue flags this and rates the risk low to medium.
   **Check it on a phone viewport before anything else**, because if the sheet breaks, the whole approach needs
   rethinking rather than patching.
4. **This is a visible change.** Before/after images at phone width **and** desktop, into
   `docs/screenshots/3490-directions-templates/`, and a release-notes entry in
   `docs/releases/unreleased/3490-<slug>.md` with its *What to test on dev* row. Run
   `node scripts/collate-release-notes.mjs --check` before pushing. **Take the "before" first** - including, if you can,
   the phone showing actions while a route is still calculating, since that is the behaviour being removed.

### Not in scope

The **phone mode-picker** fix the issue says could share a pull request. Keep this to directions and
directions-actions: one change per pull request, and the mode picker is its own.

`libs/maps/feature/trip-planner` has two open pull requests, **neither touching these files** - 3653 is
`trip-planner-top`, `-bottom` and `-core`, and 3686 is `bus.service.ts`. If you find yourself in either, stop and tell
me.

**Branch** `refactor/3490-directions-shared-templates` from the latest `development`, pushed to the fork.
`check-in-volume.sh`, then **`pre-pr-check.sh`**, and give me its last line. Body text in the report with a `Title:`
line.

**Report** `laptop/reports/2026-11-25-a57.md`. Questions `Q-a57-<n>`. **Open no pull request.**

## Batch a52 (aggiemap: one drive-into-campus case beside the existing check, from a49; 25 November 2026, 1:35 PM Central, from `work (aggiemap)`) (Low) - **now**

**a49 is the best thing either of us did today, and the error it corrected was mine as much as yours.**

You stopped four minutes in, removed your branch, wrote nothing, and said the premise was wrong. You could have built the
check I asked for - it would have been green, and nobody would have noticed for weeks that it duplicated
`directions.spec.ts:362` and that the Urgent issue behind it was false.

**My part was worse than your a43 framing.** You reported four failing pairs. I then "isolated" the cause on **one**
pair, got "removing `No Drive` makes it solve", and called the restriction broken - the single-sample mistake, done
while correcting someone else's. And **the falsifying number was in my own table**: that solve took 21.9 minutes while
*walking* the same pair took 29.9. A drive that barely beats walking is a car on footpaths, which is exactly what
dropping `No Drive` permits. I printed it and read past it.

I verified your garage figures before acting: University Dr to the Central Campus Garage solves in **2.7 min** by Drive
against 12.7 by Walk, and my old core point still refuses. You are right.

**Done on it:** #3679 is closed as not-a-fault with a full retraction, its priority dropped from Urgent to Low, and the
claim was repeated in two other places I had to fix - PR 3684's body and #3682's body. Nothing asks the GIS team for
anything.

**Q-a49-1 is (a).** Closed, with #3682 named as where the real behaviour lives.

### Q-a49-2 is (a). This batch

One case beside the existing one: **University Dr to the Central Campus Garage**, in the network's own named `Drive`
mode, asserting a route came back.

**Why it is worth adding even though the network is healthy.** The existing check drives University Dr to University Dr,
which never touches a campus road - so it would stay green if every road inside campus stopped being drivable. Your new
case is the one that would go red, and it is the fault #3679 believed it had found. That is a real gap, found by
chasing a non-fault.

### What to do

1. **One case in `directions.spec.ts`**, beside the one at line 362, reading the mode from `supportedTravelModes`
   rather than hard-coding anything. Reuse that spec's existing helpers; do not write a second solve of your own.
2. **Prove the assertion the honest way, as you proposed.** It cannot be red against production, because production is
   healthy. So send the same solve with a stop **inside the pedestrian core**, quote that failure in the pull request,
   and say plainly that this is what the assertion looks like when it fails. A check nobody has ever seen fail is worth
   less than one whose failure has been photographed.
3. **Say in a comment why the destination is a garage** - a point a car can reach - so nobody later "simplifies" it to
   another University Dr pair and silently restores the gap.
4. **Its row in `docs/testing.md`** if it is a new spec file; if it is a case inside an existing spec, the page needs
   nothing. **Leave every count on that page alone either way**, the Total included.

**Do not** add a known-failure entry: there is no failure to tolerate. **Do not** touch the routing network or anything
about `No Drive`.

`no-visible-change`, no images. **Branch** `test/3679-drive-into-campus` from the latest `development` (`2cfb0bc43`),
pushed to the fork. `check-in-volume.sh`, then **`pre-pr-check.sh`**, and give me its last line. Body text in the report
with a `Title:` line.

**Report** `laptop/reports/2026-11-25-a52.md`. Questions `Q-a52-<n>`. **Open no pull request.**

## Batch a49 (aggiemap: a smoke check that solves one drive trip, for #3679; 25 November 2026, 12:45 PM Central, from `work (aggiemap)`) (High) - **now**

**a43 is accepted, and finding #3679 is worth more than the images it cost.** Three things in it did real work:

- **You did not push a thing.** Steps 3 and 4 were impossible, so you left the branch at `a923432c4`, said so, and
  asked. A machine that had produced *something* to fill the gap would have cost more than it saved.
- **"Three of the four new tests fail, not four."** You corrected a claim I would otherwise have put in the pull
  request, and you said exactly why the fourth is not a regression test for this issue. That paragraph is now in the
  body, with your reasoning.
- **You separated the two faults.** Routing being dead, and the query never being reached, are independent, and either
  alone explains "no images". Reporting them as one would have hidden the second.

**Your clock was right and mine was wrong.** a47's header said 1:45 PM when your machine read 11:48 AM. I had estimated
every batch header instead of reading a clock; they were between 36 minutes and 2 hours ahead, and I have corrected a43
through a48 from each batch's own commit timestamp. Thank you for saying so rather than working around it.

### Q-a43-1: (a), and (b) is filed

The pull request opens with `no-visible-change` and your red/green as its proof, and its Screenshots section explains
that no path in the interface builds the query. Its check is running now.

(b) is **[#3682](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3682)**, a Feature at Low:
a visitor's drive routed to a lot a visitor may park in. It carries your reading of
`trip-planner.service.ts:1034` and mode 8, and the three questions nobody can answer from the code - nearest by driving
or walking time, accessible visitors, and paid lots.

### Q-a43-2: yes. And I narrowed #3679 first, which changes how the check must be written

I confirmed your finding on the production network and then isolated it. Same pair of points, asking with the
service's own published `Drive` mode, dropping one restriction at a time:

| Travel mode | Result |
| --- | --- |
| `Drive`, as published | No route |
| `Drive` without `TimedRoad` | No route |
| `Drive` without `One Way` | No route |
| **`Drive` without `No Drive`** | **Solves, 21.9 min** |
| `Drive`, no restrictions | Solves, 20.2 min |

**`No Drive` is prohibiting the drivable network itself.** #3679 now says so, and its priority is **Urgent**: a whole
visitor-facing feature is dead on production.

**The part that matters for your check:** the service's *layer default* restrictions are `No Walk` and
`NoWalk OffCampus` - a walking configuration. So a `solve` with **no** `travelMode` parameter **succeeds right now**. A
check written the obvious way would pass today while every visitor's drive fails, and would be worse than no check,
because it would read as proof that drives work.

### What to do

1. **One check in `test/smoke/aggiemap` that solves a drive trip**, and it **must name the `Drive` travel mode
   explicitly**, read from the service's `supportedTravelModes` rather than hard-coded. Hard-coding the restriction
   list would hide the very fault this catches and go stale.
2. **Assert a route came back** - a `routes.features[0]` with a positive `Total_Time` - not just HTTP 200. An ArcGIS
   solve answers 200 with the error in the body, which is #2510's fault mode again.
3. **Prove it fails now.** It must be red against production today, for the right reason, and quote that. Then list it
   as a known failure tied to #3679 in `test/smoke/aggiemap/environments.json`, so it stays visible and its fix is
   noticed - that is what CLAUDE.md's known-failure lists are for.
4. **A walking solve beside it, which must pass.** That is what makes the drive failure a diagnosis rather than "the
   routing service is down", and it is the control that stops the check being deleted as flaky.
5. **Add its row to `docs/testing.md`** - the check reads spec file names - **and leave every count on that page
   alone**, the Total included. Three pull requests once conflicted on that one line (#2002).

**Branch** `test/3679-drive-solve-smoke` from the latest `development`, pushed to the fork. `no-visible-change`, no
images. Pre-push `scripts/check-in-volume.sh`, then **`scripts/pre-pr-check.sh`**, and give me its last line. Body text
in the report with a `Title:` line at its top.

**Report** `laptop/reports/2026-11-25-a49.md`. Questions `Q-a49-<n>`. **Open no pull request.** Do not try to fix the
routing network - it is the GIS team's, and nothing in this repository should work around it.

## Batch a43 (aggiemap: prove #1169's fix, and take its before/after images; 25 November 2026, 11:29 AM Central, from `work (aggiemap)`) (High) - **now**

**a42 is withdrawn, and it is not your doing.** It asked which of 43 open pull requests overlap. The maintainer merged
29 commits this morning and the queue went from **44 open pull requests to 17**, so the question a42 existed to answer no
longer exists. If you had already started it, stop and say how far you got in the report - that is not wasted, it is just
no longer the thing to finish. Nothing below depends on it.

### Why this batch

[#1169](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1169) is a real fault with a visible
result: drive directions' visitor parking filtered on `TS_GIS.dbo.LOTS.Visitor_Lot`, a column the Parking Lots layer no
longer has and that nothing replaced, so a visitor **with no permit was offered no lots at all**. The maintainer decided
on 25 November 2026 which rule replaces it: the one the layer's own renderer draws by, `GIS.TS.ParkingLots.LotType`
ending in `Visitor` - **19 of the layer's 244 lots**, 6 `Garage Visitor` and 13 `Surface Visitor`.

The fix and its tests are written and pushed. **What is missing is the two things this machine can do and mine cannot
cheaply right now:** the red-then-green proof, and the before/after images. Its pull request cannot open without them.

**Branch:** `fix/1169-visitor-parking-lottype` on the fork, at `a923432c4`, off `development` `2cfb0bc43`. Do not
rebase it and do not change the fix - if you think the fix is wrong, say so in the report instead.

### What to do

1. **Prove the tests red first.** Check out the branch, then revert **only** the change to
   `parking.service.ts` (keep the new spec), and run
   `nx test maps-feature-trip-planner`. The four new tests under `describe('the visitor lots')` must fail. **Quote the
   failure text.** A regression test that was never seen red proves nothing, and this is the step most often skipped.
2. **Then green.** Restore the fix, run the same target, and quote the pass line.
3. **Before/after images.** Dev server as CLAUDE.md gives it (`UV_THREADPOOL_SIZE` and
   `NX_WORKSPACE_DATA_DIRECTORY` are **not** optional; clear `.vite`/`.vite-temp` in `tamu-js-dev-nm` first if the
   container did not shut itself down last time). Open drive directions, choose a destination, and set parking to
   **no permit** - that is the one path this bug is on.
   - **before:** the same dev server with the fix reverted, so the empty result is photographed while it is still true.
   - **after:** with the fix, showing lots offered.
   - Write both to `docs/screenshots/1169-visitor-parking/` on the branch and push them. Name them so the pair is
     obvious.
4. **Say how many lots the after image shows.** If it is not 19, say what it is - the count is the measurement, and a
   different number means either the dev GIS server differs from production or the fix is narrower than intended. Either
   is worth knowing before the pull request opens.

### Worth knowing

- **Notices self-dismiss about ten seconds after load**, so an empty panel in a capture may be a timing artefact rather
  than the bug. Hover to pause before capturing.
- A map canvas blank for 20 to 40 seconds is Esri still drawing, not a fault.
- The dev GIS server lacks several services; if the Parking Lots layer is one of them, say so and capture against
  whichever environment does serve it, naming which you used.

**Report** `laptop/reports/2026-11-25-a43.md`. Questions `Q-a43-<n>`. **Open no pull request** - push the images and the
commits to that branch and stop; I open it. Do not merge `development` into the branch.

## Batch g38 (gisday: before/after screenshots for #3635, so its pull request can open; 25 November 2026, 10:45 AM Central, from `work (gisday)`) (Medium) - **now**

**The maintainer chose (A) for #3635**: implement the two routes. The branch is `fix/3635-rsvp-submission-type-routes` on the
fork (`9b12e8f6d`). It's a visible change, so its pull request waits for your images. You're the machine that can sign in
locally (txgisday-dev only, as always).

1. **Before**, on `development` (`77a7b8051` or newer): signed in as an admin, Admin > RSVP Types, then Add one. Capture
   the 501 error toast. Then the same on Admin > Submission Types.
2. **After**, on the branch: the same two adds, now saved and listed. Also update one on each page and capture it saved.
   Made-up names only (`Test RSVP type`, `Test submission type`).
3. Save them as `docs/screenshots/3635-rsvp-submission-types/{before,after}-{rsvp,submission}-type.png` (plus
   `after-*-update.png`) **on the branch**, and link them from the release entry
   `docs/releases/unreleased/3635-gisday-rsvp-submission-types.md` (relative `../screenshots/...` paths). Run
   `node scripts/collate-release-notes.mjs --check`.
4. Commit on top of the branch, keeping the `.pr-body.md` commit last (rebase it to the top, without force-pushing the
   fork: push the result as `fix/3635-rsvp-submission-type-routes-img`). Say the commit in your report.
5. Report `reports/2026-11-25-g38.md`.

## Batch g40 (gisday: #1478 zoneless, the signed-in half; after g38, before g39) (Medium)

Home's g121 (`home/reports/2026-11-25-g121.md`) found zoneless holds on the public pages, and fixed the one stale case:
the file picker's `reset()` now calls `markForCheck()`. What's left is signed in, which home can't reach. Branch
`chore/1478-gisday-zoneless-pr` on the fork, **`59a86ea3e`**. Locally, txgisday-dev only, made-up data:

1. Run it signed in, as an admin. Exercise:
   - **Forms with each control:** file upload (pick, then reset or save), radio group, slide toggle, select list. Look at
     the admin forms, and at registration and the submissions form.
   - **A modal**, opened and closed.
   - **The judging tabs**, switching between them.
2. Watch for a view that only catches up on the next click or keypress. That's the zoneless failure. Compare anything odd
   against `development` before calling it a fault.
3. Report `reports/2026-11-25-g40.md`: what you exercised and what you saw, with one screenshot per area. Commit nothing
   unless something is stale; if it is, say where and stop.

## Batch g39 (gisday: #3667, remove the unfinished initial survey; after g38) (Low)

**The maintainer decided on 25 November** to remove the initial survey rather than fix it (#990, now closed). #3667 lists what
goes: the page and its route, the front-end service, the API folder and its registration, the survey entities and
`user_info.hasCompletedInitialSurvey`, and `scrub.sql`'s lines for them.

1. Branch `chore/3667-remove-initial-survey` from the latest `development`.
2. Remove them. **Generate the migration** with the GIS Day migration commands in `docs/gisday-migrations.md` against your
   local stack, as #3269 did for `session_details_sends`. Read the generated SQL, and run it up and down locally.
3. `scripts/check-in-volume.sh` on `gisday-platform-data-api,gisday-platform-ngx-core,gisday-platform-ngx-data-access,gisday-nest,gisday-angular`
   at `CHECK_PARALLEL=1` (a GIS Day-wide check). Read its `Exit` line.
4. Draft `.pr-body.md` from the template as the last commit (`no-visible-change`: nothing links to the page). Push to the fork.
5. Report `reports/2026-11-25-g39.md`: the migration's SQL, the up/down result, and the check's exit code.
## Batch a42 (aggiemap: which of the 43 open pull requests overlap? 25 November 2026, 8:55 AM Central, from `work (aggiemap)`) (Medium) - **withdrawn**: the queue fell from 44 open pull requests to 17 on 25 November 2026, so the overlap it measured is gone; replaced by a43

**a31 and a32 are accepted, all three branches, and their pull requests are open: 3663 (#3471), 3664 (#3482), 3665 (#3483).**
Two things from your reports worth saying back:

- **You found a caller an import search could not see.** `SearchMobileComponent` extends `SearchComponent` and used
  `keyControl` from its template, so the phone's search was in scope and the issue did not know it. You found it because the
  **build** failed, not the tests - which is CLAUDE.md's "build to typecheck, don't rely on tests" rule earning its keep.
- **a32's proof for #3482 is the best kind there is.** Compiling both stylesheets before and after and showing the CSS is
  byte-identical - 1,545 bytes and 760 - means no label can move, so `no-visible-change` became a fact instead of a
  judgement. That is how to justify that label, and I have not seen it done that way here before.

### Why this batch

There are **43 open pull requests** into `development` and the maintainer merges them one at a time. Each is green alone, and
**nobody knows which of them touch the same files**, so he cannot tell which may go in together and which will conflict the
moment one lands. The lab is proving by real merge whether my eighteen AggieMap ones go in together; **this batch answers the
cheaper and much broader question for all 43, from file lists and diffs alone.** No Docker and no build, so it will not
compete with the lab's check - that matters, because two checks cannot share this machine at the defaults.

### What to do

1. **For every open pull request**, get its changed-file list (`gh pr view <n> --json files`). 43 calls; **cache them to
   disk** so the analysis can be re-run without re-fetching.
2. **Build the overlap graph:** for each pair sharing at least one file, record the pull requests, the shared files, and
   whether they touch the same *lines* (`gh pr diff <n>`, comparing hunk ranges). **Two pull requests editing opposite ends
   of a long file will not conflict, and reporting that as a clash would make the whole report useless** - the line-level
   distinction is the entire value here.
3. **Group the result:** which pull requests are isolated (sharing no file with any other, so they can merge in any order at
   any time), which form clusters, and inside each cluster which pairs actually collide on lines.
4. **Name the files that appear in the most pull requests at once.** `scripts/strict-lib-errors-known.txt` is one I know of -
   five GIS Day pull requests edit it, and they have to merge one at a time with a re-count between each. There will be
   others, and **each one is a merge-order constraint nobody has written down.**

### What the report must answer

- **The isolated set, listed.** These can be merged freely, and it is the most immediately useful output - if it is 30 of the
  43, the maintainer's morning looks completely different.
- **Each cluster**, with its real line-level collisions and a suggested order.
- **The files that force serialisation**, with how many pull requests touch each.
- **Where a cluster spans AggieMap and GIS Day**, say so plainly rather than proposing an order - those need the two
  directors to agree, and surfacing it is the job.

**Report** `laptop/reports/2026-11-25-a42.md`. Questions `Q-a42-<n>`. **Read-only on GitHub: no comments, no labels, no
merges, nothing opened or closed.** No branch and no pull request.



## g36 received (gisday), 7:10 AM Central, 25 November 2026

Thank you. Your table is posted on PR 3644, and the survey images are now in its body and its release entry (copied to `docs/screenshots/3627-admin-missing-values/` on the branch), so it no longer carries `no-visible-change`.

## Batch g37 (gisday, #3659: the footer throws on a site with no active season) (now)

1. **Branch** `fix/3659-footer-no-active-season` from the latest `origin/development`.
2. **Red first:** a spec for the footer component (`gisday-platform-ngx-common`) with no active season, failing with the `null (reading 'year')` error your g36 saw. Then the fix: the footer reads the season's year only when there is one, and shows what it should without one (say what that is: nothing, or the current year).
3. **Before/after** on your stack, the made-up season set inactive as in g36: the console before and after, and an image only if the footer itself looks different. Put the made-up season back afterwards.
4. Note: PRs 3629 and 3637 also touch `gisday-platform-ngx-common`. Merge `development` first if either has merged.
5. `pre-pr-check.sh` with `gisday-platform-ngx-common`, `gisday-angular`; `.pr-body.md` last; "branch ready".

## g35 received (gisday), 6:05 AM Central, 25 November 2026

`fix/3636-initial-survey-template` goes through `pre-pr-check.sh` on the work machine and opens when it exits 0.

## Batch g36 (gisday, #3627: try the admin paths PR 3644 says now work, signed in) (now)

PR 3644 (strictNullChecks in `gisday-platform-ngx-core`, home's g118) has a release entry, `docs/releases/unreleased/3627-admin-missing-values.md`, whose *What to test* rows name **four admin paths that failed and now work** (for example, a class attendance export for a class with no professor now downloads). Home could not sign in to prove them on a page.

1. On your local GIS Day stack, signed in as the `txgisday-dev` test admin, with the scratch database's made-up records (add made-up rows where a path needs one, such as a class with no professor, and undo them afterwards): try each of the four paths on `origin/development` and on `fork/fix/3593-gisday-platform-ngx-core-strict-pr`.
2. One table: path, development, branch. Images only where it fails on `development` and works on the branch, so the pull request can show it.
3. **Post the table as a comment on PR 3644 yourself? No:** put it in your report; the director posts it. Report `laptop/reports/2026-11-25-g36.md`.

## g32 received (gisday), 5:20 AM Central, 25 November 2026

Thank you: #1669's pull request (3616) is now cleared for the maintainer's merge, and #3609 (zoneless) opens after it. #3635 is flagged for the maintainer (`needs-maintainer`), since its fix is a decision. Next: g34, then g35.

## Batch g35 (gisday, #3636: the initial survey page throws and shows both headings) (Medium) - **after g34**

1. **Branch** `fix/3636-initial-survey-template` from the latest `origin/development`.
2. **Red first:** a spec for `InitialSurveyComponent` that fails as the page does today: the outlet throws, and both headings render. Then the fix your issue names: `#noFeedback` on an `<ng-template>` (so it is a `TemplateRef`), and the block inside the `@if` so only one heading shows.
3. **Before and after** on your local stack, signed in, the scratch database's made-up records: the page as it is (both headings, the console error) and after. If you can add made-up survey questions, look at whether they render too, and file it separately if they don't.
4. Note: PR 3625 (#3623) also edits `initial-survey.component.ts` (it removes an unused destroy subject). Merge `development` before `pre-pr-check.sh` if it has merged; it should not conflict with a template fix.
5. Images to `docs/screenshots/3636-initial-survey/` on the branch, a release-notes entry (`app: gisday`), `pre-pr-check.sh` with `gisday-platform-ngx-core`, `gisday-angular`, `.pr-body.md` last; "branch ready".

## Batch g34 (gisday, #3614: before/after images of the competitions designer; 25 November 2026, about 4:25 AM Central, from `work (gisday)`) (Medium) - **after g32**

The lab's `fix/3593-competitions-ngx-core-strict` (#3614, strictNullChecks in `gisday-competitions-ngx-core`) changes how the competitions admin designer renders **a question saved without options**: it used to crash there and now renders. The lab can't sign in (Q-g216-1), and a visible change needs its before and after before its pull request opens.

1. **On your local GIS Day stack**, signed in as the `txgisday-dev` test admin, with the scratch database's made-up records only: make (or find) a competition question saved with no options, in a made-up season. Undo anything you add afterwards.
2. **Capture the designer** showing that question on `origin/development` (before: whatever it does, a blank, an error, a stuck spinner) and on `fork/fix/3593-competitions-ngx-core-strict` (after). Keep the console error, if there is one, in the report.
3. **Commit the two images** to `docs/screenshots/3614-designer-no-options/` **on that branch** (`fix/3593-competitions-ngx-core-strict` on the fork; push to it, it's a listener branch), and say each raw URL at the commit returns 200.
4. Report `laptop/reports/2026-11-25-g34.md`; "images ready: #3614". Nothing on GitHub.

## Decided (gisday), 4:02 AM Central, 25 November 2026

- **g33 received:** `fix/3495-ui-kits-search-strict` goes through `pre-pr-check.sh` on the work machine and opens when it exits 0.
- **Q-g33-1: (a), later.** Each of the five shared libraries goes strict on its own branch, as Low batches under #3593, starting with `common-utils-geometry-esri` once home's a22 has merged. **Not now:** g32 comes first, because #1669's merge waits on it.
- **Next for you: g32** (the signed-in admin pages for #1669, with home's check-first list above).

## Batch a34 (aggiemap: #3477's before/after images, which the work machine could not take; 25 November 2026, 4:40 AM Central, from `work (aggiemap)`) (Medium) - **before a31 and a32, it is short**

**Issue: [#3477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3477).** The branch is ready and merged with the latest `development` on the work machine; the only thing holding its pull request is two images. The branch to take them on is **`pr/3477` on the work machine's fork**, pushed as `refactor/3477-one-coordinate-reader-pr` when you say you need it - tell me and I will push it, or take them on `fork/refactor/3477-one-coordinate-reader` plus a merge of `development` if you would rather not wait.

**What changed.** The map search accepted any two numbers separated by a comma as "latitude, longitude" with no range check, so `-96.3, 30.6` - the same point with its halves the wrong way round - was read as latitude −96.3. One `parseLatLon` now refuses a pair out of range, and the text is searched for as text instead.

**The two images** go in `docs/screenshots/3477-one-coordinate-reader/`, named exactly, because the release-notes entry on the branch already links them:

- `before-reversed-coordinates.png`
- `after-reversed-coordinates.png`

**How to take them:** a production build of `aggiemap-angular`, base and branch, as you did for a31. Open `/map/d`, type `-96.3, 30.6` in **Find Building or Parking**, wait for the search to settle, and photograph the search box and whatever it offers. Then the same on the branch. Also check `30.6, -96.3`, the right way round, behaves the same on both - it should, and the entry says so.

**Why it is not just done here, and the thing I need you to answer.** I ran a dev server on this machine at `origin/development` (production configuration, `aggiemap-dev-3477-base`, port 4201) and **the search returned nothing for anything I typed** - not for `-96.3, 30.6`, not for `30.6, -96.3`, and not for `Evans`. The input held the text, `tamu-gisc-search`'s `.search-results-container` stayed empty, and the map never moved. So I could not photograph a difference between two builds when neither build does anything.

**Q-a34-1: does the search work on a local build for you?** If it does, say what is different about your setup (environment file, `SearchSources`, the GIS server it reads) and take the images. **If it does not work for you either, stop and say so rather than working around it** - then "the map search returns nothing on a local build" is a real finding, it gets its own issue, and it is worth more than these two images.

**Report** `laptop/reports/2026-11-25-a34.md`: the answer to Q-a34-1 first, then the images if you got them.

## g32 can start (gisday), 3:45 AM Central, 25 November 2026 (read from PowerShell)

**Home says "branch ready" for `chore/1669-gisday-onpush`** (#1669), so g32 is unblocked; take it after g33. `chore/1478-gisday-zoneless` (#1478) is stacked on it, and its check is running on home.

**Home's "check first" list**, from its report. No admin component changed beyond the `Eager` line, so the risk is the shared children that are still Eager inside hosts that are now OnPush:
- **The radio group**, in the account's initial survey and in the competitions admin designer's question editor: do answers loaded from the API show as selected?
- **The competitions admin submissions page:** the export and Publish-to-ArcGIS status, and the All / Needs a look / Top finishers switch.
- **The submission detail modal:** does the list update after validating?
- **The broadcast and tag edit pages:** does Escape ask "Leave without saving?"
- **`/sessions`:** the RSVP checkboxes after registering.
- **The competitions app's mobile tabs at `/app/*`:** these failed the same way on both builds on home, behind the site-feature guard. Say whether they work on your stack, where the feature may be on.

The pull request for #1669 is open while you run this; the director gives the maintainer its merge command only after your report.

## Correction (gisday), 3:25 AM Central, 25 November 2026, read from PowerShell

- **The clock times in the director's headings since about 2:30 AM ran ahead of the real time** (written as 3:45 AM and 4:20 AM, among others, when the commits are at 2:52 and 3:15 AM). The commit times on this branch are the right ones. Nothing else in those batches changes.

## Note (gisday), 4:20 AM Central, 25 November 2026

- **g33 has its own issue: #3596** (a sub-issue of #3593, strictNullChecks across the GIS Day front end). #3495 closed when PR 3560 merged. Put `Closes #3596` in g33's `.pr-body.md`.

## Batch a31 (aggiemap: #3471, one way to walk a results list with the arrow keys; 25 November 2026, 2:55 AM Central, from `work (aggiemap)`) (Medium) - **after g32**

**Issue: [#3471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3471).** Code job with real keyboard checks, which is why it is yours rather than the lab's. Two shared ways to arrow through a results list, so a keyboard fix (as in #2535) has to be made twice.

**0. Check the issue is still true before writing anything.** It was filed from a read-only scan at `origin/development` on 24 November and `development` has moved since. Confirm `arrowKeyControl` still has exactly one caller, that `trackFocus` still has none, and that the autocomplete still uses `KeyboardNavigationDirective`. If any of that has changed, **say so and stop** - an issue that is already done gets closed with the evidence, not worked around.

1. **The directive wins.** The search component uses `KeyboardNavigationDirective`; `arrowKeyControl` and `trackFocus` are deleted. The directive already does arrows, Enter, Space, Escape and `aria-controls`, so the aim is that the search loses code rather than gains it.
2. **This is the risky one in this set** (#2844: focus and closing in the main search were fiddly). So before you change anything, write down what works today, by hand, on a **production** build of `aggiemap-angular` at `origin/development`: desktop and phone, arrow down and up through the results, wrap at each end or not, Enter on a result, Escape, Tab away, and where focus lands each time. That list is your "before", and it cannot be taken afterwards.
3. **Then the same list on your branch**, and a before/after image pair wherever anything looks or behaves differently. Write every capture to `docs/screenshots/3471-keyboard-navigation/` as you take it.
4. **A spec for the behaviour you were most afraid of losing**, red against the deleted helper's behaviour if you can arrange it, green after.
5. **`scripts/pre-pr-check.sh refactor/3471-one-keyboard-navigation 'refactor(ui-kits-ngx-search): The map search uses the shared keyboard navigation directive' .pr-body.md affected`** - no `no-visible-change` label here, because the keyboard behaviour is the change; it needs a release-notes entry in `docs/releases/unreleased/` and the before/after pair. **Read the log's own `Exit N` line.**
6. **Report** `laptop/reports/2026-11-25-a31.md`: the before list and the after list side by side, what differs, and the check's exit line. Questions `Q-a31-<n>`.

## Batch a32 (aggiemap: #3482 and #3483, two small shared-code jobs; 25 November 2026, 2:55 AM Central, from `work (aggiemap)`) (Low) - **after a31**

Two independent small ones, one branch each, both from the same scan and both Low risk. Same step 0 as a31 on each: confirm the duplication is still there before writing anything.

1. **[#3482](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3482): one floating-label rule.** `textbox.component.scss` and `select.component.scss` hold the same block with different offsets. A `floating-label($left, $top)` mixin in `libs/sass`, both components using it. The labels move, so this one is visible: before/after of a textbox and a select, empty and filled, focused and not. Branch `refactor/3482-one-floating-label`, title `refactor(ui-kits-ngx-forms): One floating-label rule for the textbox and the select`.
2. **[#3483](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3483): the QR code's Download uses `downloadFile`.** The component builds its own anchor element; `downloadFile` in `libs/common/utils/ui` appends the link, removes it and releases the object URL. `qrPng` produces a Blob (`canvas.toBlob`). **Prove the download still works and the file still opens** - that is the whole point, and a spec cannot tell you the PNG is valid. Branch `refactor/3483-qr-download-file`, title `refactor(ui-kits-ngx-qr-code): The QR code's Download uses the shared downloadFile`.
3. `pre-pr-check.sh` per branch as in a31, and **report both in one file**, `laptop/reports/2026-11-25-a32.md`. Questions `Q-a32-<n>`.

**Don't touch** (going through `pre-pr-check.sh` on the work machine tonight): `fix/602-1173-popup-footer`, `test/3539-skip-old-builds`, `chore/2554-dead-athletics-popup-data`, `refactor/3477-one-coordinate-reader`, `chore/1218-node-24.22.3-today`.

## Batch g33 (workspace, #3495: strictNullChecks in `ui-kits-ngx-search`, a shared library the GIS Day front end compiles; 25 November 2026, 3:45 AM Central, from `work (gisday)`) (Medium) - **now, ahead of g32** (g32 waits on home's branch; start it when that is ready, whichever you are on)

g30 received: `chore/1479-remove-jest` goes through `pre-pr-check.sh` on the work machine, with `development` merged in first, and opens when it exits 0.

**Why this library:** work-lab-leila measured GIS Day's front end with strictNullChecks on (`work-lab-leila/reports/2026-11-25-g208.md` on this branch): 591 distinct errors, 304 of them in shared libraries it imports, and `ui-kits/ngx/search` has the most, 53. The lab is doing `ui-kits/ngx/forms` (g212), so the two don't overlap.

**A shared library:** AggieMap's map search uses it too. Keep its public interface as it is for its callers (CLAUDE.md, "Change a shared piece behind its existing interface"); if a fix needs a caller changed, stop and ask in the report instead.

1. **Branch** `fix/3495-ui-kits-search-strict` from the latest `origin/development`.
2. **Measure:** `strictNullChecks` in the library's own configuration (`libs/ui-kits/ngx/search`, its `tsconfig.lib.json` or the project `tsconfig.json`, whichever is its own), and the errors in its own files.
3. **Fix them:** honest `| null` / `| undefined`, inputs typed as callers pass them, no `!` without a comment saying why it is safe. A behaviour that could change (a default that was `undefined`) gets a spec, red first.
4. **If `scripts/strict-lib-errors-known.txt` exists on `development` by then** (PR 3585, #3581), the library must check cleanly under `scripts/check-strict-libs.mjs`; say so in the report either way.
5. `scripts/pre-pr-check.sh` with `affected` (no project list), `--label no-visible-change`. **Your machine only:** the defaults are fine, as nothing else runs checks there. Every app that builds the library must still build in production.
6. `.pr-body.md` last; "branch ready". Report `laptop/reports/2026-11-25-g33.md`, with the before and after counts for the library and for `gisday-angular`'s configuration. Questions `Q-g33-<n>`.

## Batch g32 (gisday: the signed-in admin pages for home's g116, OnPush then zoneless; 25 November 2026, 3:25 AM Central, from `work (gisday)`) (Medium) - **after g30, and once home says "branch ready" for `chore/1669-gisday-onpush`**

**Issues: #1669 and #1478.** Test job. Home is removing `ChangeDetectionStrategy.Eager` from about 101 GIS Day components, then turning on zoneless. It proves the public pages against production builds with the API mocked. It cannot sign in, so the signed-in pages are yours (Q-g116-1, decided A).

1. **On your local GIS Day stack** (`scripts/gisday-local.sh`, the scratch database's made-up records, the `txgisday-dev` test admin; nothing else), build `gisday-angular` twice: at `origin/development`, and at `fork/chore/1669-gisday-onpush`. Then do the same again with `fork/chore/1478-gisday-zoneless` once that branch exists.
2. **Every admin page you can reach**, signed in, on both builds: the lists (seasons, sessions, presenters, sponsors, places, organizations, competitions, users), each one's add and edit form, and the speaker-edit and email screens. Start with the pages home's g116 report lists as changed.
   - **For each one:** does it render, and does it **update** after an action without a reload? Choose a filter, open and close a dialog, save a form, and watch a toast or a list refresh. A stale view is the OnPush failure to look for.
   - **Writes:** only against the scratch database, and undo each one. No email is sent (the local stack's mail goes nowhere; check before sending anything).
3. **Images** only where something differs: before, after, and a note of what you did.
4. **Report** one table: page, development, branch, the same or not. File a bug for each difference, against the branch's issue (Priority per DIRECTOR.md). Report `laptop/reports/2026-11-25-g32.md`; questions `Q-g32-<n>`.

## Decided (gisday), 2:25 AM Central, 25 November 2026

- **Q-g31-1: (a).** #980 is closed as superseded, citing your report; #3571 is what the check found. The director has taken #3571 from your red spec (`4ca4c6e7e`): fix and pull request from the work machine, so nothing more from you on it. (c), deleting `create()`, is not queued.
- **Next for you, unchanged:** a28 (AggieMap) now, then g30 once 3568 and 3570 merge (3567 has).

## Batch a28 (aggiemap: #2554, delete the athletics popup data that reads as live and is not) (Medium) - **now**

This was queued to `copilot-home`, which the maintainer retired tonight
([#3348](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3348)), so it has no machine.
It is yours.

[#2554](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2554):
`indoor-track-parking.definitions.ts` carries old production popup data - `indoorn`, `sp_sh_notes` - in its Cold
source array. **Nothing draws it.** The map draws `IndoorTrackParking_DevelopmentLayerSources`, rebuilt through
`athleticsDevelopmentSource()`; the Cold array is read only for its layer ids.

### Why deleting dead code earns its place here

**It is bait, and it has already cost four investigations.**
[#2034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2034) was filed because
`{attributes.sp_sh_notes}` appeared on screen; the column it names does not exist on that layer, and a reader who
finds that string in the definitions concludes the definition is the cause. It is not.

Tonight produced two more of the same family, which is why this is worth doing now rather than someday:
[#3337](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3337)'s second page had a style
rule selecting an element that does not exist, and
[#2716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2716) was investigated twice
before anyone noticed its fix had already shipped.

### Before you delete anything

**The issue says the same shape is "probably" in the other athletics definitions.** Probably is not a measurement.
All ten sports moved the same way under
[#2468](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2468), so **check each one** and
report which carry dead popup data and which do not. A sweep that assumes ten and finds six has told you something.

**Prove it is dead before removing it, per definition file, not once for all ten.** For each source you delete popup
data from, show that the map draws the development source instead - the `athleticsDevelopmentSource()` rebuild - and
that the Cold entry is read only for its id. If any one of them genuinely draws its Cold source, **stop on that one**
and say so: deleting live popup data would empty a real popup, and the issue's own warning is that this reads as live.

### What must not change

Nothing a visitor sees. The layer **ids** in the Cold arrays stay, because they are what is read. If a capture
differs at all between before and after, something was not dead.

### Checking and reporting

`scripts/pre-pr-check.sh chore/2554-dead-athletics-popup-data '<title>' .pr-body.md ts-events-ngx,aggiemap-angular
--label no-visible-change`, its last line in the report and the body.

A smoke run over the athletics maps is the strongest proof available here - `run-local.sh development one
maps.spec.ts -g "<the sports you touched>"` before and after, same counts - if it fits in your evening. Say either way.

Push to the fork; **no pull request** - mine. Say **"branch ready: chore/2554-dead-athletics-popup-data"**.

`laptop/reports/2026-11-25-a28.md`: the per-sport table, what you deleted, what you left and why, and the check's
`Exit` line.

**Questions come to me** (`work (aggiemap)`), with options and a recommendation. **Set any issue's Priority yourself**
now ([#3527](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3527)).

## Batch g31 (gisday: #980, create a season through the admin page on the local stack; 25 November 2026, about 12:50 AM Central, from `work (gisday)`) (Low) - **after g30**

[#980](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/980) (claimed In Progress): read it to the end. #973 fixed
`SeasonService.create()` (it answered 409 for every new year, `findOne` returning `null` since TypeORM 0.3) with a unit test, but nobody has created a
season through the admin page since, because GIS Day was running. It is over now. **Check first** that #980 is not already done some other way (a
later comment, an e2e, a season created since).

On the **local stack**, signed in through **txgisday-dev only** (`scripts/gisday-local.sh`, `http://gisday.local.test:4201`), from the latest
`origin/development`: Admin, Seasons, create a season for a year that does not exist (2027). It must succeed, appear in the list **inactive** (the issue
explains why `active` stays false), and leave the active season as it was. Then try the same year again: that must answer 409, with a message the page
shows. Images of both into `docs/screenshots/980-season-create/`. **Local data only; nothing on production.** If either step fails, that is a bug: file
it (Bug, your best-estimate Priority per DIRECTOR.md) with the images, and red-first a spec where one can be written. If both pass, the report says so
and the work machine closes #980 with your images. Report `laptop/reports/2026-11-25-g31.md`.

## Batch g30 (workspace: #1479, remove Jest itself; 25 November 2026, about 12:15 AM Central, from `work (gisday)`) (Medium) - **after g29, once g29's and the lab's g203 pull requests have merged**

**Check first** that no project uses Jest any more (`git ls-files '*jest.config*'` empty on `origin/development`); if any does, report which and wait.
The list of what to remove is on [#1479's last comment](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1479): eight
packages in `package.json` (`@nx/jest`, `@types/jest`, `jest`, `jest-environment-jsdom`, `jest-junit`, `jest-preset-angular`, `jest-util`, `ts-jest`),
`nx.json`'s Jest generator defaults (to `vitest`), both `@nx/jest/plugin` entries and the `jest.preset.js` inputs, `jest.preset.js` itself, any
`test-setup.ts` left behind, and any workflow path that names Jest's JUnit file.

**A dependency change, so the security director's conditions:** sync the lock with `npm install --package-lock-only --ignore-scripts`, a clean
`npm ci` proving it (the check does this when the lock changes), and a **full affected check** (`scripts/check-in-volume.sh <branch>` with no project
list, `CHECK_PARALLEL=2`), then `scripts/pre-pr-check.sh`. Report the lock diff: only those packages and their own dependencies may leave. Branch
`chore/1479-remove-jest`. Questions `Q-g30-<n>`. Report `laptop/reports/2026-11-25-g30.md`.

## Batch a25 (aggiemap: Node 24.22.3 everywhere, one shippable step of #1218) (Medium) - **after a13**

[#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218) is "bring the workspace up to
date, one shippable step at a time". This is one of those steps, and a branch for it already exists and was never
opened - found by [#3505](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3505).

**The branch:** `chore/1218-node-24.22.3` on the fork, commit `b5cc2f3be`, **63 commits behind `development`**. It
moves Node to **24.22.3** in `.claude/launch.json`, `.github/dependabot.yml`, the workflows, `CLAUDE_SETUP.md` and the
rest. Its second commit is a `.pr-body.md` draft; the text is useful, the commit is not.

### Why this one is safe to take and its two siblings are not

`chore/1218-nx-24-0-1` and `chore/1218-angulartics2-14` are **558 commits** behind and touch only `package.json` and
`package-lock.json`. Those have to be redone fresh, because regenerating a lock that old **undoes lock-only updates
while every check still passes** - CLAUDE.md records how that silently reverted five packages from PR 2125 on
23 October, a critical `websocket-driver` fix among them. **Do not touch those two in this batch.**

This branch edits configuration files rather than a lock, so being behind costs a merge, not a silent revert.

### What I have already checked, so you do not repeat it

**24.22.3 is still the right target.** From `nodejs.org/dist/index.json` on 25 November 2026: it is the newest 24.x,
released 10 November, **15 days old**, LTS Krypton. That satisfies CLAUDE.md's seven-day rule, so no pin below it is
needed. Say so in the pull request body, with the date.

### The work

1. **Branch from the latest `development`** and take the code commit (`b5cc2f3be`) onto it - not the `.pr-body.md`
   commit. Resolve the merge honestly: 63 commits have touched workflows and `CLAUDE_SETUP.md` since, so expect
   conflicts there and **read what you are keeping** rather than taking either side wholesale.
2. **Find any new occurrences the branch could not know about.** `git grep -n "24\.22\.1"` across the repository: a
   file added in the last 63 commits may pin the old version, and `scripts/pre-pr-check.sh` and `scripts/tidy.sh` are
   both newer than this branch.
3. **Prove the version is actually used**, not just written down: start the dev server with the command in CLAUDE.md
   and report what `node --version` says inside the container, and confirm `check-in-volume.sh` runs on the new image.
4. **Say what you did not change and why.** If the API images or a Dockerfile pin a different version deliberately,
   that is a finding for the report, not something to align silently.

### Checking and reporting

`scripts/pre-pr-check.sh chore/1218-node-24.22.3-today '<title>' .pr-body.md` - **affected**, not a project list: a
change to the workflows and the lint plugin's configuration reaches everything. Its last line goes in your report and
in the body. No release-notes entry is needed (nothing a visitor sees), so the pull request will carry
`no-visible-change` - pass `--label no-visible-change` to the script and say so in the report.

Push the branch to the fork; **no pull request** - that is mine. Say **"branch ready: chore/1218-node-24.22.3-today"**.

`laptop/reports/2026-11-25-a25.md`: the conflicts you resolved and how, anything still naming 24.22.1, the container's
own `node --version`, and the check's `Exit` line.

**Questions come to me** (`work (aggiemap)`), with options and a recommendation. **Set an issue's Priority yourself
now** - the maintainer decided on 25 November that sessions estimate it rather than ask
([#3527](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3527)).

## Batch g29 (workspace: #1479, the remaining Angular and TypeScript projects off Jest; 25 November 2026, about 10:35 PM Central, from `work (gisday)`) (Medium) - **after a14**

**Decided by the maintainer (24 November, about 10:25 PM Central): the whole workspace moves off Jest to Vitest**, in his words "do the things to
get us off jest". #1479 is claimed In Progress. The lab does GIS Day's (g201, g202). This batch is the rest **that is not NestJS**; the Nest projects
(`geoservices-nest`, `geoservices-data-api`, `mailroom-nest`, `mailroom-helper-nest`, `mailroom-data-api`) wait for the lab's SWC pattern
(`unplugin-swc`, g202) and come in a later batch.

**Copy #1948's pattern** (8951a6364), and the lab's for the GIS Day `ngx` libraries (PR 3499: a one-line `vitest.config.mts`, `vitest/globals`,
`jest.*` to `vi.*`, zone only where a spec uses `fakeAsync`). **Fetch `origin` before each branch.** For each group, one branch:

1. `chore/1479-vitest-geoservices`: `geoservices-angular`, `geoservices-ngx`, `geoservices-data-access`.
2. `chore/1479-vitest-mailroom`: `mailroom-angular`, `mailroom-ngx`, `mailroom-data-access`, `mailroom-common`.
3. `chore/1479-vitest-the-rest`: `ts-events-angular`, `dev-tools-application-testing`, `dev-tools-responsive`, `geoprocessing-core`,
   `geoprocessing-v5` (use each project's real name from its `project.json`).

Each: **the same tests before and after, per project** (a spec that passed only because of Jest gets fixed, never skipped), the before and after
times in `docs/build-times.md`, then `scripts/check-in-volume.sh <branch> <the projects>` with `CHECK_PARALLEL=1` and its `Exit` line. Once
`scripts/pre-pr-check.sh` is on `development` (#3508), it replaces that last step. `.pr-body.md` from the template last, `Closes #` left for the work
machine. Questions `Q-g29-<n>`. Report `laptop/reports/2026-11-25-g29.md`, "branch ready" per branch.

## Batch g28 (gisday: #1977's Vitest step, the GIS Day libraries off Jest; 24 November 2026, about 10:25 PM Central, from `work (gisday)`) (Medium) - **WITHDRAWN (25 November, about 12:30 AM Central): moved to the lab as g201. Do not start it.**

[#1977](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1977) (and [#1479](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1479)): read both,
and #1479's last comment, the maintainer's order of 18 October: Vitest **measured before and after**. AggieMap and UES moved in #1948 (8951a6364):
**copy that pattern** (each project's `vitest.config.mts`, `project.json` test target, `tsconfig.spec.json`, setup file), don't invent one.

Still on Jest (24 November): the eight GIS Day libraries under `libs/gisday/` (competitions data-api, ngx common/core/data-access; platform
data-api, ngx common/core/data-access) and the two apps.

**Do the four `ngx/data-access` and `ngx/common` libraries first, one branch, `chore/1977-gisday-vitest-ngx`:**
1. **Before:** `scripts/check-in-volume.sh` on `origin/development` for those four with `BUILD_TIMES_RECORD=1`, `CHECK_PARALLEL=1`, a warm cache
   cleared for the test target only if you can (say how you measured). Record each project's test time.
2. Convert them. Every spec must still run: **the same number of tests before and after** per project, listed in the report. A spec that only
   passed because of a Jest quirk gets fixed, not skipped.
3. **After:** the same check, the same way. The table (project, tests, Jest seconds, Vitest seconds) goes in `docs/build-times.md`.
4. Push, `.pr-body.md` from the template last, `no-visible-change`.

Then, if that went cleanly, a second branch `chore/1977-gisday-vitest-core` for the two `ngx/core` libraries and the two `data-api` libraries, the
same way. The apps last, or say why not. Stop and report if a library needs a decision (a spec that cannot run under Vitest as written).
Questions `Q-g28-<n>`. Report `laptop/reports/2026-11-24-g28.md`.

## Batch a14 (aggiemap: #2643, then #3319; 24 November 2026, about 9:25 PM Central, written by `work (gisday)` under the AggieMap director's letter, at its request) (Medium) - **after a13**

**a14 is finished and withdrawn (25 November 2026, about 12:10 AM Central, `work (aggiemap)`).** You pushed
`fix/2643-noon-is-pm` and `fix/3464-midnight-is-am` after the nudge, and the work machine has taken them from
there: both faults are the same twelve lines of `common-utils-date`, so they went into one branch
(`fix/2643-3464-twelve-hour-clock`) with a release-notes entry, and the pull request is being opened now. **Do not
redo either part.** Part 2 (#3319) was already withdrawn by the GIS Day director: it was fixed on
`fix/3149-phone-directions`, which has merged.


Questions go to the **AggieMap** director (`Q-a14-<n>`). Both issues are claimed In Progress on project 2. Check each against
`origin/development` before building; if it is already done, report that and build nothing. Two branches, two PRs, "branch ready" after each.

**1. [#2643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2643), branch `fix/2643-noon-is-pm`.** A trip's steps show
12 PM as AM. `libs/common/utils/date/src/lib/common-utils-date.ts` (about line 14, `timeStringForDate`) uses `hours > 12` and never maps
hour 0 to 12. **Red first:** a spec with 00:05, 11:59, 12:00, 12:30, 13:00 and 23:59 (12:05 AM, 11:59 AM, 12:00 PM, 12:30 PM, 1:00 PM,
11:59 PM); then the fix. Check every other caller of the function still reads right. Images: a trip step at noon, before and after, a release
entry. Check: `scripts/check-in-volume.sh fix/2643-noon-is-pm common-utils-date,aggiemap-angular` (use the library's real project name).

**2. WITHDRAWN (about 10:05 PM Central, from the AggieMap director): the fix already exists on the fork's `fix/3149-phone-directions`, with its spec, release entry and screenshots, and the AggieMap director is opening it as a pull request that closes #3319. Do not build it; go from part 1 to part 3.** ~~[#3319](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3319), branch `fix/3319-trip-stop-back`.~~ On a phone, the
back arrow in the trip-stop search goes to the main map instead of the trip. **First, read the fork's `fix/3149-phone-directions`**: the issue
says the fix is there. If that branch already changes the same back arrow, **report that and build nothing** (say whether that branch has a PR
or should get one). Otherwise: `libs/aggiemap/ngx/ui/mobile/src/lib/components/omnisearch/omnisearch.component.ts` uses `['./trip']` (about
:187) and `map/d/trip` (about :135); one relative link back to the trip. **Red first:** a router test. Images at 390 px, before and after, a
release entry, and the check for the mobile UI library and `aggiemap-angular`.

**3. [#3464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3464), branch `fix/3464-midnight-is-am`, stacked on part 1's
`fix/2643-noon-is-pm`** (added about 11:30 PM Central with the AggieMap director's agreement; claimed In Progress). The same file:
`dateForDateTimeString` adds 12 for PM but never maps **12 AM** to hour 0, so "12:05 AM" becomes 12:05 PM. Its one caller is the bus service's
timetable (`bus.service.ts`, about line 306). **Red first:** a spec with `12:05 AM` -> 00:05 and `12:05 PM` -> 12:05, then the parse; say in the
report whether the bus timetable ever carries a midnight-hour time. Stacked because two branches editing `common-utils-date.ts` apart would
conflict; **if it turns out bigger than it looks, unstack it onto `development` instead.** When part 1 merges, **merge `development` into this
branch at once** (before any screenshots) and read the pre-push check after that merge: on 15 November a clean-looking merge of this shape
declared two functions twice and failed to compile. **Fetch `origin` before each part of a14**, not once at the start: the maintainer is merging
as pull requests go green, so `development` moves under you.

Report `laptop/reports/2026-11-24-a14.md`.

## Batch g27 (workspace: #3000, then #1001; 24 November 2026, about 9:15 PM Central, from `work (gisday)`) (Medium) - **now**

The maintainer asked tonight for open issues to be taken all the way to PRs, knowing some are already done: **check each against
`origin/development` before building**, and if it is done or superseded, say so and build nothing. Question ids per DIRECTOR.md
(`Q-g27-<n>`). Two branches, two PRs, "branch ready: <name>" after each. g26 is PR 3460.

**1. [#3000](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3000), branch `fix/3000-check-memory`.** Read it and your own
23 November evidence on it. A GIS Day-wide affected check is killed for memory at the defaults (`-m 16g`, `--parallel=8`), and the check
then reports a failure that is not one. Two parts:
- **Say so when it happens.** After the run, the script scans its log for `Killed`, `SIGKILL` or exit 137 and, if found, prints a line saying
  the failure was memory, not code, with what to set (`CHECK_PARALLEL`, `CHECK_MEMORY`). A test case in `scripts/check-in-volume.test.sh`
  (red first) for the scan, on a fixture log.
- **Measure, then set what is documented.** Peak memory of a GIS Day-wide affected set at `--parallel` 8, 4, 2 and 1 on your 23.5 GB, and the
  elapsed time of each. Put the table in `docs/build-times.md`, and in CLAUDE.md say what a GIS Day-wide check needs (today's practice is
  `CHECK_PARALLEL=1`). Change a default only if the numbers say so, and say why in the PR.

**2. [#1001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1001), branch `fix/1001-focus-visible`.** Read it to the end.
`outline: none` / `outline: 0` with no replacement hides keyboard focus. Count what is left on `development` first (the triage saw 14 rules,
and `:focus-visible` in 10 files). Fix the shared ones (`libs/sass`, `libs/ui-kits`) with a visible `:focus-visible` outline in the style the
repository already uses (2px `$aggie-maroon`, as #2588's tiles and the accordion header do), and the apps' `styles.scss` where it is the same
pattern. Leave any that a design genuinely needs and list them. Before and after images of keyboard focus on two or three affected controls
(GIS Day and AggieMap), a release entry, and the check for the projects you touch with `CHECK_PARALLEL=1`.

Report `laptop/reports/2026-11-24-g27.md`.

## Batch g26 (workspace: #1938 and #2067, the pre-push check builds without CI's production configuration; 24 November 2026, about 3:45 PM Central, from `work (gisday)`) (High) - **after g25**

The maintainer is away and asked for issues to be taken to PRs. Checked at 3:40 PM: `scripts/check-in-volume.sh` on
`origin/development` never passes `--configuration`, and no PR exists. **#2067 and #1938 are the same fault**; one branch closes both.

Branch `fix/1938-check-production-build` from the latest `origin/development`. Read both issues to the end. `build.yml` builds with
`--configuration=production`; the script builds with no configuration, so seven apps whose `defaultConfiguration` is `""` are built
without budgets or AOT. Make the script's **build** target use what `build.yml` uses (read it there, the way the script already
reads each workflow's exclusions, rather than hard-coding the flag if that is practical), and **check what CI does for projects with
no `production` configuration** (the Nest apps, libraries) before changing anything: they must behave exactly as in CI.

**Red first, twice:** (1) a case in `scripts/check-in-volume.test.sh` that fails until the script's build matches `build.yml`;
(2) a real run: on a scratch commit that pushes `gisday-angular` over a budget (e.g. pad `header.component.scss` past 10 kB, as #2066
did), `scripts/check-in-volume.sh <scratch branch> gisday-angular` must **pass on development's script and fail on yours**. Do not push
the scratch commit. Then the branch's own check, `scripts/check-in-volume.sh fix/1938-check-production-build gisday-angular,aggiemap-angular`,
its `Exit` line, `bash scripts/check-in-volume.test.sh`, and update CLAUDE.md's description of the check if it is no longer true.
Push to the fork, `.pr-body.md` from the template as the last commit (`Closes #1938` and `Closes #2067` on separate lines).
Report `laptop/reports/2026-11-24-g26.md`, "branch ready".

## Batch a13 (aggiemap: #3337, two GIS Day competition pages with a quoted colour) (Medium) - **now**

[#3337](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3337). Both files are still
exactly as the issue describes, confirmed on `development` at `92631c29c`:

```scss
// libs/gisday/platform/ngx/core/src/lib/pages/competitions/light-pole/light-pole.component.scss
// libs/gisday/platform/ngx/core/src/lib/pages/competitions/lighting/lighting.component.scss
img#geosat {
  background-color: '#500000';
}
```

`'#500000'` in quotes is a CSS string, not a colour, so the browser discards the declaration and the element
has no background. Sass compiles it happily. These are the only two in the repository - I grepped every
`.scss` for `background-color: '`.

### 1. First, prove it is worth fixing. This is the whole batch.

**Before changing anything, confirm `img#geosat` exists on those two pages and that a visitor can see it.**

Four faults in one week looked like a one-word change and were not, and two of them *would have looked like a
fix and changed nothing a visitor sees* - which is worse than leaving the bug, because the issue gets closed
([#1961](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1961) was a component
unused since #418). A background colour on an element nobody renders is exactly that shape.

So, on GIS Day local:

- Does `img#geosat` appear in the rendered DOM on the Light Pole and Lighting competition pages?
- Is it on screen, and does a background behind it make any visible difference - or is the image opaque and
  covering it entirely?

**If the element is not rendered, or the background cannot be seen behind the image, stop and say so.** Do not
fix it. Report what you found and I will take it to the maintainer; the right answer may be deleting the rule
or the file rather than correcting it.

### 2. Only if it is visible: the fix

Use **`$aggie-maroon`**, not an unquoted `#500000`. Texas A&M's maroon is that variable
([#2605](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2605), which took it out
of 75 stylesheets); re-introducing the literal would undo that in two more. It lives in
`libs/sass/_variables.scss` - follow how a neighbouring GIS Day component stylesheet imports it rather than
inventing an import path.

**The two files are identical.** Two stylesheets with the same single rule is the duplication the
reuse-before-building rule is about: one bug needed fixing in two places, which is how this survived. If there
is an obvious shared home for it, say so in your report - but **do not refactor it in this batch**. Fix both,
note the duplication, and let the maintainer decide.

### 3. Images

Visible change, so before and after for **both** pages, at 1280. Same window size, same page state, into
`docs/screenshots/3337-quoted-background/`.

### 4. Check and report

`scripts/check-in-volume.sh fix/3337-quoted-background gisday-platform-ngx-core,gisday-angular` with
`CHECK_PARALLEL=1` - these GIS Day tests time out under load on your machine. Read its own `Exit` line, not
the shell's.

Branch `fix/3337-quoted-background` from `development`, push to the fork, **no `.pr-body.md`** (a leftover one
makes the worktree un-removable - that was [#3432](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3432),
fixed today, and the habit is still worth dropping). Say **"branch ready: fix/3337-quoted-background"**.

Report `laptop/reports/2026-11-24-a13.md` with the step 1 finding stated plainly either way, the check's
`Exit` line, and the image paths. **No pull request** - that is mine.

## Batch g25 (gisday: #3424's green run, then #3412's Papers page; 24 November 2026, about 1:20 PM Central, from `work (gisday)`) (High) - **now**

**Decided by the maintainer:** PR 3415 merges as it is (Posters and Presentation), and the Papers page becomes its own PR from
you, not home (home has not picked up g106). The release waits on both of these.

**1. [#3424](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3424), the smoke test (first, about 10 minutes).**
Production's scheduled GIS Day Smoke run fails on *a past year's Sessions page offers the organizations its sessions were held at*,
because it reads the checkbox's icon ligature as part of each name. The fix is on the fork's `fix/3424-smoke-filter-labels`
(`846c32a04`, one line, test only). In the Playwright container, against production (read only), with
`SMOKE_BASE_URL=https://txgisday.org`: `npx playwright test --config=playwright.smoke.config.ts -g "past year"`, **red** from
`origin/development` first (expect `2025: offered but held no session`), then **green** from the branch. Report both lines and the
`Exit` codes in `laptop/reports/2026-11-24-g25.md` straight away and say "g25 part 1 done"; the work machine opens the PR. Do not push.

**2. [#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412), the Papers page.** Once PR 3415 has
merged (check `gh pr view 3415`), branch `fix/3412-papers-awards-sentence` from the latest `origin/development`. Read 3415's diff:
it moved the awards lead-in inside `<tamu-gisc-competition-session>` on Posters and Presentation. Do the same on Papers, and for any
other lead-in that introduces a session there. **Red first:** the same spec 3415 added, on Papers, with a season whose awards
session is not found; then green. `scripts/check-in-volume.sh fix/3412-papers-awards-sentence gisday-platform-ngx-core,gisday-angular`
with `CHECK_PARALLEL=1`, its `Exit` line. Images: Papers before and after at 1280 and 390 into
`docs/screenshots/3412-awards-sentence/` (new file names; keep 3415's), plus a release-notes file `docs/releases/unreleased/3412-papers-awards-sentence.md`.
Commit, push to the fork, and draft `.pr-body.md` from the template as the last commit. Report in the same file, "branch ready".

## Batch a12 (aggiemap: the release tier on dev, on a machine doing nothing else; 24 November 2026, 10:20 AM Central, from `work (aggiemap)`) (High) - **now**

**This is the run that decides whether the 24 November build goes to production.** The maintainer asked for it on a machine
doing nothing but testing, which is why it is here rather than on the work computer: that machine is removing 277 Docker
volumes and then compacting Docker's disk image, and `CLAUDE.md` records that a release tier competing with other work is
what makes the paint check time out (#1716).

**Run nothing else while this runs.** No check, no build, no second smoke run. Eight of the failures this is measuring are
load-sensitive, so anything else on the machine corrupts the only measurement that matters here.

**What to run**
- A worktree at **`61dc13b89`** - the commit the deployed dev build was made from, so the specs match what is running.
  Do not use `development`'s head; it has moved since.
- `test/smoke/aggiemap/run-local.sh development release`. Every map once, about 30 minutes to 1.6 hours.
- **No `-x`.** Let it run through every test; a stop at the first failure would lose the measurement below.
- **Read the log's own `Exit N` line** and quote it.

**Do not tag anything.** A `dev-*` tag is the maintainer's decision on these results, not a consequence of them.

**What the report must separate, because this is a measurement and not just a pass or fail**

The 23 November release tier exited 1 with 18 failures, 7 flaky, 71 skipped, 982 passed. Ten of those eighteen have since
been fixed and merged, and four were proven on dev this morning. **Eight were not touched**, and they are the point of this
run - they fail under the load a release tier creates, and nobody has measured them on a quiet machine:

- `basemap-requests` - a load's queries counted ([#3364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3364))
- the Lot 100g popups
- the layer-order checks ([#3369](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3369)); the 23 November table said four and there were five - the eighteenth

For every failure, say: **which test, how many of its retries failed, and whether it failed on a quiet machine or only under
load.** A test that passes on retry is flaky; one that fails every retry is real. That distinction is the whole reason this
run is being done on an idle machine, and it decides whether these eight are known flakiness to tag through or timing work
to do first.

Also report anything that failed which is **not** in that list of eight - that would be a regression from this morning's
eleven merges and matters more than any of the above.

**Don't touch:** production, any tag, any pull request, `development`. Report
`laptop/reports/2026-11-24-a12.md`, then say "report ready: <file>".

## Batch g23 (gisday: merge conflicts on eight PRs, and two lint failures; 24 November 2026, from `work (gisday)`) (Medium) - **WITHDRAWN: the work machine is doing these itself (the maintainer, 24 November). Do not start it. g24 still stands.**

The maintainer merged fifteen PRs this morning; these eight now conflict with `development`. For each, in its own worktree on the fork
branch: `git fetch origin`, **merge** the latest `origin/development` into it (never rebase, never force-push), resolve, then
`scripts/check-in-volume.sh <branch> <the projects it edits>,gisday-angular` (add `gisday-platform-data-api` for API branches), read
its `Exit` line, and push to the fork. Keep both sides' intent in every conflict; where they truly disagree, stop on that PR and put
it under **Questions for the home session**, with options and a recommendation.

| PR | Branch | Note |
| --- | --- | --- |
| 3360 | `feat/3244-vgi-submission-counts` | |
| 3375 | `feat/3314-check-ins-by-hour` | Was stacked on 3361, now merged |
| 3380 | `refactor/3379-nested-season-copy` | Was stacked on 3378, now merged. **Also fails `Lint / Affected`**: fix it |
| 3367 | `refactor/3331-one-name-order` | Known conflict with 3378's `class.provider.ts` and `event-broadcast.service.ts` |
| 3390 | `feat/545-vgi-export-zip` | **Do not touch package.json or the lock** |
| 3391 | `refactor/3329-season-picker` | |
| 3392 | `fix/3354-public-event-hidden-sessions` | Was stacked on 3359, now merged |
| 3344 | `feat/441-speaker-sessions` | **Last**, and only after PR 3388 has merged (it conflicts with 3388's template); if 3388 is still open, report and skip |

**Also, not a conflict:** PR 3373 (`refactor/3330-one-dashboard-template`) fails `Lint / Affected`. Fix it the same way and push.

Report `laptop/reports/2026-11-24-g23.md`: per PR, the merge commit, which files conflicted and how each was resolved, the check's
exit line, and anything left. Say "conflicts done: <PR numbers>" first.

## Batch g24 (gisday: images for PRs 3387, 3349 and 3367; 24 November 2026, from `work (gisday)`) (Low) - **after g23**

Each fails "Has before/after images". Same rules as g20 (made-up records only, local scratch database, fast-forward only), images to
`docs/screenshots/<issue>-<slug>/`, a `docs/releases/unreleased/<issue>-<slug>.md` entry, `collate --check`, push, and the PR's
image table in `laptop/reports/2026-11-24-g24.md`:
- **3387** (`feat/3321-papers-dates`, #3321): the public `/competitions/papers` page, before (merge-base) and after at 1280 and 390.
  The season settings it needs are at the end of the PR body's verification section.
- **3349** (`fix/3327-form-data-false-values`, #3327): an admin form with a checkbox turned off and saved, then reopened: before it
  comes back on, after it stays off.
- **3367** (`refactor/3331-one-name-order`, #3331), **after g23's merge on it**: a list whose order this changes (names with numbers,
  or accented names). If no page's order changes, say so instead, with the pages you compared, and the home session will label it
  `no-visible-change`.

## Batch g22 (gisday: images for #434, the admin Events list's Organization choice; 24 November 2026, about 9:00 AM Central, from `work (gisday)`) (Low) - **after g21, before g19's triage**

Home's `feat/434-events-organization-filter` at `a0d89eaf6`, from `development`. Fast-forward only. With made-up sessions at two
made-up organizations: the admin Events list before (merge-base) and after at 1280 (the Organization choice closed, then one
organization chosen), and after at 390. Commit to `docs/screenshots/434-events-organization-filter/`, add
`docs/releases/unreleased/434-events-organization-filter.md` (`app: gisday`, Before | After table, *What to test* on production Admin,
#1525), `collate --check`, push; "images pushed (434): <sha>" first in `laptop/reports/2026-11-24-g22.md`, with the PR's image table.
Overnight rules as g20; no saves needed.

## Batch g21 (gisday: images for #3382; 24 November 2026, about 8:00 AM Central, from `work (gisday)`) (Low) - **right after g20, before g19's triage**

Home's `refactor/3382-admin-entity-form-2` at `e95677be1` (stacked on `refactor/3340-admin-entity-form`; use the branch tip). As g20's
second item, the same rules, including saving and deleting made-up records in your local scratch database to raise toasts. Before is
`7c3884ea3` (the first #3340 branch, its base), after is `e95677be1`:
- the season form's and the event form's toast titles (now title case);
- a place refusal and a speaker's refused delete (now showing the API's reason).
Slug `3382-admin-entity-form-2`, release entry `app: gisday`; "images pushed (3382): <sha>" in `laptop/reports/2026-11-24-g21.md` with
the PR's image table.

## Batch g20 (gisday: images for #3354 and #3340; 24 November 2026, about 7:30 AM Central, from `work (gisday)`) (Low) - **after g19's images for #3329, before g19's triage**

Two of home's branches wait on your images for their pull requests. Fast-forward only, no `development` merged in; each adds its
screenshots and its `docs/releases/unreleased/<issue>-<slug>.md` (`app: gisday`, a Before | After table, a *What to test* row on
production, since GIS Day has no dev site, #1525), `collate --check`, push, then "images pushed (<issue>): <sha>" first in the report.

1. **#3354**, `fix/3354-public-event-hidden-sessions` at `f10267dcb` (stacked on PR 3359; use the branch tip, which has both). With a
   made-up hidden session: its public page by direct link, **signed out**, before (merge-base with `development`) and after (now
   "not found"); and the same page **signed in as the test admin**, after, unchanged. Slug `3354-public-event-hidden-sessions`.
2. **#3340**, `refactor/3340-admin-entity-form` at `7c3884ea3`. One toast of each changed wording, before and after: the tag form's
   delete, the university form's save, the organization form's title. **On your local stack you may save and delete made-up records
   in the scratch database** to raise these toasts; nothing else. Slug `3340-admin-entity-form`.

Overnight rules: no package.json or lock changes; made-up data; no email; never production; txgisday-dev only. One report,
`laptop/reports/2026-11-24-g20.md`, with each PR's image table.

## Batch g19 (gisday: images for #3329, then a signed-in triage of #498, #439, #466 and #477; 24 November 2026, about 6:45 AM Central, from `work (gisday)`) (Low) - **after g17's #545**

1. **#3329 images.** Home's `refactor/3329-season-picker` on the fork, at `f20b893ee`. Fast-forward only. With two seasons of made-up
   data: Rubrics, one admin list (Tags, say) and the account dashboard, each before (merge-base) and after, at 1280: after choosing
   the older season, and after a reload (the judging pages' season now survives it). Commit to `docs/screenshots/3329-season-picker/`,
   add `docs/releases/unreleased/3329-season-picker.md` (`app: gisday`, Before | After table, *What to test* row on production
   Admin as GIS Day has no dev site, #1525), `collate --check`, push, and report "images pushed (3329): <sha>" first, with the
   table for the PR body.
2. **Triage, as g15:** [#498](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/498) (a speaker that cannot be deleted), [#439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/439) (admin Speakers' season filter), [#466](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/466) (speaker panels' heights),
   [#477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/477) (a presenter's sessions on their details page; #3345 and #441 may have done it). One row each: done already (with
   the PR), small and still wanted (build it, a branch each, red first, images), or needs the maintainer (options and a
   recommendation). #498 names a production speaker: reproduce it with a made-up speaker shaped the same way (sessions, links),
   never with the real one, and put no real names in the report.

Overnight rules: no package.json or lock changes; made-up data; no email; never production; txgisday-dev only. Report
`laptop/reports/2026-11-24-g19.md`.

## Batch g18 (gisday: before and after images for #3328, the RSVP-type and submission-type admin pages; 24 November 2026, about 4:30 AM Central, from `work (gisday)`) (Low) - **next, before g17's #545; on your signed-in stack**

Home's `chore/3328-type-pages` on the fork, at `3075dbb1e`, moves both type pages onto the current admin bases. Titles, the Add link
and the Delete button change, so the pull request waits for images. Fast-forward only; don't merge `development` into it.
1. With made-up types (two RSVP types, two submission types): **before** from the merge-base and **after** from `3075dbb1e`, at
   1280, the list, add and edit pages for each, six pages. Add one after at 390 for the RSVP list.
2. Commit to `docs/screenshots/3328-type-pages/`, add `docs/releases/unreleased/3328-type-pages.md` (`app: gisday`, a Before | After
   table, its *What to test on dev* row saying it is checked on production in Admin, since GIS Day has no dev site, #1525), run
   `collate-release-notes.mjs --check` in Docker, push, and report `laptop/reports/2026-11-24-g18.md` with
   "images pushed (3328): <sha>" first, plus the image table for the PR body. No form saved; made-up data only.

## Batch g17 (gisday: #3370, #3376, then #545's export built the streamed way; 24 November 2026, about 3:45 AM Central, from `work (gisday)`) (Low) - **now**

Three pieces, in this order, each its own branch from the latest `development`. Overnight rules hold: **no package.json or
lock changes** (so Bull and its packages stay, even where nothing uses them any more: say so in the report), made-up data
only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only.

1. **[#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370), the admin Speakers list wider than a phone** (you filed it; Priority set Low). Use the shared
   `DashboardScrollComponent` that #3244 moved to ngx-common, the way the dashboards do; don't write list-specific CSS. Fix the
   season select being squeezed beside the heading too, with the shared layout pieces. Red first if a test can show it (a
   page-width check at 390 like #3244's); before and after at 390 and 1280, signed in. If PR 3344 (#441) changes the same
   template, build on `development` anyway and say in the report which file will conflict.
2. **[#3376](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3376), the READMEs naming Playwright v1.64.1** (you found it; filed, Low). The fix the issue
   gives: say how the image is derived, or name the current one, so the next bump doesn't leave them behind. Docs only,
   `no-visible-change`; no check beyond `git diff --check` is needed, but say what you ran.
3. **[#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545), the VGI export, your option B** (the maintainer hasn't answered; the director chose your
   recommendation to build, and he decides at the PR). Build the zip in the request and stream it, as #3185 does for slides
   and competition submissions, reusing that code rather than copying it; add the button to Admin > VGI Competition >
   Submissions. Leave #650's queue routes in place but unused, and list what could be removed once packages may change.
   Red first (the route's test), images of the button and a downloaded zip's listing (made-up submissions), check exit 0.
   If it grows past about two hours, stop at the report with what you found.

For each: push to the fork, "branch ready: <name>" with the PR body (from the template) in your report
`laptop/reports/2026-11-24-g17.md`, `app: gisday` in any release entry.

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

## Batch a11 (aggiemap: #3271, a legend entry with no symbol on dev; 23 November 2026, about 8:40 PM Central, from `work (aggiemap)`) (Medium) - **WITHDRAWN, do not run** (24 November 2026, 10:20 AM Central: the hold was right and the cause was #3358. A dev build carrying it was deployed this morning, and on it `legend.spec.ts:311` - "Freshman Selectable Parking: each layer in the legend shows its symbols" - passes on dev, 1 passed in 2.1m. The whole of `map-layers.spec.ts` also passes, 80 of 82 with no failures, including `/parking/permit-select-freshman`. So there is no service fault to investigate: #3271 is fixed and closed by #3358. The investigation below is kept only as the record of what was going to be done.)

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
