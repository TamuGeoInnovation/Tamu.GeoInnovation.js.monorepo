# Home machine: current tasks

## Batch g107 (gisday: #2588, a phone menu tile taps only on its word; then #3337, two quoted colours; 24 November 2026, about 3:45 PM Central, from `work (gisday)`) (Medium) - **now**

The maintainer is away and asked for issues to be taken to PRs. Both were checked against `origin/development` at 3:40 PM
today: neither is fixed and neither has a PR. **Two branches, two PRs**, one after the other; "branch ready: <name>" after each.

**1. [#2588](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2588) (Medium), branch `fix/2588-tile-tap-target`
from the latest `origin/development`.** Read the issue to the end. The shared mobile tiles (`libs/ui-kits/ngx/navigation/mobile-tile`)
put `tamuGiscTileLink` on `tamu-gisc-tile-title`, so only the word is a link. Fix it **in the shared tiles**, behind their
existing interface: the pages that use them (the GIS Day header, `libs/geoservices/ngx` twice) keep their markup unchanged.
Tapping anywhere on a tile follows its link; the tile is reachable and usable by keyboard with a visible focus; a tile with no link
(About, which opens a submenu) works as it does now. **Red first:** a unit test where a click on the tile's icon or padding
navigates; then green. Check: `scripts/check-in-volume.sh fix/2588-tile-tap-target <the ui-kit project>,gisday-angular,geoservices-angular`
with `CHECK_PARALLEL=1`, its `Exit` line. Images: the GIS Day menu open at 390 px, before and after, showing the tap target
(a focus ring or an outline is fine), into `docs/screenshots/2588-tile-tap-target/`, and a release-notes file
`docs/releases/unreleased/2588-tile-tap-target.md` with `app: gisday`. Push to the fork; `.pr-body.md` from the template as the
last commit.

**2. WITHDRAWN (about 6:45 PM Central): the laptop has #3337 as batch a13; home does only part 1.** [#3337](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3337) (Low), branch
`fix/3337-quoted-background` from the latest `origin/development`.** `light-pole.component.scss` and `lighting.component.scss`
under `libs/gisday/platform/ngx/core/src/lib/pages/competitions/` set `background-color: '#500000'` (a string, which the browser
discards). Use the shared maroon (look in `libs/sass/` first; #2605 swept `#500000` into a variable - use that one, not a literal).
**Before you change anything, check whether either page is still routed and reachable**; if neither is, say so in the report and
stop: the issue then becomes a deletion question for the maintainer, not a colour fix. Otherwise: a check that fails on a quoted
colour if one is cheap (say if not), images of the `img#geosat` area before and after, a release-notes file with `app: gisday`,
the same check-in-volume run for `gisday-platform-ngx-core,gisday-angular`, push, `.pr-body.md` last.

Report `home/reports/2026-11-24-g107.md`, with each branch's red/green lines and `Exit` line.

## Batch a11 (aggiemap: fresh "after" images for #3425, which your own finding invalidated) (Medium) - **now**

Your finding (2) was acted on: the maintainer chose to fix the duplication on this branch rather than file it.
So the branch has moved and **your two "after" images now show something that is no longer true** - each garage
appearing twice. That is not a mistake in your capture; the capture is what caused the change.

Branch: `fix/3425-garage-search-off-raster`, now at **`6d2c0f118`** on the fork. Fetch it fresh.

### What changed since you photographed it

- `ba312e64d` - your finding (1): the smoke case typed "Central Campus Garage", which matches nothing now.
  Fixed, and your space-padding observation became a test: `bldgabbrev` is padded for PC26, PC27 and PW GAR,
  so without trimming those three links would carry `%20`s and find nothing.
- `6d2c0f118` - your finding (2): the typed **building** search now excludes garages
  (`type IS NULL OR type NOT LIKE 'GARAGE%'`), so each garage appears once. The two **exact** sources that
  resolve `?bldg=` deep links deliberately keep no filter, so a deep link to a garage still works.

### What this batch needs

**Only the two "after" images.** Your "before" pair from `50b125bf5` is still correct and stays as it is.

Re-take, same window size and the same search term you used:

- `after-garage-search.png` - searching `garage`. **Each garage should now appear once.** If the Building and
  Parking Garage categories still show the same rows, the fix did not work: **stop and say so**, do not
  photograph around it.
- `after-garage-popup.png` - Central Campus Parking Garage's popup, which should read its name as before.

Commit over the existing two files in `docs/screenshots/3425-garage-search/`, push to the fork as a
fast-forward, and say **"branch ready: fix/3425-garage-search-off-raster"**.

### Two checks while you are there, both cheap and both load-bearing

- **A `?bldg=` deep link to a garage still resolves.** This is the half the fix deliberately did not touch, so
  it is the half most likely to have broken by accident. Pick any garage's building number or abbreviation.
- **`?garage=CCG` still resolves**, as it did in a10. The de-duplication should not have touched it, and a
  second reading costs you one page load.

Report `home/reports/2026-11-24-a11.md`, and say what you saw for both checks even when they pass - a pass
nobody recorded is indistinguishable from a check nobody ran.

### For the record

Your three other findings are filed and credited to this batch's predecessor:
[#3433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3433) (a general search
returns 5 garages of 10, and which five is arbitrary) and
[#3434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3434) (row Y316 is
`type GARAGE` with every identifying field null, so garages count 11 where the campus has 10). Neither is
this branch's to fix.

## For the maintainer, at the home machine (24 November 2026, from `work (aggiemap)`) - **needs Administrator, not the listener's**

`tidy.sh --yes` ran here and freed **106 GiB** (83.3 to 189.2 GiB). Three steps are left that need an elevated
PowerShell on **this** machine, so they are neither the listener's nor runnable from the work machine. Run them when
you are next here; nothing is urgent, and 189 GiB is about eleven checks' worth.

**1. The four worktrees that could not be removed** (wt-1220, wt-1276, wt-1277, wt-1278), which failed on
"Filename too long":

```powershell
cd "C:\TAMU"; git config --system core.longpaths true
```

**2. One volume is held by two containers that exited six weeks ago**, `sa10` and `sa11`. The listener left them
rather than guessing, which was right. Glance at what they were, then:

```powershell
cd "C:\TAMU"; docker rm sa10 sa11
```

**3. The compaction, which is the large one: about 640 GiB.** The Docker image here is still **856.3 GiB** because
compaction was not run. **It stops Docker Desktop**, so `gisday-api`, `gisday-redis`, `gisday-db` and `mssql` on this
machine go down with it - check the GIS Day chat is not mid-run first. The work machine's compaction on 24 November
took its image from 991.8 GB to 296.1 GB in about 40 minutes.

**Listener: do not attempt these.** They are recorded here so they are in front of whoever is at this machine, not as
a batch.

## Batch a10 (aggiemap: before and after images for #3425, the garage search) (Medium) - **now**

[#3425](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3425) is committed on the fork as
`fix/3425-garage-search-off-raster` (`7c1ad1d90`). It has a visible result and **no pull request yet**, because one opens
once its screenshots are on the branch so CI runs once. **This batch is the only thing it waits on.**

### What changed, so you know what you are photographing

The garage search read the retired raster basemap's Garage Parking layer. It now reads Campus Structures on the vector
basemap's feature service, filtered to `type LIKE 'GARAGE%'`. **The displayed names change**, because the two services
name the same garages differently:

| Searching | Before | After |
| --- | --- | --- |
| `garage` | Southside Garage, Central Campus Garage, Northside Garage, ... | Southside **Parking** Garage, Central Campus **Parking** Garage, ... |

That rename is the visible change. It is Facilities' published naming and is deliberate - not something to flag as a
fault.

### 1. Before, on `development`

A local dev server at the merge-base (`50b125bf5` or today's `development`, say which you used). Search **`garage`** in
the main map's search box and photograph the **results list** with its entries readable. Then open **Central Campus
Garage** from the results and photograph its **popup**.

Two images: `before-garage-search.png`, `before-garage-popup.png`.

### 2. After, on the branch

The same two, same window size, same search term, from `fix/3425-garage-search-off-raster`:
`after-garage-search.png`, `after-garage-popup.png`.

**The popup is the one that matters.** Garages used to carry lot fields and now carry building fields; reading the wrong
one is what rendered the popup empty in
[#1163](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1163). The "after" popup must show
the garage's **name**, not an empty heading. If it is empty, **stop and report that** - do not work around it.

### 3. Two things to check while you are there, and report either way

- **A shared link still resolves.** Open `?garage=CCG` on the branch - it must find Central Campus Parking Garage.
  `bldgabbrev` carries the old codes, which is what this relies on; if it fails, the migration is wrong.
- **The search returns garages only.** No halls, no offices. "TEEX ITSI Garage & Offices" must **not** appear: it is
  `type = 'RESEARCH'`, and a search on the name alone returns it.

### 4. Pushing and reporting

Commit both pairs to `docs/screenshots/3425-garage-search/` on that branch and push to the fork (a fast-forward; never
force-push). Say **"branch ready: fix/3425-garage-search-off-raster"**.

Report `home/reports/2026-11-24-a10.md`: the image paths, which commit the "before" came from, the two checks above with
their results, and anything that looked wrong. **No pull request** - the director opens it.

## Batch a9 (aggiemap: the quick tier on dev for today's second release, #3161; 24 November 2026, about 2:00 PM Central, from `work (aggiemap)`) (**High**) - **WITHDRAWN (about 4:15 PM Central): the work machine ran it instead. Do not start it.**

It was queued here at 2:00 PM and this machine was stopped on a permission prompt for `tidy.sh --yes`, which nobody could see ([#3429](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3429)). The release could not wait, so the work machine ran the tier once its production run had finished: **365 passed, 0 failed, 0 flaky, 28 skipped in 4.8 minutes** against dev at `50b125bf5`, and the notes have merged. Nothing is owed here. The original batch text is left below as the record.

**A production release goes out today once this passes**, so this is the only thing between the build and the deploy. The work
machine cannot run it: it is running the `release` tier against **production** for this morning's release, and two Playwright
containers on one machine is what makes layer-order and popup checks fail for reasons that are not real (the laptop's a12 report,
23 November).

### What shipped, and why the tier is small

The build is **`50b125bf5`**. Twenty commits since `dev-2026-11-24` (`61dc13b89`), and **exactly one of them changes anything an
AggieMap visitor sees**: [#3161](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3161) via
[PR 3422](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3422), the remote campuses' new names. The other
nineteen are GIS Day, docs, the smoke suite and workspace.

Two of those nineteen matter to **you**, because the suite runs from the checkout rather than from the build:

- [PR 3423](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3423) fixes
  [#3416](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3416), so `NearmapCSBasemap` **no longer fails**
  `services.spec.ts`. If you still see that failure, your worktree is not at `50b125bf5`. That is the tell, and it is worth checking
  before you report anything.
- [PR 3421](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3421) adds `node scripts/check-gis-differences.mjs`
  as a `lint.yml` step. It does not affect this run; it will appear in any check you run from now on.

### 1. First, prove dev is actually serving the new build

**Do not start the tier until this is true.** A tier against the previous build passes and means nothing, which is the same trap as
running specs from a stale checkout.

Open `https://dev.aggiemap.tamu.edu/campus/dc-bush-school/map/d` and read the sidebar heading:

| It says | What that means |
| --- | --- |
| **Washington DC Campus** | The new build is live. Go to step 2. |
| `Aggie Map - DC / Bush School` | The deploy has not landed. **Wait and look again**; do not run the tier, and do not report a pass. |

That heading is `applicationName`, rendered as the sidebar's `<h1>`, and it is the one visible thing this build changes - which makes
it an exact deployment signal. On production right now it still reads `Aggie Map - DC / Bush School`, confirmed at 1:50 PM Central.

### 2. The quick tier

From a worktree at **`50b125bf5`**, on a machine doing nothing else:

```
test/smoke/aggiemap/run-local.sh development quick
```

No `-x`: let it run through, so one failure does not hide the rest. **Say what it prints as its set** before the first test starts -
the quick tier chooses from what changed since the last `dev-*` tag, and with #3161 being the only visible change, the set should
name the campus maps. If it names something unexpected, or cannot map a changed file to a test, put that in the report: that is a
finding about the tier, not noise.

### 3. The three campus pages by eye, at 1280

The tier does not check these strings, so this is the only thing that does. On **dev**:

| Page | The sidebar heading must read |
| --- | --- |
| `/campus/dc-bush-school/map/d` | **Washington DC Campus** |
| `/campus/galveston/map/d` | **Galveston Campus** |
| `/campus/mcallen/map/d` | **McAllen Campus** |

And on `https://dev.aggiemap.tamu.edu/all-maps`, the three descriptions:

| Card | Must read |
| --- | --- |
| DC / Bush School | Map of the Texas A&M University at Washington, DC campus. |
| McAllen | Map of the Texas A&M University at McAllen campus. |
| Galveston | Map of the Texas A&M University at Galveston campus. (**unchanged** - it was already right) |

The card **names** stay `DC / Bush School`, `Galveston` and `McAllen`. Only the descriptions changed. If a name changed, that is a
fault: say so loudly, because two specs pin the card order by those names.

No screenshots needed - the pull request already carries before and after for all four pages.

### 4. Reporting

`home/reports/2026-11-24-a9.md`, and say **"work report ready: home/reports/2026-11-24-a9.md"**.

Lead with the one line the release waits on: **pass or fail, and whether the three campus pages read correctly.** Then the counts
(passed, failed, flaky, skipped, duration), the set the tier chose, and every failure with your reading of it - real, timing, or a
service having a bad hour. **Re-run any failure alone before calling it real**, as a12 did; that is what separated the two genuine
faults from the noise this morning.

Nothing is tagged, no pull request is opened, and production is not touched. The tag and the deploy are the maintainer's.

## Batch g106 (gisday: #3412's Papers page, on PR 3415; 24 November 2026, from `work (gisday)`) (Medium) - **WITHDRAWN (about 1:20 PM Central): PR 3415 merges as it is and the laptop does Papers as batch g25. Do not start it.**

**Decided by the maintainer** on g105's question 1: **(a)**, and PR 3387 has now merged. PR 3415 is open from the fork's
`fix/3412-awards-sentence`; the work machine added two commits on top of yours (`.pr-body.md` removed, `origin/development` merged in),
so **fetch the fork's branch and build on its tip**; never force-push.

Move the Papers page's awards lead-in inside `<tamu-gisc-competition-session>`, exactly as you did for Posters and Presentation, and
any other lead-in 3387 added there (the finalists' or the deadline's, if one introduces a session). **Red first:** the same spec as
the other pages, on Papers, with a season whose awards session is not found. Then `scripts/check-in-volume.sh fix/3412-awards-sentence
gisday-platform-ngx-core,gisday-angular` with `CHECK_PARALLEL=1`, its `Exit` line, push (a fast-forward). Images: Papers before and
after at 1280 and 390 into the same `docs/screenshots/3412-awards-sentence/`. **No `.pr-body.md` this time:** put the new image rows
and the red/green lines in your report, and the work machine edits the PR. Report `home/reports/2026-11-24-g106.md`, "branch ready"
first.

## Batch g105 (gisday: #3412, the Papers page's empty awards sentence; 24 November 2026, from `work (gisday)`) (Medium) - **now**

[#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412): read it to the end. With no awards session
found (none chosen for the competition, #3019, and no `AWARDS:` session naming poster or presentation), the Papers page prints
"Winners will be announced at the awards session:" with nothing after. **Rule 4 first** on today's `development` (PR 3387, the
Papers page's dates, may or may not have merged; build on `development` either way, and say which you saw).

Branch `fix/3412-awards-sentence` from the latest `development`. **Red first:** a spec on the Papers page whose season has only
"AWARDS: Winner Announcements" and none chosen: no sentence ending in a colon. The fix leaves the sentence out when there is no
session, **as the page already does for the finalists line with no date**; reuse that, no new pattern. `awardsSession()`'s name
match stays the fallback. Then `scripts/check-in-volume.sh fix/3412-awards-sentence <projects it edits>,gisday-angular` with
`CHECK_PARALLEL=1` (these GIS Day tests time out under load), read its `Exit` line, push to the fork, never force-push.

Images: the Papers page before (merge-base) and after, at 1280 and 390, made-up seasons only, to
`docs/screenshots/3412-awards-sentence/`, with `docs/releases/unreleased/3412-awards-sentence.md` and `collate --check`. A
`.pr-body.md` from the template, with a `Title:` line, as the last commit. No PRs. Nobody but the security chat touches
`package.json` or the lock. Report `home/reports/2026-11-24-g105.md`, "branch ready: <name>" first.

## Batch a8 (aggiemap: the full check on PR 3407, and what this machine is holding on disk; 24 November 2026, 11:00 AM Central, from `work (aggiemap)`) (Medium) - **after the security and gisday batches already queued**

**Not urgent, and deliberately queued behind what is already here.** Nothing waits on it: PR 3407 is not blocking a release.
It was going to the lab as batch 203; the lab is paused for the student, so it comes here.

**1. What is this machine holding? (report only, removes nothing.)**
- Work from a worktree at `fork/chore/3400-disk-guard-and-tidy` - the branch of [PR 3407](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3407). It is not on `development` yet.
- Run `bash scripts/tidy.sh` with **no arguments**. It only reports. **Do not run `--yes` or `--compact`.**
- Report its whole output, plus this machine's free disk space and, if it has one, the size of Docker's disk image
  (`%LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx`).
- **The work computer's numbers, for comparison:** 460 worktrees at 589 MiB each (about 271 GB), 323 `tamu-js-*` volumes at
  **2,705 MiB each** (about 853 GB), and a Docker disk image of **991.8 GB** - on a 1,907 GB disk that reached **0 bytes
  free** on 23 November ([#3365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3365)).
- The question this answers is the maintainer's: **is the same creep on every machine, or only on that one?** A small number
  here is as useful an answer as a large one.

**2. The full check on PR 3407's head.**
- `scripts/check-in-volume.sh chore/3400-disk-guard-and-tidy` (affected). **Read the log's own `Exit N` line** and quote it.
- **This branch changes the script you are running it with**, which is the point of running it on a machine other than the
  one it was written on. The check runs the committed copy from the volume's clone, so it exercises the new code. Two things
  to look for and quote:
  - The header line should now print free space, e.g. `... parallel 8; 162.8 GiB free; log: ...`.
  - If this machine has **under 60 GiB free**, the run will **sweep before it starts** - removing worktrees whose pull
    request has merged and `tamu-js-<issue>` volumes whose issue is closed - and say so. That is the new behaviour and it is
    correct, but say in the report whether it happened, because it changes what task 1 measured.
- Also run `bash scripts/tidy.test.sh` (15 cases) and `bash scripts/check-in-volume.test.sh`, and give both counts. Neither
  needs Docker or the network.

**Don't touch:** `development`, any tag, any pull request, production, or the work computer. Do not run `tidy.sh --yes` here
in this batch - task 1 is a measurement, and what gets removed is the director's call once the numbers are in.

Report `home/reports/2026-11-24-a8.md`, then say "report ready: <file>".

## Batch s81 (security: check Dependabot PR 3401, highlight.js 11.12.0 and maplibre-gl 6.19.0, for #3405; 24 November 2026, from `work (security)`) (Low) - **now**

[PR 3401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3401), tracked by [#3405](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3405). Both minor. Never push to the Dependabot branch.
- Fetch the PR's head (`git fetch origin pull/3401/head:dependabot-3401`) and run the full check on it:
  `scripts/check-in-volume.sh dependabot-3401` (it runs the clean `npm ci` because the lock changed). Read its `Exit` line.
- The lock diff against `development`: only `highlight.js`, `maplibre-gl` and their own dependencies may move. List anything else.
- `maplibre-gl` draws the vector basemaps: if a dev server is free, load AggieMap's home map and one event map on the PR's code and
  say whether the basemap draws (no images needed unless something differs).
- Post the result on PR 3401 as one comment (check exit, lock diff summary, what you looked at), then report
  `home/reports/2026-11-24-s81.md`. If anything fails, say whether it is this PR's or `development`'s.

## Batch s80 (security: #2282, geoservices and GIS Day off `@angular/animations`, and the package removed; 24 November 2026, about 9:30 AM Central, from `work (security)`) (Low) - **now**

**Decided by the maintainer this morning: a listener does this, with recordings.** [#2282](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2282)
is the last part of #2278. Read its body to the end; the lab's report `work/reports/2026-10-23-96.md` on this branch recorded the before.
- Rule 4 first: on today's `development`, list every remaining `@angular/animations` import and trigger. Report the list.
- Branch `chore/2282-remove-angular-animations` from the latest `development`. Move each remaining trigger (the geoservices hamburger,
  the phone tile menu and its staggers, the header's growing rows, GIS Day's interactive forms) to CSS transitions or `animate.enter` /
  `animate.leave`, **reusing whatever #2278's earlier parts already put in the shared libraries**; no per-component copies, no
  purpose-built CSS where `libs/sass` has it.
- Then remove every app's animations provider, `libs/ui-kits/ngx/animations`, and `@angular/animations` from `package.json`.
  **This batch alone may change `package.json` and `package-lock.json`, for that one package**:
  `npm install --package-lock-only --ignore-scripts`, and the lock diff must show only `@angular/animations` leaving.
- **Recordings, before and after, of each moved trigger** (Playwright video or a frame sequence against the dev server, phone width for
  the tile menu), saved to `docs/screenshots/2282-animations/` as they are taken. If this machine cannot record, say so and list the
  routes and widths for the laptop instead; do not stop the code for it.
- Full check, not a scoped one (it removes a package): `scripts/check-in-volume.sh chore/2282-remove-angular-animations`, plus the
  clean `npm ci` it runs. Push to the fork; "branch ready" with the PR body (from the template) in `.pr-body.md`. The director opens it.
Report `home/reports/2026-11-24-s80.md`.

## Batch g104 (gisday: code-only triage of #434, #435, #438, #493, #499 and #1038; 24 November 2026, about 8:30 AM Central, from `work (gisday)`) (Low) - **now**

**Your g103 question 1 goes to the maintainer** (your A is the recommendation). `feat/3321-papers-dates` is held until he answers:
no images, no PR yet.

Six older GIS Day issues with no status. For each, rule 4 on today's `development` and one row in a table in your report:
**done already** (the PR or commit; the director closes it), **small and still wanted** (build it, one branch each from the latest
`development`, red first, check; if it is visible, say what the laptop should capture and stop short of the PR), or **needs the
maintainer** (options and a recommendation; don't build).
- [#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434) organization filter on the admin Events page; [#435](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/435) bulk actions on the admin Events page;
  [#438](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/438) the admin Users view paged or tabled; [#499](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/499) hide an organization from the Sessions filter;
  [#493](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/493) the art challenge page's winner text (editorial: needs the maintainer unless the text is in the issue);
  [#1038](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1038) development reporting into production's Google Analytics property (read the issue to the end; it may need only a deployment value, which is the work machine's, not code).
- Reuse before building: the shared list base, filters and `DashboardScrollComponent`; no purpose-built CSS.
Overnight rules: no package.json or lock changes, no migrations. Report `home/reports/2026-11-24-g104.md`, PR bodies for anything built.

## Batch g103 (gisday: #3321, the Papers competition page takes its dates from the season; 24 November 2026, about 8:00 AM Central, from `work (gisday)`) (Low) - **now**

Your g102 branch waits for the laptop's images (its g21); the director opens it then.

[#3321](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3321): the Papers page still says 2020's dates. #3309 and #3019 moved Posters and Presentation onto the season; #3019 is
PR 3322, **not merged**. Rule 4 first.
- Branch `feat/3321-papers-dates` **from `feat/3019-competition-sessions-chosen`** (PR 3322), the body opening "stacked on PR 3322:
  merge that first". Reuse exactly what Posters and Presentation use, with no Papers-only copy; if Papers' settings row needs
  something those two don't, say so rather than adding a migration.
- Red first (the page's text for a made-up season). Check `gisday-platform-ngx-core,gisday-angular` (plus the API if touched).
- Public page, visible: the laptop takes the images afterwards, so give it the routes and the made-up season settings it needs.
Overnight rules: no package.json or lock changes, no migrations. Push; "branch ready" with the PR body in
`home/reports/2026-11-24-g103.md`.

## Batch g102 (gisday: #3382, #3340's second PR, the other five forms; 24 November 2026, about 7:30 AM Central, from `work (gisday)`) (Low) - **now**

**Decided:** your g101 question 1, **A**, and start it now rather than after the merge. Your g101 branches wait for the laptop's
images (its g20); the director opens both PRs when they land.

- **Its own issue: [#3382](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3382)** (Low), because the first PR closes #3340 and the linked-issue check needs a
  `Closes`. Branch `refactor/3382-admin-entity-form-2` **from `refactor/3340-admin-entity-form`** (`7c3884ea3`); its PR body opens with
  "stacked on the first #3340 PR: merge that first" (the director fills in the number) and says `Closes #3382`.
- Sponsor, place, speaker, season and event onto `adminEntityForm`, keeping each one's own flow (sponsor's `_formData()` from
  #1962 goes only if PR 3349 has merged; otherwise leave it and say so). Pin first, as before; list every toast whose wording
  changes; visible only through those, so name them and the laptop takes images.
- Check `gisday-platform-ngx-common,gisday-platform-ngx-core,gisday-angular`. No package.json or lock changes. Push to the fork;
  "branch ready" with the PR body in `home/reports/2026-11-24-g102.md`. If one form will not fit the shape, leave it, say why.

## Batch g101 (gisday: #3354, then #3340; 24 November 2026, about 6:45 AM Central, from `work (gisday)`) (Low) - **now**

Your g100 branches: #3379 is PR 3380; #3329 waits for the laptop's images (its g19), then the director opens it.

1. **[#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354), the public event routes return hidden sessions** (found in #3345). Rule 4 first. Branch
   `fix/3354-public-event-hidden-sessions` from the latest `development`. Reuse #3345's filter (PR from
   `fix/3345-presenter-hidden-sessions`; if it has not merged, take its helper by building on it and say "stacked on PR <n>"),
   so the public routes and the presenter route hide sessions one way. Admin routes keep seeing everything: a test shows that too.
   Red first; check `gisday-platform-data-api,gisday-nest`; no visible change unless a public page drew a hidden session, in which
   case say so and the laptop takes images.
2. **[#3340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3340), one AdminEntityForm** for the eleven admin add/edit forms' save, delete and toasts. Branch
   `refactor/3340-admin-entity-form` from the latest `development` (or on #3327's branch if it has not merged and you need its
   `formToFormData`; say so). Pin first, as for #3330 and #3328: each form's toast text and ids, captured on today's code, then the
   refactor. Where the forms disagreed, keep the majority's wording and list the changed ones. Visible only if a toast's text
   changes: if so, say which, and the laptop takes images. Check `gisday-platform-ngx-common,gisday-platform-ngx-core,gisday-angular`.
   If it grows well past three hours, push what is proven and stop.

Overnight rules: no package.json or lock changes. Push to the fork; one report `home/reports/2026-11-24-g101.md` with the PR bodies.

## Batch g100 (gisday: #3379, then #3329; 24 November 2026, about 6:00 AM Central, from `work (gisday)`) (Low) - **now**

**Decided:** your g99 question 1, **A**. Filed as [#3379](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3379) (Low). Your g99 branch is PR 3378.

1. **[#3379](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3379), the five providers that clone nested records.** Branch `refactor/3379-nested-season-copy` **from your
   g99 branch** (`refactor/3324-season-scoped-provider`, PR 3378, not merged); say so at the top of the PR body, as "stacked on
   PR 3378: merge that first". One shape (the shared copy plus a per-provider hook for the nested part, or better if you find
   it), the five moved onto it, with the shared guards and 422s; red first where a copy lacked a guard. The same pin-and-differences
   table as g99. Check `gisday-platform-data-api,gisday-nest`. If the design is not clear from the code, stop at the report with
   options and a recommendation rather than guessing.
2. **[#3329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3329), one season picker.** From the latest `development`, branch `refactor/3329-season-picker`. Rule 4 first.
   A `SeasonPicker` in `platform/ngx/common` that keeps the season in the address (`?season=`), used by `BaseAdminListComponent`,
   the research-competition pages that use `seasonChoice()` (Rubrics, Judging results, Winners), and the account and VGI
   dashboards, which then stop extending the list base just for it. Keep what a new site with no season does (#2076). Pin the
   behaviour first (the address after choosing, a reload keeping the choice, no season). It is visible on admin pages, so no
   PR until the laptop's images: report "branch ready" and the director queues them.

Overnight rules: no package.json or lock changes. Push to the fork; one report, `home/reports/2026-11-24-g100.md`, with both PR
bodies.

## Batch g99 (gisday: #3324, one season-scoped base provider; 24 November 2026, about 5:15 AM Central, from `work (gisday)`) (Low) - **now**

[#3324](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3324): ten providers each write `forSeason`, `forActiveSeason` and `copyIntoSeason`, and one catch block is pasted
63 times across 17 files. Fixes have reached one copy each (tag's null guard, class's `[]` guard, event-location's missing
`await`). Rule 4 first: confirm the copies on today's `development` and list where they already differ.

- Branch `refactor/3324-season-scoped-provider` from the latest `development`. `SeasonScopedProvider<T>` in
  `platform/data-api/src/lib/_base` beside `BaseProvider`, with the three methods, and one `rethrowHttp(err, ctx)`. The ten
  providers extend it.
- **The differences are the point.** Where one copy has a guard the others lack, the shared method has it, and a test shows the
  others now get it too (red first, against one provider that lacked it). The unreachable `throw 422 'No active season found.'`
  goes: `SeasonService.findOneActive()` throws 404 first; pin that status with a test before removing it.
- The query-checking specs from #2363 (and #3313's shared helpers, PR 3372, not merged yet: build on `development` and say
  which spec files will conflict) should keep passing unchanged; any you have to edit, say why.
- Check: `gisday-platform-data-api,gisday-nest`. No visible change. Overnight rules: no package.json or lock changes. Push to the
  fork; "branch ready: refactor/3324-season-scoped-provider" with the PR body in `home/reports/2026-11-24-g99.md`. It is sized
  L: if it grows well past three hours, push what is proven, stop, and report what remains.

## Batch g98 (gisday: #3323, one Central-time module; 24 November 2026, about 4:30 AM Central, from `work (gisday)`) (Low) - **now**

[#3323](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3323): `'America/Chicago'` is hard-coded in about ten files, and the calendar-day logic exists three times
with two daylight-saving calculations. Rule 4 first: confirm the copies on today's `development` and list them in the report.

- Branch `refactor/3323-central-time` from the latest `development`. Export `GISDAY_TIME_ZONE`, `centralDay()`,
  `centralInstant()` and `formatCentral(date, style)` from `libs/gisday/common/src/lib/central-time.ts`, and use them everywhere
  the issue lists. The narrow no-break space before AM/PM is replaced in one place, for every caller.
- **Pin first:** tests capturing what each caller prints today, including a date either side of the November and March
  changes, passing on today's code alone (as `pin/3330` did), then on the refactor. If a caller printed something different
  from the others, that difference is a finding: keep the majority's form, and say in the report and PR body which caller
  changed and how.
- `libs/ui-kits/ngx/charts`' `dayIn` is a shared chart library, not GIS Day: leave it unless it can take the zone as an input
  without changing AggieMap, and say which.
- Check: every project you edit plus `gisday-angular,gisday-nest`. Overnight rules: no package.json or lock changes. Push to
  the fork; "branch ready: refactor/3323-central-time" with the PR body in `home/reports/2026-11-24-g98.md`. If it grows
  well past two hours, stop at the report.

## Batch g97 (gisday: #3328 as one set of type pages and one shared type form; 24 November 2026, about 3:45 AM Central, from `work (gisday)`) (Low) - **now**

**Decided:** your question 1 on g96, **A**. One set of list, add and edit pages for "types", configured per route by service and
noun, and one shared type form in `platform/ngx/common/.../forms` (one field, `type`, with the current base's dirty-tracking,
Escape and "Leave without saving?"). Then delete `BaseAdminAdd`, `BaseAdminDetail`, `BaseAdminView` and their four route files.

- Branch `chore/3328-type-pages` from the latest `development`.
- **Red first:** Escape and "Leave without saving?" on the RSVP type page, failing on today's code.
- Pin what the pages show today (titles, column headings, the field's label) before moving them, as you did for #3330, so the
  move is proven to change nothing else.
- Check: `scripts/check-in-volume.sh chore/3328-type-pages gisday-platform-ngx-core,gisday-platform-ngx-common,gisday-angular`.
- No sign-in here, so no images: say so, and the director gives the laptop the images afterwards.
- Overnight rules: no package.json or lock changes. Push to the fork; "branch ready: chore/3328-type-pages" with the PR body
  (from the template) in `home/reports/2026-11-24-g97.md`. If it grows well past two hours, stop at the report.

## Batch g96 (gisday: #3313, #3330 and #3328, three small shared pieces from the one-off scan; 24 November 2026, about 2:30 AM Central, from `work (gisday)`) (Low) - **now**

In this order, each its own branch:
1. [#3313](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3313): the query-spec helpers (`answering`, `loadedSeason`, `buildingTransactionFinds`, `buildSeasons`, and the two
   the issue names) move into `libs/gisday/platform/data-api/src/lib/_base/query-checking-data-source.ts` or a `query-testing.ts`
   beside it, exported; every spec imports them; `loadedSeason` gets every Season deadline column once. Tests only, so no red
   step: say so. Branch `test/3313-shared-query-spec-helpers`.
2. [#3330](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3330): the RSVP, check-in and VGI dashboards share one template on `shared/event-dashboard`, with inputs for their
   nouns; the rendered pages unchanged (a test per dashboard that its headings and labels are as today, passing before and after).
   Branch `refactor/3330-one-dashboard-template`.
3. [#3328](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3328): RSVP types and submission types move onto `BaseAdminListComponent` / `BaseAdminDetailsPageComponent`, and the
   three old base classes and their route files go. Red first: Escape and "Leave without saving?" on the RSVP type page. These
   are admin pages, so the images are the laptop's afterwards; say what made-up data shows them.
   Branch `refactor/3328-type-pages-on-current-admin`.

Overnight rules: no `package.json` or lock changes; no release or full tier; made-up data; never production. Rule 4: filed tonight from code, each side read; confirm on today's `development` first and say so. One branch each from the latest `development`, behind existing interfaces, red first where a test can show it, the check (`CHECK_PARALLEL=4` or lower for a large set, #3000), push, "branch ready" with each PR body. The work machine's C: is full (#3365); nothing changes for you. Report `home/reports/2026-11-24-g96.md`.

## Batch a6 (aggiemap: turn the release tier's 17 remaining failures into issues, #3355; 23 November 2026, about 10:45 PM Central, from `work (aggiemap)`) (High) - **do this first**

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3355>

**The 23 November dev build was not cleared.** The release tier exited 1: 18 failed, 7 flaky, 982 passed, 1.6 hours. One
failure was tonight's #3299 and it is already fixed ([#3350](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3350),
PR 3352). The other 17 were there before tonight, nobody had classified them, and **they are what holds the release**.

#3355 has the full classification with the evidence. Read it first. Your job is to turn each cluster into something that
can be acted on, so the tier is made green deliberately rather than by re-running it and hoping.

**Verify before you file. Every one of them.** #3355's classification is mine, from reading a log — not from asking the
service or opening the page. Overnight rule 4 applies to my analysis as much as to an old issue, and tonight my
recommendation in a4 was wrong for exactly this reason. Where you disagree with my reading, say so; that is more useful
than agreement.

**One issue per cluster, not per failing test**, each with: what fails, the evidence you gathered, whether it is ours or
another team's, and what would make it green. Set the fields as `CLAUDE.md` says, choose a Priority yourself and record
it in the issue (the maintainer is asleep; list every choice in your report).

In this order, because the first two are the ones most likely to be another team's and so the slowest to resolve:

1. **The October raster basemap's HTTP 400s** (2 failures). `FCOR/TAMU_Basemap_20261008/MapServer` returns 400 "Unable to
   complete operation" to `where=1=1&returnCountOnly=true` on layers 2 `University Building`, 4 `Trees`, 32 `Field Line`,
   48 `Sports and Rec Field Area`. **Query the service yourself** and say whether it is all four every time or
   intermittent, whether other layers in the same service answer, and whether production's copy behaves the same. If it
   is the service, it is a GIS-team fault: file it, and add the entry to `environments.json` that keeps it visible
   without turning the suite red.
2. **The empty filters** (3 failures: business-parking, contractor-parking, permit-select-freshman). For example
   `Only UB+ Permit Authorized`, whose filter selects none of the 90 features its service holds. Ask the service: do the
   fields exist, and how many records carry each value? This is the #1961 and #2500 shape, so **do not change a filter to
   one that is also empty** — if the data is missing, that is the GIS team's.
3. **The 60-second draw timeouts** (2 failures: Lot 100g on `/events/nsc-parking` and `/events/break-summer`). Open both
   pages and time them. If they genuinely take over a minute, that is a performance issue worth its own issue with the
   measurement in it, not a flaky test.
4. **The `basemap-requests` assumption** (1 failure). 2 of 10 loads of `/map/d` sent **zero** queries to the campus
   features service, so the check failed on its own premise before measuring anything. Find out whether a load can
   legitimately send none (caching between loads in one context, or the tile cache alone being enough at that extent). If
   it can, the check needs to say so rather than fail.
5. **`layer-order` on `/parking/indoor-track-parking`** (3 failures, all 3 loads). The only `layer-order` failure that did
   not pass on some load, so the only one that looks real. muster and graduation-spring appear among the flaky.
6. **Nature Rx search** (2 failures) and **`perspective.spec.ts` 3D buildings** (flaky). Check against the open Nature Rx
   issues first — these may already be filed, and rule 4 says prove it before building.

**Then say, in one table in your report, which of the 17 would still be red after everything you filed**, and what each
needs. That table is what the maintainer reads to decide whether the release goes.

**Do not touch `environments.json` without saying so loudly in the report** — the security chat may add a `#3265` entry
there tonight and PR 3334 already adds `allowedOutboundLinkFailures` to it. If you need an entry, make it its own commit
so a conflict is a two-line "keep both".

**Do not run a release or full tier.** `one <spec>` against dev is what you need, and the specs are named in #3355.
**Roughly 2 hours**, and it is fine to report partway with what you have if you reach the end of your night.

## Batch g95 (gisday: #3325 and #3331, two small shared pieces from the one-off scan; 24 November 2026, about 1:15 AM Central, from `work (gisday)`) (Low) - **after g94**

Two branches, each behind its existing callers' interfaces, output unchanged:
1. [#3325](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3325): one `CompetitionSeasonService.findActive(relations?)` in `competitions/data-api`, replacing the six
   lookups the issue lists. Keep each caller's current status and message unless they disagree, in which case use the
   most common one and list the change in the PR. Branch `refactor/3325-active-competition-season`.
2. [#3331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3331): `naturalOrder` and `byName` move to `libs/gisday/common/src/lib/names.ts`, exported, and the ten sorts the
   issue lists use them. Where a sort's options differ today (`numeric`, locale), pick the one `naturalOrder` uses and say in the
   PR which lists change order and how (with a made-up example). Branch `refactor/3331-one-name-order`.
Overnight rules: no `package.json` or lock changes; no release or full tier; made-up data; never production. Rule 4: these were filed tonight from code, each side read; confirm on today's `development` before building and say so. Branch from the latest `development`, red first, the check (at `CHECK_PARALLEL=4` or lower for a large affected set, #3000), push, "branch ready" with the PR body. Report `home/reports/2026-11-24-g95.md`.

## Batch g94 (gisday: #3345, a presenter's public details route names their hidden sessions; 24 November 2026, about 1:15 AM Central, from `work (gisday)`) (Low) - **after g92**

**Decided on your report g92 (the director, about 1:25 AM Central):** A, the profile email stays on its links table; no migration onto `speaker_email_claims`. Your g92 is PR 3351. g94 and g95 are new since your last pull.

[#3345](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3345): `GET /speakers/:guid` (`getPresenter`, public) loads every event the speaker is in, inactive (hidden) ones
included. Load or return only active events there, with a test that a hidden session's name is not in the response, red first.
Check every other public route that returns a speaker or event with its relations for the same thing, and list what you find
(fix only #3345's route here; file any other as its own issue, Bug, `bug`, Priority Low written in the issue as chosen
overnight). Branch `fix/3345-presenter-hidden-sessions`. PR 3344 (#441) added guarded `speakers/sessions/season/...` routes in
the same controller; branch from `development` anyway and say in the PR that the two touch the same file. Overnight rules: no `package.json` or lock changes; no release or full tier; made-up data; never production. Rule 4: these were filed tonight from code, each side read; confirm on today's `development` before building and say so. Branch from the latest `development`, red first, the check (at `CHECK_PARALLEL=4` or lower for a large affected set, #3000), push, "branch ready" with the PR body.
Report `home/reports/2026-11-24-g94.md`.

## Batch a5 (aggiemap: a three-month-old TEMP pointing development at production, #2617; 23 November 2026, about 10:25 PM Central, from `work (aggiemap)`) (Low) - **after a4**

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2617>

Read the issue, and **check it is still true before you change anything** (DIRECTOR.md, overnight rule 4): find the TEMP,
read what it does now, and say in the report whether the condition it was waiting for has been met. If the services it
points at are published on development now, the TEMP goes; if they are not, the right change may be a comment with the
issue number and a date rather than a deletion. Either way the report says which, and why.

Branch `docs/2617-transportation-temp` or `fix/2617-transportation-temp` as the finding dictates. If it turns out to be a
one-line comment, say so and do not inflate it. **Roughly 30 minutes, and it may be ten.**

## Batch a4 (aggiemap: route changes send no page view, #3338; 23 November 2026, about 10:25 PM Central, from `work (aggiemap)`) (Low) - **do this first**

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3338>

The GIS Day director filed this for AggieMap tonight, split out of #2275. AggieMap loads gtag and uses angulartics2's gtag
provider, so its **events** arrive — the smoke suite proves that — but **no page view is sent on a route change**, because
the provider only reports page views to `settings.gst.trackingIds` and AggieMap configures none. So route changes reach GA4
only through the snippet's own `config` call and, if it happens to be switched on in the GA4 property, enhanced-measurement
history tracking.

**The issue leaves a decision open, and here is the one to build**, so you are not waiting on anyone (DIRECTOR.md: a batch
that needs a decision is written on the director's recommendation and the listener builds it):

> **Configure the provider with a tracking id per environment, and rely on nothing in the GA4 property's own settings.**

Why that and not GA4's history tracking: a tracking id in this repository is configuration we can read, test and change
with a pull request, and `analytics.spec.ts` already asserts the snippet loads with a real measurement id per environment,
so the same suite can assert the page view. Enhanced measurement is a setting in a Google property that nobody here can see
from the code, cannot test, and which silently changes behaviour when someone toggles it. **Not both** — that is how every
view gets counted twice, which is worse than counting none, because a doubled number looks plausible.

**Reuse GIS Day's setup rather than inventing one.** It is on `fix/2275-gisday-analytics-gtag` / PR 3339: angulartics2 14's
`Angulartics2GoogleGlobalSiteTag` with virtual page tracking off. Read it first and follow it. If AggieMap genuinely needs
something different, say what and why in the report rather than diverging quietly — two analytics setups in one repository
is exactly the shape the reuse rule exists to stop.

**The test is the point of this batch, not the configuration.** Add to `test/smoke/aggiemap/analytics.spec.ts`:

1. A route change sends **exactly one** page view, with the route's address. One, not zero and not two: a test that only
   asserts "at least one" would pass in the double-counting state this change is most likely to create.
2. It holds on every environment in `environments.json`, with its own measurement id.

Prove it red first against unmodified code — the "exactly one" assertion should fail at zero today — and say in the report
what the failure said. Then green.

**Do not touch `package.json` or `package-lock.json`.** angulartics2 14 is already installed; if you find it is not, stop
and report it, because the lock belongs to the security chat tonight (overnight rule 1).

**UES Operations is out of scope.** The issue notes it still reports to a retired Universal Analytics property; that is its
own question and not this batch.

Branch `fix/3338-aggiemap-page-views`, `.pr-body.md` from the template as the last commit. Nothing a visitor sees, so name
the `no-visible-change` label in it. **Roughly 60 minutes.**

## Batch g93 (gisday: #3327, formToFormData drops every false value; 23 November 2026, about 11:55 PM Central, from `work (gisday)`) (Medium) - **after g92**

[#3327](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3327), filed tonight from the #3062 scan. **Rule 4 first:** confirm on today's `development` that
`libs/gisday/platform/ngx/common/**/utils/form-to-form-data.ts` (find it) drops `false`, and find which admin forms send a
boolean through it (the sponsor form works around it with `_formData()`, #1962). Then:
1. **The bug only:** `formToFormData` sends `false` (as the API's existing parsing of that form field expects: check how the API
   reads each boolean it receives as form data, and that a `"false"` string becomes `false` there, not `true`). Red first: a form
   whose checkbox is turned off sends it. Remove the sponsor form's workaround if it is now redundant, with its own test kept
   passing.
2. **Not** the bigger `AdminEntityForm<T>` refactor the issue also describes: say in the report what it would take, and leave it
   for the maintainer. The PR says `Part of` nothing; it closes #3327 only if the refactor is split out, so instead file the
   refactor as its own issue (Task, `enhancement`, Low, assignee `danielgoldbergtamu`, and write in it that Priority was chosen
   overnight by the director), edit #3327's title to the bug alone if you can, and close-keyword #3327.
Branch `fix/3327-form-data-false-values`. Overnight rules: no `package.json` or lock changes; made-up data; no email; never
production. Check (the forms' library, `gisday-platform-ngx-core`, `gisday-angular`, and `gisday-platform-data-api` if the API
side changes), push, "branch ready" with the PR body. Report `home/reports/2026-11-24-g93.md`.

## Batch g92 (gisday: #3326, the profile email guards against a repeated send the way the other three speaker emails do; 23 November 2026, about 11:45 PM Central, from `work (gisday)`) (Medium) - **after g91**

[#3326](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3326). The judging, slides-request and session-details emails share near-identical send loops on `RepeatGuard.claim`
(your #3260); the profile email (`speaker-edit.service.ts` `sendLinks`) still guards by counting recent links, which two API
copies both pass at once. Make one `sendEach(...)` beside `RepeatGuard` that all four use, behind their existing interfaces, and
prove the race for the profile email red first (two racing sends, exactly one goes), as you did for #3098. If the profile email
needs a new claim `kind`, no migration is needed (`kind` is nvarchar); say so. Branch `fix/3326-profile-email-repeat-guard`. Overnight rules (DIRECTOR.md): don't touch `package.json` or `package-lock.json`; no release or full smoke tier. Made-up data only, no email, never production. Branch from the latest `development`, red first, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body in the report. **Rule 4:** both were filed tonight from a code scan, each side read; still confirm on today's `development` before building and say so.
Report `home/reports/2026-11-24-g92.md`.

## Batch g91 (gisday: #3332, one CSV writer beside downloadFile that escapes formulas; 23 November 2026, about 11:45 PM Central, from `work (gisday)`) (Medium) - **after g88**

[#3332](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3332). `Papa.unparse` is called in `class-edit`, `dashboard-people`, `speaker-badges`, `judging-results` (twice) and
`competitions/.../export.processor.ts`, and `impact-report.ts` writes its own CSV; none escapes formulas, so a typed name starting
`=`, `+`, `-` or `@` becomes a formula in Excel. Add `toCsv(columns, rows)` to `libs/common/utils/ui/src/lib/download.ts`
(beside `downloadFile`, exported), formula escaping on, and move every caller onto it, output otherwise unchanged (column order,
headers, line endings: test that one existing export's output is byte-identical apart from an escaped cell). Red first. No visible
change. Branch `fix/3332-csv-formula-escaping`. Overnight rules (DIRECTOR.md): don't touch `package.json` or `package-lock.json`; no release or full smoke tier. Made-up data only, no email, never production. Branch from the latest `development`, red first, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body in the report. **Rule 4:** both were filed tonight from a code scan, each side read; still confirm on today's `development` before building and say so.
Report `home/reports/2026-11-24-g91.md`.

## Batch s79 (security: #2122, remove the dependencies nothing uses, found with knip; 23 November 2026, about 9:10 PM Central, from `work (security)`) (Low) - **WITHDRAWN, moved to work (the security director itself, on the shortest queue)** (rule 3 of *Working unsupervised overnight*: home and laptop are each about eight deep). Do not run it.

[#2122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2122): every unused package is more surface for the
next advisory. knip is already configured with each project's entry points (PR 2389), and three removal rounds have merged
(2156, 2386, 2400). This is the next round, against today's `development`, which took this week's Dependabot updates.

- Branch `chore/2122-unused-dependencies` from the latest `development`. Run knip as configured (its `dependencies` and
  `unlisted` reports; files are out of scope tonight) and list what it calls unused in the root `package.json`.
- **Remove only what you can prove.** Read issue #2122's last comment first: `@eslint/js` looked unused and lint failed in 101
  projects without it. So for each candidate grep the repository *and* `node_modules` for a `require`/`import` of it, check
  `allowScripts`, and keep anything a tool loads by name (Nx plugins, ESLint configs, Jest and Vitest environments,
  Playwright, Angular builders). If in doubt, keep it and list it in the report as a question.
- `npm install --package-lock-only --ignore-scripts`, then the **full** check, `scripts/check-in-volume.sh <branch>`, with a
  clean `npm ci` (the lock changes, so the script does it), and read its own `Exit` line. If a removal fails it, put that one
  back, record why on #2122, and run again.
- Compare the lock with `development`'s: only removals, and no other package's version may move. `npm audit --package-lock-only`
  before and after, both in the report.
- The maintainer is asleep and asked for everything to reach a pull request without him. Push to the fork and say
  "branch ready: chore/2122-unused-dependencies", with the PR body (from the template) in your report
  `home/reports/2026-11-24-s79.md`, naming this as "security batch s79". Questions go under **Questions for the director**,
  with options and a recommendation; do not stop on them.

## Batch a3 (aggiemap: two reuse jobs, #2601 and #2602; 23 November 2026, about 9:15 PM Central, from `work (aggiemap)`) (Low) - **after a2**

Two issues, **two branches, two pull requests** (one change per pull request, CONTRIBUTING.md). Both are the maintainer's
standing reuse-before-building rule applied to things already written twice. Read each issue; it names the copies.

- **[#2601](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2601)** - share the red-hatch
  swatch, `toSvgDataUri` and the arrow line symbol. Branch `chore/2601-share-symbol-helpers`.
- **[#2602](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2602)** - one markdown popup
  helper, and one Construction popup and URL shared rather than repeated. Branch `chore/2602-share-popup-helpers`.

**Where a shared piece goes:** the shared library for its kind, exported from its index, not inside the feature that first
needed it (CLAUDE.md, "Reuse before building"). Change a shared piece behind its existing interface where you can, so its
callers do not have to change.

**Proof, and this is the part that matters:** `nx test` only compiles what the specs import, so it is not proof.
`bash scripts/check-in-volume.sh <branch> <each project you edited>,aggiemap-angular` is, and the run must exit 0. A
change that only moves code should leave every existing test passing without edits to them; if you find yourself editing a
test to match, say so in the report rather than doing it quietly - that is usually a behaviour change wearing a refactor's
clothes.

No screenshots: nothing a visitor sees. Name the `no-visible-change` label in each `.pr-body.md`.
**Roughly 60 to 90 minutes for both.**

## Batch a2 (aggiemap: two mechanical cleanups, #2605 and #2603; 23 November 2026, about 9:15 PM Central, from `work (aggiemap)`) (Low) - **after a1**

Two issues, **two branches, two pull requests**. Both are mechanical and no-visible-change, and both are the kind of thing
never worth a machine's time until a machine is free - which it is now.

- **[#2605](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2605)** - add an `$aggie-maroon`
  sass variable; `#500000` is typed 74 times. Branch `chore/2605-aggie-maroon`. The variable goes where the other shared
  sass lives (`libs/sass/`), not in an app. **Replace every occurrence**, and say in the report how many you changed and
  whether the count matched 74 - if not, say what the others were (a different maroon, a comment, a test fixture). The
  rendered colour must not change anywhere, so the diff should be the variable and its uses and nothing else.
- **[#2603](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2603)** - every AggieMap smoke spec
  re-declares the map probe name and the wait for it; share them. Branch `test/2603-share-map-probe`. The shared modules in
  `test/smoke/aggiemap/` are where it goes. Prove it with `npx tsc -p test/smoke/aggiemap` (the typecheck CI runs;
  Playwright strips types, so nothing else would catch a mistake), and run **one** spec against dev to show the helper
  works: `test/smoke/aggiemap/run-local.sh development one campus-layers.spec.ts`.

**Do not run a release or full smoke tier tonight** - the work machine is running one against dev and two at once is what
makes the paint check time out (#1716).

**Roughly 60 minutes for both.**

## Batch a1 (aggiemap: check every map's outbound links, #3285; 23 November 2026, about 9:15 PM Central, from `work (aggiemap)`) (High) - **do this first; moved here from laptop batch 10, which is eight batches deep**

<https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3285>

**Read the whole issue before writing anything.** It holds the state of all 34 outbound links as of 5:40 PM today and,
more important, the five rules this check has to follow - each of which comes from a wrong answer a naive version gave me
this afternoon. The short version: a plain status-code check called **three of twelve working links broken**
(`itaccessibility.tamu.edu`, `em.tamu.edu/emergency-procedures`, `codemaroon.tamu.edu`). Two TAMU sites 404 an
extensionless path for a non-browser client and serve it to a browser; Code Maroon refuses an unfamiliar user agent. A
check that cries wolf three times in twelve is worse than no check, because within a fortnight nobody reads it and the one
real failure goes out with the noise.

So, from the issue, and none of these is optional:

1. **Navigate as a browser does** - the suite is already Playwright, so use a page, not a bare HTTP client.
2. **A redirect is a pass**, and the final URL is reported, so a move like `transport.tamu.edu/busroutes/` to
   `aggiespirit.ts.tamu.edu/RouteMap` is visible without being red.
3. **Judge the page, not only the status.** A 200 serving a "Page Not Found" body is a failure. A 403 or a timeout is
   **inconclusive, not a failure**: reported separately, never red.
4. **Two strikes.** A link fails the run only if it fails twice, spaced out. These are other people's websites and one
   blip must not open a health issue.
5. **An allowed-failures list** in `test/smoke/aggiemap/environments.json`, like `allowedServiceFailures`, so a link known
   to be dead and waiting on another team stays visible without turning the suite red.

**Where the links come from:** collect them from the definitions rather than listing them by hand, so a new map's link is
covered the day it is added. `scheduleUrl` on an `EventConfiguration` is the one that caused this; the issue names the rest
and where they live.

**Prove it finds the real one.** #3278's dead link is fixed on `development` now, so to show the check works, point it at
`https://aggie.tamu.edu/graduation` in a test of its own (a fixture, not by re-breaking a definition) and show it red on
that and green on the live links. A check nobody has seen fail is not known to work.

**Add its row to `docs/testing.md`** - a CI check fails when a smoke spec is missing from that page. **Leave every count on
that page alone, the Total included**: those counts are a measurement refreshed at each release from a watched run, and
three pull requests once conflicted on that one line (#2002).

Branch `test/3285-outbound-links`, `.pr-body.md` from `.github/pull_request_template.md` as the last commit, with the
`no-visible-change` label named in it. **Roughly 90 minutes.** If the design fights you, put what you tried under
**Questions for the director (aggiemap)** with a recommendation and move to batch a2 - do not wait for an answer.

## Batch g90 (gisday: #3062, scan GIS Day for one-offs that break reuse-before-building; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Low) - **WITHDRAWN, moved to work (the GIS Day director does it itself), 10:55 PM Central: rule 3 of DIRECTOR.md's overnight section, home is nine deep**

[#3062](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3062), read only, **GIS Day's libraries and apps only** (`libs/gisday/**`, `apps/gisday-*`). Look for the tell CLAUDE.md
names: two pieces of code that would both need changing to fix one bug. A table of what you find (the pieces, where, how alike,
what one shared piece would be), each with a recommendation; file each real one as its own issue (Task, `enhancement`,
assignee `danielgoldbergtamu`; the director sets Priority and the project) and list them. Build nothing in this batch.
Report `home/reports/2026-11-24-g90.md`.

## Batch g89 (gisday: triage the 2022-era GIS Day backlog, #434 to #499; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Low) - **WITHDRAWN, moved to work (the GIS Day director does it itself), 10:55 PM Central: rule 3 of DIRECTOR.md's overnight section, home is nine deep**

Fourteen GIS Day issues from 2022 sit open with no status: [#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434), [#435](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/435), [#438](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/438), [#439](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/439), [#440](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/440), [#441](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/441), [#442](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/442), [#464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/464), [#466](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/466), [#477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/477), [#493](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/493), [#497](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/497), [#498](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/498), [#499](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/499).
Much has changed since. For each, read it, check today's code (and, for a public page, production with a browser, read only),
and put it in one of three rows of a table in your report:
- **Done already:** what does it now, with the file or PR. The director closes it.
- **Small and still wanted:** build it, one branch per issue, as above. Keep each to what the issue asks.
- **Needs the maintainer** (a product choice, or too big for a night): say what the choice is, with options and a
  recommendation. Don't build it.
#497 is AggieMap's (Kuma monitoring) and filed in the wrong project: say so, and leave it. The maintainer is asleep and asked for everything to reach a pull request without him. So: decide what you can from the code and the records, choose the conservative option when a choice is needed, and put any real decision in your report as a question with options and a recommendation, then carry on with the rest. Made-up data only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only. Each branch from the latest `development`, red first where a test can show it, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body text in the report.
Report `home/reports/2026-11-24-g89.md`.

## Batch g88 (gisday: #2275, GIS Day's analytics provider sends nothing; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Medium) - **after g87**

**Decided on your report g87 (the director, overnight, about 12:05 AM Central):** 1A, #2232 and #1609 closed as done by PR 2446, with your evidence. 2A, #1410 closed as not planned. 3A, the "Also open" lines in `unreleased.md` are left alone.

[#2275](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2275): GIS Day loads gtag (GA4), but angulartics2's provider is analytics.js and calls `ga()`, which the page doesn't have, so
it sends nothing; only gtag's own page view arrives (you found the same in batch 85). **GIS Day only**: AggieMap's half of the issue
is the AggieMap chat's; leave it, and say so in the PR. Make GIS Day's events reach GA4 through gtag (angulartics2's GA4 provider
if this version has one, otherwise a small provider on the shared analytics setup in `libs/common/**`, reused rather than written
inside gisday-angular), without sending a second page view on top of gtag's own, and keep #2572's rule: the check-in code never
reaches Analytics. A test that an event reaches `gtag`, red first. No visible change. The maintainer is asleep and asked for everything to reach a pull request without him. So: decide what you can from the code and the records, choose the conservative option when a choice is needed, and put any real decision in your report as a question with options and a recommendation, then carry on with the rest. Made-up data only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only. Each branch from the latest `development`, red first where a test can show it, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body text in the report.
Report `home/reports/2026-11-24-g88.md`.

**Overnight rule 1 (DIRECTOR.md, added 10:55 PM Central): do not touch `package.json` or `package-lock.json`.** If a dependency is used only by what this batch removes or replaces, leave it in place and list it in the report; the security chat removes it later.

## Batch g87 (gisday: #2232 and #1609, retire gisday-competitions-nest and gisday-competitions-angular; 23 November 2026, about 10:15 PM Central, from `work (gisday)`) (Medium) - **after g86**

[#2232](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2232) and [#1609](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1609) are the same job; #2232 has the evidence that nothing deploys or serves either app. Branch
`chore/2232-retire-gisday-competitions-apps`:
1. **Check the evidence again first:** no image on ghcr, no deployment, no workflow or Azure pipeline that builds them, nothing
   in `gisday-angular` or `gisday-nest` importing from either app. If any of that is false, stop and report it.
2. **Delete** both apps and every reference to them (workspace config, CI lists, the smoke and e2e projects, docs that list them,
   `.github/dependabot.yml`), keeping the competitions **libraries**, which `gisday-angular` and `gisday-nest` use. Anything only
   those two apps used goes too (libraries, not npm dependencies: see the rule below), listing each and why.
3. **The full affected check**, then push. The PR closes #2232; say in its body that #1609 is the same work, and close-keyword
   only #2232 (the director closes #1609 after the merge).
The maintainer is asleep and asked for everything to reach a pull request without him. So: decide what you can from the code and the records, choose the conservative option when a choice is needed, and put any real decision in your report as a question with options and a recommendation, then carry on with the rest. Made-up data only, no email, never production, txgisday-dev the only Auth0 tenant, kubernetes-config read-only. Each branch from the latest `development`, red first where a test can show it, the check, a push to the fork, `app: gisday` in any release entry, and "branch ready: <name>" with the PR body text in the report.
Report `home/reports/2026-11-24-g87.md`.

**Overnight rule 1 (DIRECTOR.md, added 10:55 PM Central): do not touch `package.json` or `package-lock.json`.** If a dependency is used only by what this batch removes or replaces, leave it in place and list it in the report; the security chat removes it later.

## Batch 86 (gisday: the rest of #3019, each competition's sessions and finalists date on the season; 23 November 2026, about 9:45 PM Central, from `work (gisday)`) (Low) - **after 85**

**Decided on your report 81 (the maintainer, about 9:40 PM Central):** 6A and 7A. Your date half is PR 3310, now closing
its own issue #3309, so [#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019) is what this closes.

Branch `feat/3019-competition-sessions-chosen` from the latest `development` (after PR 3310 merges, if it has; otherwise
from `feat/3019-competition-sessions-on-season`, and say so).
1. **Sessions (6A):** columns on `season_competitions` (#2948's table) for each competition's session and awards session
   (and, for Presentation, its two levels' sessions), chosen in Admin, Seasons from that season's sessions. The pages
   and the acceptance emails (#2985) use the chosen session, falling back to the `COMPETITION:`/`AWARDS:` naming when
   none is chosen, so nothing changes for 2026.
2. **Finalists date (7A):** `finalistsNotifiedAt` per competition on the same table, shown on its page in Central time
   when set; the line is dropped when it isn't.
3. One migration for both, proven up, down and up in your throwaway SQL Server, with its exact `up()` and `down()` SQL in the
   report for the production script. Red first; images of Admin, Seasons only if you can take them without a password
   (otherwise the laptop will), and of the public pages; full check; push; "branch ready" with the PR body in
   `home/reports/2026-11-23-86-gisday.md`. Add `app: gisday` to its release entry.

## Batch 85 (gisday: PR 3304's E2E failure, #2088; 23 November 2026, about 9:20 PM Central, from `work (gisday)`) (High) - **before 84**

CI's GIS Day E2E (`Playwright`, run 45301383192) failed on PR 3304 (`fix/2088-api-on-own-address`, `f147bfca2`): both
tests in `test/e2e/gisday/presenter-cards.spec.ts` found **0** `tamu-gisc-speaker-card .profile` instead of 4; the other
45 passed. They route `**/seasons/active` and `**/speakers/participating`, which should match any host, so find out why
the cards no longer appear with the API at `${window.location.origin}/api` (the dev server's proxy, the e2e web server's
base URL, a request the routes don't see, or something else). I've rerun it once in case it is a flake; check the
rerun's result first (`gh run view 45301383192 --repo TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo`).

Reproduce it locally the way `.github/workflows/` runs the GIS Day E2E, fix the cause (not the test, unless the test is
what is wrong, and then say why), run the whole GIS Day E2E suite plus the check, push fast-forward, and report
`home/reports/2026-11-23-85-gisday.md` with the sha and the cause.

## Batch 84 (gisday: `app: gisday` on the open GIS Day branches; 23 November 2026, about 9:05 PM Central, from `work (gisday)`) (Low) - **now**

**Decided on your report 83:** 1A. Your #2835 PR is 3311 and #1843's is 3312. The CLAUDE.md text is in 3311 as its own
commit, for the maintainer to review. Question 2 (UCGIS's Redis) goes to the maintainer.

Add the one line `app: gisday` to the release entry's front matter on each of these branches, as a fast-forward push to
the fork, and run `node scripts/collate-release-notes.mjs --check` on each (it passes today without the line; it must
still pass with it):
- `fix/2572-checkin-address` (PR 3298)
- `fix/1836-past-sessions-filter` (PR 3303)
- `feat/3019-competition-sessions-on-season` (PR 3310)
- `feat/3292-winners-author-first` (PR 3306)

**Not** `feat/2893-check-ins-dashboard-rest` or `feat/3244-vgi-submission-counts`: the laptop is pushing images to both
now and adds the line itself. If any of the four has merged by the time you get to it, skip it and say so; the director
adds it when PR 3311 is brought up to date. A short report, `home/reports/2026-11-23-84-gisday.md`, with each new sha.

## Batch 83 (gisday: #2835, GIS Day entries out of AggieMap's release notes, then #1843, the checklist for another organization's site; 23 November 2026, about 8:40 PM Central, from `work (gisday)`) (Medium) - **now**

1. **[#2835](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2835).** `collate-release-notes.mjs` writes every entry into AggieMap's `unreleased.md`, so the 10 November
   notes carried 23 GIS Day entries. The lab pushed `fix/2835-collate-routes-by-app` to the fork at `5cbd566c6` on
   11 November, and no PR was ever opened. Read its diff and the lab's report for it (`work-lab-leila/reports/`, search
   for 2835). Bring it up to date: merge the latest `development` into it (a lot of GIS Day entries have landed since;
   check each lands in `gisday-unreleased.md` and each AggieMap one in `unreleased.md`, with `--check` and a dry
   `--write` in a scratch copy, never committed), fix what has rotted, run `bash` on any script test it has, check
   (the script's own tests, plus `collate-release-notes.mjs --check`), push, "branch ready" with the PR body.
2. **[#1843](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1843).** Write `docs/gisday-sites.md`, the checklist for adding another organization's GIS Day site,
   from what was actually done for UCGIS (#1837 and its deployment comment, `libs/gisday/common/src/lib/sites.ts`,
   `docs/gisday-local.md`, `docs/gisday-migrations.md`, the GIS Day sections of `docs/releases/README.md`, and #2088,
   PR 3304, which removes the need to add each address to `ORIGINS`). Where a step is in kubernetes-config, name the
   folder and file but don't copy anything from it that is a secret or an internal address; this repository is public.
   Mark any step you can't confirm from a record as "unconfirmed" rather than guessing. Link it from CLAUDE.md's
   "Where things are written down" table only if the table's rule allows a new row (it says ten places, each with one
   job); otherwise from `docs/gisday-local.md`, and say which. Branch `docs/1843-gisday-sites`, push, "branch ready".

Report `home/reports/2026-11-23-83-gisday.md`.

## Batch 82 (gisday: #3244's counts table scrolls in its own box on a phone, by sharing the dashboards' scroll box; 23 November 2026, about 8:15 PM Central, from `work (gisday)`) (Medium) - **after 81**

[#3244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3244), on `feat/3244-vgi-submission-counts` (the fork, at `f458eb400`; fast-forward only, don't merge
`development` into it). Read `laptop/reports/2026-11-23-4.md` first. My `floating-table` fix didn't work: every
heading is one word, so the table can't get narrower than 377 px, and the page's column on a 390 px phone is about
330 px.

The laptop's recommendation, which I've taken: **the table scrolls sideways in its own box**, using the box the admin
dashboards already have, `DashboardScrollComponent` (`tamu-gisc-dashboard-scroll`, in
`libs/gisday/platform/ngx/core/.../admin/pages/dashboards/shared/dashboard-scroll/`). It isn't exported, and the
competitions library can't reach it there. So:

1. **Move it** to a library both can import (check `libs/ui-kits/ngx/layout` first, then GIS Day's
   `libs/gisday/platform/ngx/common`; it imports `libs/gisday/sass/variables`, so take the shared variable it needs or
   choose GIS Day's common library, and say which and why). Export it from that library's index, change the two
   dashboard callers to import it from there, and keep its spec passing **unchanged in what it checks**: this is a move
   behind the same interface (CLAUDE.md, "Change a shared piece behind its existing interface").
2. **Use it** around the counts table in `admin-submissions.component.html`, and drop `floating-table` from it again if
   the box makes it unnecessary (say which looks right).
3. **A test, red first:** at a 360 px host the page doesn't scroll sideways and the table's box does (or the nearest
   the existing scroll-box specs get to that).
4. Check (`affected`, since a shared piece moves), push to the fork, and report `home/reports/2026-11-23-82-gisday.md`
   with the sha. The images are the laptop's afterwards (it signs in); don't take them.

## Batch 81 (gisday: #3019, the competition pages stop carrying this year's dates and session names; 23 November 2026, about 7:50 PM Central, from `work (gisday)`) (Low) - **after 80**

[#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019). Read the issue in full. The presentation and poster pages type 2026's dates into their text, and find
their sessions by a naming convention (`COMPETITION:`, `AWARDS:`) an admin can't see. Branch
`feat/3019-competition-sessions-on-season` from the latest `development`.

1. **Propose first, in the report, before building:** which dates come from the season's existing settings (#2934), and
   how the season names each competition's sessions (a choice in Admin, with the naming convention as the fallback so
   nothing breaks this year). Then build the smaller half that needs no new decision: every date on those pages read from
   the season's settings, red first, with before/after images of both pages at 1280 and 390 (public pages, made-up data).
2. **The session choice** waits for the maintainer: put it in the report as a question with options and your recommendation.

Check, push, "branch ready" with the PR body text in `home/reports/2026-11-23-81.md`.

## Batch 80 (gisday: #2893 against what #3006 shipped, then #2430; 23 November 2026, about 7:50 PM Central, from `work (gisday)`) (Medium) - **now**

**Decided on your report 79:** both questions go to the maintainer; the director writes the answers here. PR 3304 is open.

1. **[#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893), read only first.** It specifies a Check-ins dashboard (decided 13 November, 5A: check-ins by hour across
   GIS Day week; a row per event with RSVPs, check-ins, show-up rate, walk-ins, check-ins by person type and a total; a row
   opens to the people, marking check-ins outside the session's time, with a CSV export). [#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006), your own
   batch 50, shipped a Check-ins dashboard and is closed. Compare what is on `development` with #2893's list, item by
   item, in a table. If everything is there, recommend closing #2893 as done by #3006. If items are missing, recommend
   building them, and build them on `feat/2893-check-ins-dashboard-rest`, red first, with images of the admin page taken
   on your local build only if you can sign in without a password (if you can't, say so; the director will have them
   taken).
2. **[#2430](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2430):** move the automatic review's limits (accuracy 15 m, 10 submissions in 120 s, the two campus
   rectangles, in `automatic-review.ts`) into the season's form JSON, beside `sameThingMetres` and `nameAttribute`, with
   today's values as the defaults so a form without them behaves exactly as now. Red first (a season with a stricter
   limit refuses what today's accepts). Show the setting in the Designer only if the Designer already shows
   `sameThingMetres`; otherwise the form file is enough, and say so. Branch `feat/2430-review-limits-per-season`;
   check; push; "branch ready" with the PR body text.

Report `home/reports/2026-11-23-80-gisday.md` (a `-gisday` suffix, because the security chat also numbers its batches
here).

## Batch 79 (gisday: #2088, each GIS Day address calls the API on its own address; 23 November 2026, about 7:15 PM Central, from `work (gisday)`) (Medium) - **after 78**

[#2088](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2088). Read the issue: the site's API address is absolute (`https://txgisday.org/api`), so every other
address makes cross-origin calls that work only if it is in gisday-nest's `ORIGINS` (#2087). Branch
`fix/2088-api-on-own-address` from the latest `development`.

1. **Check first, and report before changing it:** how `ANGULAR_API_URL` reaches the site (build time or run time, and
   where; the kubernetes-config side is the director's, so read it only if you have a clone, and never push to it); the
   Auth0 HTTP interceptor's `allowedList` (a token must still be attached on every address, or signed-in calls lose it);
   every place the site builds an absolute API or upload URL.
2. **The change:** the site derives its API address from the address it is opened on (or uses `/api`), with the
   interceptor's list matching. Tests, red first: a signed-in call on a second address carries the token; a call goes to
   the same origin it was opened on.
3. **Prove it locally** with `scripts/gisday-local.sh` on two addresses (`gisday.local.test` and one more in your hosts
   file), signed in on txgisday-dev: an admin page loads its data on both, and the browser shows no cross-origin call.
4. Check, push to the fork, "branch ready" with the PR body text in `home/reports/2026-11-23-79.md`. Say exactly what the
   deploy needs in kubernetes-config (an environment value changed or removed, `ORIGINS` left as it is until the new
   site is live everywhere) so the director can write it.

## Batch 78 (gisday: #1836's before and after images; 23 November 2026, about 7:15 PM Central, from `work (gisday)`) (Medium) - **now**

Your #1836 branch, `fix/1836-past-sessions-filter` (`98a4dff11`), needs its images; the lab is paused. The page is
public, so no sign-in is needed. On a local build with the made-up data your report describes (a past season with an
organization that hosts one of its sessions): `/seasons/<year>/sessions` at 1280 px, its Organizations filter open,
**before** the migration ("There are no organizations.") and **after** it (the organization listed), and the after at
390 px. Save them in `docs/screenshots/1836-past-sessions-filter/`, link them in its release note's Before | After
table and in the PR body text, run `node scripts/collate-release-notes.mjs --check` in Docker, push to the fork
fast-forward only, and report `home/reports/2026-11-23-78.md` with "images pushed (1836): <sha>" on its first line and
the updated PR body.

**Decided on your report 77 (the maintainer, about 7:20 PM Central):** 1A, #2627 closed as a duplicate of #2628. 2A, the follow-up to drop `sessions_filter_backfill` is #3300 (Task, Low, Todo); nothing for you to do on it now.

## Batch 77 (gisday: three GIS Day bugs, #2627, #2572 and #1836; 23 November 2026, about 6:55 PM Central, from `work (gisday)`) (Medium) - **after the batch you are running now (61, #1840)**

The lab is paused (see `DIRECTOR.md`), so GIS Day's code work comes to you and the laptop. Three bugs, each its own
branch from the latest `development`, in this order. For each: read the issue, a test proven red against the unfixed
code, the fix, `scripts/check-in-volume.sh <branch> <projects it edits>,<the app>` (read its `Exit` line; a
`npm audit signatures` FETCH_ERROR from the registry is a known flake this afternoon, so say so if it is the only
failure), push to the fork, and say "branch ready: <name>" per branch in the report, with the PR body text. Drop any
`.pr-body.md` commit. Made-up data only, no email, never production, leave kubernetes-config alone.

1. **[#2627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2627): Monuments and memorial markers reach ArcGIS Online without their name.** The fix is in the
   issue: `toFeature` in `vgi-arcgis-publisher.service.ts` publishes the form's name answer for every type, finding the
   question from the `nameAttribute` any option declares. Scoring, automatic review and the Designer are unchanged; a
   test that a monument's name is in the feature, red first. No visible change on the site, so the PR takes
   `no-visible-change`; say in the report what would show it on the ArcGIS layer.
2. **[#2572](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2572): the session check-in code stays in the page address.** The fix is in the issue: read
   `?checkin=` once, keep it for the check-in, then remove it with `replaceUrl: true` **before** the page view is sent
   (check the order against how angulartics2 fires). A test that the code still checks the user in and the address no
   longer carries it, red first. No visible change beyond the address bar; say in the report whether a before/after of
   the address is worth capturing.
3. **[#1836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1836): past years' Sessions pages have an empty Organizations filter.** It was deferred until after
   GIS Day, which is now over. The fix is in the issue: a migration that ticks **Sessions Filter** on each past season's
   organizations that hosted at least one of its events, leaving the current season alone; `down()` removes only what it
   added (so it must record what it ticked). Prove up, down and up in your throwaway SQL Server, with made-up seasons.
   Give the migration's name and its exact `up()` and `down()` SQL in the report, because the director writes the
   production script from it. This one is visible (a past season's filter lists organizations again); say what made-up
   data shows it, and the director will have the images taken.

If one of them turns out not to be what its issue says (the CLAUDE.md "ask the service" rule applies to #2627: check a
2026 form's `nameAttribute` in the code and the seed before changing anything), stop on that one, say why, and go on to
the next.

## Batch 77 (security: Dependabot PR 3295, the everything-else group, #3254; 23 November 2026, about 7:00 PM Central, from `work (security)`) (Low) - **do this now**

Check PR 3295 as CLAUDE.md says for a Dependabot pull request. **Do not push to its branch, comment on it or merge it.**

- Branch: `dependabot/npm_and_yarn/development/everything-else-62bdc10cd6` on `origin`. `git fetch origin` first; if it is
  not on current `origin/development`, make a local branch of `origin/development` with it merged and check that instead,
  and say so.
- `scripts/check-in-volume.sh <branch>` (affected, defaults). Read the log's own `Exit N`. `npm audit signatures` may fail
  on npm's registry fault (its attestation endpoint has answered plain `OK` for `oxc-parser@0.156.0` since about 5 PM
  Central): if it does, quote the error line and report every other step on its own.
- Lock diff against `origin/development`: only the 18 named packages and their own dependencies may move, nothing may go
  back a version, no new `hasInstallScript`. `@amcharts/amcharts5` must not appear (#3288 ignores it).
- Every new version at least 7 days old (publish dates from the registry).
- Report `home/reports/2026-11-23-77.md` with the results, and post the same results as a comment on #3254 (not on the PR).

## Batch 78 (security: Dependabot PR 3296, jsdom 30.1.3 to 31.0.1, a major, #3297; 23 November 2026, from `work (security)`) (Medium) - **after 77**

A major: the maintainer decides, from your findings. **Do not push to its branch, comment on it or merge it.**

- Branch `dependabot/npm_and_yarn/development/jsdom-31.0.1` on `origin`; the same base rule as 77.
- Read jsdom's 31.0.0 release notes (its GitHub releases or `Changelog.md`): list every breaking change, the Node versions
  it supports (we run Node 24.22.3), and anything about canvas, `ResizeObserver`, `matchMedia` or navigation.
- Find where this repository uses jsdom: the `jsdom` dependents in the lock (`jest-environment-jsdom`, Vitest
  `environment: 'jsdom'` in project configs, anything else), and which of them actually resolve to the new 31.0.1 rather
  than a nested copy of their own.
- `scripts/check-in-volume.sh <branch> all` (every project, since the test environment is shared), Exit line read; the
  same registry note as 77.
- Report `home/reports/2026-11-23-78.md`: the breaking changes against our usage, the check result, and a recommendation
  (merge, hold, or what change it needs) with options under **Questions for the director**. Post a short summary on #3297.

## Batch 76 (gisday: #3260, keep `session_details_sends` until a later release; 23 November 2026, from `work (gisday)`) (Low) - **do this now**

Batch 75 is good; one change before its PR. `AddSpeakerEmailClaims1795459774518` drops `session_details_sends`, so
production's API (`sha-0ed1449`) breaks the moment the migration runs, and **rolling the API back to `sha-0ed1449` after
the deploy would break it again** unless someone runs `down()` on production too. Expand, then contract:

- `up()`: create `speaker_email_claims` and its two FKs and copy the `session_details_sends` rows in, as now, but **do not
  drop `session_details_sends`**. `down()`: drop `speaker_email_claims` only (its FKs first). The entity
  `SessionDetailsSend` can go from the code; the table simply stays, unused by the new API.
- File a follow-up issue (Task, `gisday`/`database` labels as fit, no priority): drop `session_details_sends` in a later
  migration, once the release carrying #3260 has been on production a while and no rollback to `sha-0ed1449` is wanted.
- Prove up, down, up again; nothing left to generate; bug-fix check on the projects you edit; push; "branch ready" with
  the new `up()`/`down()` SQL in the report and the PR body's migration paragraph corrected.

## Batch 75 (gisday: #3260, one shared table for every email's repeat guard; 23 November 2026, from `work (gisday)`) (Low) - **do this now**

[#3260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3260), the follow-up you found in report 73.
#3098 is merged (PR 3261) and **on production since about 12:35 PM Central today**, with `session_details_sends` created by
`migrate-prod-3098.ps1` on both databases. So that table and its migration are now history: **do not edit
`AddSessionDetailsSends1795448491167`**. Branch from the latest `development`. A new migration, dated after it, creates one
table for every email's repeat guard, keyed by the email's kind, session and recipient, copies any `session_details_sends`
rows into it, and drops `session_details_sends` (its `down()` restores it). The **Ask to judge** and **Ask for slides**
emails stop using in-memory `RecentSends` and use the same helper as the session details email, with the same race
handling you proved for #3098 (two racing sends: exactly one goes). Red first against the unfixed code where a test can
show it; prove the migration up, down and up again in your throwaway SQL Server; full check; push; "branch ready", with
the new migration's name and its exact `up()` and `down()` statements so the director can write its production script.
**Leave kubernetes-config alone.** Drop any `.pr-body.md` commit; put its text in the report.

## Batch 74 (gisday: #3208, presenter cards on a 360 px phone; 23 November 2026, from `work (gisday)`) (Medium) - **do this now**, before 73

[#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208), taken over from the director.
Branch `fix/3208-presenter-card-width` on the fork (67b17fb5f) has a **WIP smoke test** in `test/smoke/gisday/smoke.spec.ts`
that never got red for the right reason: on production the Sessions and Presenters pages open their entries by script,
with no links, and waiting for `events/by-day` timed out. Make the regression test work, red on the unfixed code for
the stated reason (the page wider than 360 px). Prove it against your local stack, which you can seed with a session
that has presenters, or as a component test if a layout check can be made there. Then the fix:
`libs/gisday/platform/ngx/common/src/lib/modules/people/components/presenter-card/presenter-card.component.scss`, the
card fills the width it is given up to 25rem (for example `:host { display: block; width: 25rem; max-width: 100%;
min-width: 0 }` and `.presenter-item { width: 100%; box-sizing: border-box }`). Also check the event edit form, which uses
the same card. The lab has your before images (batch 194). Bug-fix check; a release note; push; "branch ready".

## Batch 73 (gisday: bring #3098 up to date, its migration after #3239's; 23 November 2026, from `work (gisday)`) (Medium) - **after 72; start only once #3239's PR has merged** (`git log origin/development` shows it)

Your `fix/3098-shared-repeat-guard` (68776b3fe, 15 November) never got its PR. Since then `AddJudging`, `AddCheckInMinutes`
and, with #3239, `AddSeasonWinners` have merged, and its migration `1794790500971-AddSessionDetailsSends` is dated before
all of them. Merge the latest `development` into the branch, delete that migration and **generate it again** so it is
dated after `AddSeasonWinners1795444106838`, prove it run, revert, run in your throwaway SQL Server, run the full check,
and push. Drop the `.pr-body.md` commit (put its text in your report instead). Report "branch ready" with the new
migration's name and its exact `up()` statements: the director writes `migrate-prod-3098.ps1` on the work machine (the
maintainer's 2A: kubernetes-config work is the work machine's), so **leave your kc-3098 branch alone**.

## Batch 71 (gisday: #3243, the trail challenge's winners on the Winners page; 23 November 2026, from `work (gisday)`) (**High**) - **do this now**

[#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243). Build it on top of your
`feat/3239-homepage-winners` (PR not open yet; the lab's images are pushed at 9247d5e5f): branch
`feat/3243-trail-winners` from that branch's head, so it is one small PR after #3239's. The maintainer says the 2026
trail winners were already announced: three people submitted and took 1st to 3rd by points. So the picker offers the
season's VGI submitters **in the leaderboard's order** (`scoreSubmissions`, as the VGI dashboard and leaderboard use),
each with their name and points from Auth0 (through the dashboards' shared profile lookup), and saves by account. The
homepage shows place and name. Admin only to write; the public read returns place and name only. Tests red first; the
full check; a release note; made-up people only. Push and report "branch ready". The lab takes the images.

## Batch 72 (gisday: #3244, counts on the VGI Submissions page; 23 November 2026, from `work (gisday)`) (Medium) - **after 71**

[#3244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3244); the decisions are in the issue.
`libs/gisday/competitions/ngx/core/src/lib/pages/admin/pages/submissions/` (it already loads every submission, `all$`,
each with `questionValue` and `validationStatus`). Reuse the dashboards' shared table
(`libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/dashboards/shared/dashboard-table/`) if it can live where this
page can import it; if not, say why and use plain table markup with the site's styles. Branch
`feat/3244-vgi-submission-counts` from `development`. Tests red first; the check for the projects you edit plus
`gisday-angular`; a release note. Push and report "branch ready".

## Batch 70 (gisday: #3239's production migration script; 23 November 2026, from `work (gisday)`) (Medium) - **do this now**

Your report 69's question 1, decided by the director: yes. Write `6. GIS Day/migrations/migrate-prod-3239.ps1` in
kubernetes-config, modelled on the latest `migrate-prod-*.ps1` there (dry run by default, `-Apply`, the backup step, both
namespaces, a report file), for `1795444106838-AddSeasonWinners`. Put it on a kubernetes-config branch
`feat/3239-season-winners-migration` and commit it. **Don't push it, and don't run it against production:** the
maintainer pushes it and runs it. Run its dry run against your throwaway SQL Server if the script allows a connection
string. Report "script ready" with the commit. Question 2 (the trail picker) is now #3243.

## Batch 69 (gisday: #3239, a Winners section on the homepage; 23 November 2026, from `work (gisday)`) (Medium) - **do this now**

[#3239](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3239). The maintainer's decisions
are in its comment: an admin page picks 1st, 2nd and 3rd per competition from the season's submissions, stored in the
database; the homepage shows them on gisday.tamu.edu only, plain text (place, name, title), from the day after the
season's last day until the next season is active; room for the trail challenge (VGI) winners.

- **Look first:** the judged competitions are `JUDGED_COMPETITIONS` in `libs/gisday/common` (graduate and
  undergraduate presentation and poster); submissions are `submissions` (`submissionType`, `classificationType`,
  `participants`); the admin pages are under `libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/research-competition/`;
  the homepage is `pages/landing`. Which site shows what is `siteHas`/`siteListsSession` in `libs/gisday/common`.
- **A new table** (`season_winners` or similar: season, competition, place, submission; unique per season,
  competition and place), with its migration as `docs/gisday-migrations.md` says, proven up and down locally. The
  winner's name is the submission's first participant (or all, for a group), and its title, read when shown, so
  nothing is copied. Trail winners need a person, not a submission: leave the model able to hold them, and the page
  a place for them, but don't build their picker unless it falls out naturally; say which you did.
- **Admin only** to write (an existing competitions permission; extend `private-fields.interceptor.spec.ts`), public
  to read, the read returning only place, competition, names and title.
- Tests red first; **the full check** (an API route and a migration); a release note. **Made-up winners only** in
  tests, seeds and images: the 2026 winners' real names never go into the repository.
- Push `feat/3239-homepage-winners` to the fork and report "branch ready". The lab takes the images.

About three hours.

## Batch 68 (gisday: #3189 and #3219, two small fixes; 23 November 2026, from `work (gisday)`) (Low) - **do this now**

Two issues, **two branches, two reports in one file**. Each red first, then green; the bug-fix check
(`scripts/check-in-volume.sh <branch> <projects it edits>,gisday-angular`); a release note each. Push to the fork and
report "branch ready". Questions go to the director in your report, never to the maintainer.

1. **[#3189](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3189)**, branch
   `fix/3189-email-preview-reason`: when the shared review-email window's preview fails with a 4xx, it shows the API's
   own message (`serverMessage`, as the other admin pages do); a 5xx or a network error keeps the generic line. It is
   one window for every email (profile, session details, Ask for slides, Ask to judge, competition emails), so fix it
   once there. Specs: a 400 with a message shows it; a 500 shows the generic line.
2. **[#3219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3219)**, branch
   `fix/3219-checked-in-heading`: the Check-ins dashboard's "Checked in" heading breaks mid-word at 1280 px. Fix it in
   the shared `tamu-gisc-dashboard-table` if the cause is there (every dashboard uses it), not in one dashboard. A
   check that no heading breaks inside a word, if the shared table can have one.

Both are visible changes: the lab takes the before and after images (its batch 193), and the director opens the PRs
once they are pushed. About an hour.


## Batch 50 (gisday: #3006, an admin dashboard for event check-ins, modelled on the RSVPs dashboard; 15 November 2026, from `work (gisday)`) (Medium) - **do this now**

[#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006). The issue has what is wanted.
Model it on `libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/dashboards/rsvp-dashboard/` and its API side,
`libs/gisday/platform/data-api/src/lib/user-rsvp/rsvp-dashboard.provider.ts` and `dto/rsvp-dashboard.dto.ts`. Check-ins
are in `libs/gisday/platform/data-api/src/lib/check-in/`.
- **Reuse, don't copy:** if the RSVPs dashboard's season and event pickers, counts table or export can be shared, move
  them to a shared component both dashboards use, behind the RSVPs dashboard's current interface.
- **Admin only:** the route needs an admin permission; extend `private-fields.interceptor.spec.ts` (PR 3003 shows how an
  admin-only read is listed).
- **This site's events only** (`siteListsSession`/`placesShownOn` in `libs/gisday/common`, #2986).
- Add it to the admin dashboards list.
- Tests red first; **the full check** (it adds an API route); screenshots with nobody's name or email (seed your own
  check-ins on the local site); a release note. Push to the fork and report "branch ready". Branch
  `feat/3006-check-in-dashboard`.

> **When the maintainer is at the home machine (his 1B, 15 November 2026):** ask him, once, to sign in to the local
> GIS Day site with the test admin account, so from then on you take your own before/after screenshots and push a
> branch complete. Until then the lab takes them, and the director opens a PR only after they are pushed (DIRECTOR.md,
> "A pull request opens with its screenshots").

> **Every listener, from the maintainer (15 November 2026):** never ask him anything, and never stop to wait for an
> answer. Put the question in your report or a message to the director, take your recommended option if it is safe and
> undoable, or go on to the next part or batch. The director asks him and brings back his answer (DIRECTOR.md, "Every
> listener").

> **The maintainer, 15 November 2026, to the director:** listeners never ask him anything. Every question goes to the
> director, in your report or a message to the director's session, and he answers the director. **#3039 is withdrawn
> from you:** the director makes that CLAUDE.md change itself, as he asked it to directly. Carry on with #3038 and #3029.

> **Batch 59 is withdrawn from you (the director, 11:25 AM Central):** you hadn't started it by then, and the maintainer
> is waiting on it, so the director is building it on the work machine. Don't start it. Carry on with batch 58 (#3038,
> #3029); #3039 is already done by the director (PR 3040, merged). If you are waiting on an answer from the maintainer,
> stop waiting: questions come to the director.

## Batch 59 (gisday: the profile email before the maintainer sends it - #3043, #3045, #3046, #3044; 15 November 2026, from `work (gisday)`) (**Urgent**) - **stop batch 58 where it is safe and do this now**

The maintainer is waiting to send the finalists' profile emails until these are in. **One branch,
`feat/profile-email-finalists`, from the latest `development`, one PR closing all four**, because they all change
`speaker-edit.service.ts`, `profile-email.ts` and the email window, and four stacked PRs would conflict. One commit per
issue, in this order, each red first:

1. **[#3043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3043) (Urgent)**: match co-authors.
   Split each participant's email field on commas, semicolons and spaces, read a bare NetID as `@tamu.edu`, as
   `add-competition-speakers.ps1` (kubernetes-config `6. GIS Day/data`) did when it made their speaker records. One
   shared helper in `libs/gisday/common`.
2. **[#3045](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3045) (Urgent)**: the new
   default text, word for word from the issue.
3. **[#3046](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3046) (Medium)**: the window lists,
   before sending, who has no presenter record and won't be emailed (the preview returns `unmatched`).
4. **[#3044](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3044) (Urgent)**: Markdown in the
   editable emails (profile, acceptance, final reminder): HTML rendered by one shared, escaping renderer (`marked` is a
   dependency) plus a plain-text part; the preview shows it formatted.

The full check (`CHECK_MEMORY=24g CHECK_PARALLEL=3`); one release note per issue. Report "branch ready" with any
questions **to the director**, never to the maintainer. The lab takes the screenshots, then the PR opens.

## Batch 58 (gisday: #3038, #3029 and #3039; 15 November 2026, from `work (gisday)`) (Low)

1. **[#3038](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3038)**: an admin page that gets
   a 403 says the account lacks the permission and names it, not "try again". One shared helper or interceptor; make
   `PermissionsGuard` name the permission if it doesn't. Also the check the issue suggests, if it fits: every permission
   the routes ask for, listed, so it can be compared with Auth0's. Branch `fix/3038-permission-message`.
2. **[#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029)**: the dashboards'
   sideways scroll is findable at 1024 px. **Start after PR 3014's table is in `development`** (it is). Branch
   `fix/3029-dashboard-scroll`.
3. **[#3039](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3039)**: CLAUDE.md's Pull
   requests section gets DIRECTOR.md's new rule, "A pull request opens with its screenshots". Docs only, no visible
   change. Branch `docs/3039-pr-with-screenshots`.

Each: tests red first where there's behaviour, the bug-fix check, a release note for 1 and 2. The lab takes 1 and 2's
screenshots. Report each "branch ready" as it is done.

## Batch 57 (gisday: #3032, #3033 and #3034, which sessions use a broadcast or a tag, and the untagged ones; 15 November 2026, from `work (gisday)`) (**High** for #3032) - **do this now; #3024 can wait**

1. **[#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032) (High)**: a broadcast's
   admin edit page lists the sessions that use it.
2. **[#3033](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3033) (Medium)**: a tag's admin
   edit page lists the sessions that have it. **Build one "sessions that use this" component** for both pages, in the
   shared admin library, exported from its index.
3. **[#3034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3034) (Low)**: Admin, Events'
   tag filter gets a "No tags" choice, as the issue proposes.

One branch per issue (`feat/3032-broadcast-sessions`, then `feat/3033-tag-sessions` stacked on it, and
`feat/3034-untagged-sessions`), each: tests red first, the bug-fix check, a release note. The lab takes the screenshots.
Push each to the fork and report "branch ready" per branch, #3032 first, as soon as it's ready.

## Batch 56 (gisday: #3027, a Sessions page search can be linked to; 15 November 2026, from `work (gisday)`) (Medium) - **do this first, before 55**

[#3027](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3027). The Presenters page
(`people-view.component.ts`, #2919/#2921) already has search-in-the-address, a carried search, and a copy-link button.
Move that into one shared piece (where the next caller will find it, exported from its index) and use it on both pages,
keeping the Presenters page's behaviour and the Sessions page's `tags` and `orgs` parameters. Tests red first; the
bug-fix check on the projects it edits; a release note. The page is public, so take the before/after screenshots
yourself on the local site (no sign-in needed). Branch `feat/3027-sessions-search-link` from the latest `development`.
Push to the fork and report "branch ready".

## Batch 55 (gisday: #3026 and #3024, two Low follow-ups on Research Competitions and the dashboards; 15 November 2026, from `work (gisday)`) (Low)

**Decided (the maintainer):** lab report 62's questions: the cramped table is a follow-up (#3026), and the reminder
window keeps counts and reasons, without titles.

1. **[#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026)**, the cramped submissions
   table. **Start once PR 3020 has merged** (`gh pr view 3020 --json state`), from the latest `development`. Branch
   `fix/3026-submissions-table-fit`.
2. **[#3024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3024)**, the dashboards'
   unread-accounts count not filtered by site. **Start once PR 3014 has merged**; the lab is changing its table now
   (batch 63). Branch `fix/3024-unread-by-site`.

Each: tests red first, the bug-fix check, a release note; the lab takes screenshots. Push to the fork and report
"branch ready" for each. If neither PR has merged, report that and stay listening.

## Batch 54 (gisday: #3023, review and edit the speaker profile email before it is sent; 15 November 2026, from `work (gisday)`) (**Urgent**) - **do this now**

[#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023). The maintainer is waiting on
it to send the finalists' profile emails. The issue lists the three places it's sent from and what's wanted.
- **Reuse what you built for #3017:** `review-email-modal` (with its optional verb), and the provider's shared
  `_preview`/`_sendEmail` pattern, adapted to `speaker-edit.service.ts`'s send. Don't build a second email path. Today's
  subject and text become the default template. Each recipient's edit link is filled in on the server; the preview shows
  a placeholder, never a real link; refuse a template without {edit link}.
- All three callers (Speakers list, Research Competitions, the event form) open the same window.
- Tests red first; **the full check** (`CHECK_MEMORY=24g CHECK_PARALLEL=3`); a release note. Branch
  `feat/3023-profile-email-preview` from the latest `development`. The lab takes the screenshots after. Push to the fork
  and report "branch ready".

## Batch 53 (gisday: #3017, the final reminder skips submissions that weren't accepted; 15 November 2026, from `work (gisday)`) (Medium) - **do this now**

**Decided (the maintainer):** your batch 52 question is **A**. Send final reminder also skips selected submissions that
aren't accepted (rejected or not yet reviewed), in the preview and in the send, and counts them in the "skipped" note,
saying why each group was skipped. Tests red first; the bug-fix check on the projects it edits.

**Push to `feat/3017-final-reminder-pr`** (PR 3020's branch), fast-forward, no force. The lab will push its screenshots
to the same branch afterwards (its batch 62), so fetch it before you push. Report "branch ready".

**Also decided:** #3013 is Medium, and #2948 (PR 3016) merges without waiting for it.

## Batch 52 (gisday: #3017, a "final file" column and a Send final reminder email on Research Competitions; 15 November 2026, from `work (gisday)`) (Medium) - **do this now**

[#3017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3017). The issue has the request and a draft email.

**Decided (the maintainer):** batch 50's questions were 1A (the lab captures #3006's screenshots, batch 60), 2C (#3010 is
High) and 3A (#3010 stays in PR 3014). Batch 51's two questions are with him.

- **"Final file uploaded"**: a submission's attachments (`SubmissionFilesService`, #2933) have no kind, and the abstract
  is text, so treat **any attached file as the final presentation or poster** unless you find otherwise. Say what you
  found. The table already has a Files count. Make it sortable, or add an Uploaded / Missing column beside it that sorts,
  whichever reads clearer, using the table's existing sort.
- **Send final reminder** in the selected-actions bar, beside Send profile email. Reuse the acceptance email's whole path:
  the editable preview (`review-email-modal`), `review-email.ts` (add the reminder as kinds, one for presenters and one
  for posters, with the issue's draft as their default text), and the provider's send with recipients and sessions (PR
  2994). Don't build a second email path. **Skip selected submissions that already have a file**, and say in the preview
  and the result how many were skipped and why.
- Admin only, as the other actions are (`update:competitions`).
- Tests red first; **the full check** (`CHECK_MEMORY=24g CHECK_PARALLEL=3`); a release note. You can't sign in, so the
  lab takes the screenshots afterwards. Say so in `.pr-body.md`. Branch `feat/3017-final-reminder`. Push to the fork
  and report "branch ready".

## Batch 51 (gisday: #2948 reworked, a join table instead of `seasons.competitionTypes`; 15 November 2026, from `work (gisday)`) (Low) - **after 50**

**Decided** (the maintainer, 15 November): your report 49's question 2 is **B, a join table of season and competition**,
because per-competition settings per season are expected. On `feat/2948-season-competition-types`:
- Replace the nullable `seasons.competitionTypes` column with a `season_competitions` entity (season guid plus
  competition type, unique together), so a later setting can be added as a column there. Keep the API and the admin
  form's interface the same, so the page doesn't change.
- Redo the TypeORM migration, and the never-run production script in kubernetes-config `6. GIS Day/migrations/` on its
  branch. A season with no rows still means "all four", as the column's null did.
- Tests red first where behaviour is new; the full check (`CHECK_MEMORY=24g CHECK_PARALLEL=3`, #3000); push to the
  fork and report "branch ready". Screenshots stay for after the next deploy (decided 4A).

## Batch 48 (gisday: #2967, VGI submission photos use the shared JPEG-and-PNG check; 14 November 2026, 8:20 PM Central, from `work (gisday)`) (Low)

[#2967](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2967). #2937 gave every GIS Day image
upload one check, `refuseUnsafeImage` in `libs/gisday/platform/data-api/src/lib/assets/image-upload.ts` (JPEG or PNG by
content). The VGI competition's submission photos (`libs/gisday/competitions/data-api`) still take `accept="image/*"` and
anything sent: use the same check, not a copy. Tests red first; the bug-fix check; push to the fork and report
"branch ready". Branch `fix/2967-vgi-photo-check`.

## Batch 49 (gisday: #2948, admins choose which competition types a season runs; from `work (gisday)`) (Low) - **after 48**

[#2948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2948). The issue has the design. It
needs a season column, so write its production migration script in kubernetes-config `6. GIS Day/migrations/` beside
`migrate-prod-2962.ps1`, on its own branch pushed to origin, never run. Branch `feat/2948-season-competition-types`.

---


> **From 25 October 2026, every listener checks in** (DIRECTOR.md, **Checking in**; #2338): use `tools/listen.sh <your name>` as your watcher, and
> `tools/heartbeat.sh <your name> "running batch <n>" <minutes>` when a batch starts, `idle` when it is reported. `tools/roster.sh` shows everyone.

> **Batches 22 and 23 are WITHDRAWN** (from `work (security)`, 30 October 2026, about 2:30 PM Central): moved to the lab (batch 179) and copilot-home (batch 51), which are idle. Do not do them.

> # Batch 28: your finding is confirmed and filed as #2593 (about 3:30 PM Central, 30 October 2026, from `work (aggiemap)`)
>
> **Good catch, and it is live.** I verified it against the production service independently before taking
> it to the maintainer, and your reading is exactly right:
>
> | Query | Count |
> | --- | --- |
> | `/2` Road Closures, `1=1` | 2 |
> | `/2` with `Type <> 'Closure'` - what the app sends for Event Parking | **0** |
> | `/2` with `Type = 'Closure'` - what it sends for Road Closures | 2 |
> | `/3` Event Parking, `1=1` | **15** |
>
> So Event Parking draws nothing and Road Closures still works by luck. Filed as
> **[#2593](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2593)**, Bug, High,
> In Progress, with the measurements. **Put `Closes #2593` in your pull request body** and keep `Refs #2530`
> for Megan's note, which is her report rather than the bug.
>
> ### One thing I measured that you may not have, and it changes the fix
>
> **`/3` is not purely event parking.** 15 features, of which **2 are `Type = 'Closure'`**:
>
> - repoint Event Parking at `/3` and **keep** the filter -> 13 features
> - repoint and **drop** the filter -> 15
>
> **Do not pick silently.** Work out what those two features are - open them and look - and say which you
> chose and why, with the reason in a comment beside the filter if it stays. If it is genuinely unclear
> what Transportation Services intends, say so in your report and leave the filter on (13), because drawing
> a closure as if it were parking is the worse error of the two.
>
> ### The check matters as much as the fix here
>
> This is the fault class the smoke suite exists for - **the map broke with no commit and no build**. The
> layer check passed because the layer resolved and answered correctly, with zero features. So the check
> worth adding is that **a layer the app depends on returning zero features is a failure, not a pass**
> ([#1167](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1167)). Make it red
> against the current definitions first.
>
> Be careful scoping it: some layers legitimately hold nothing at some times of year. Apply it where the
> app cannot work without data, and say which layers you applied it to and why.
>
> ### Also
>
> **Batch 27 is in and I am opening its pull request now** - `feat/2581-event-refresh-switch` at
> `8bb43d72b`. Good work: `gameDayRefresh { enabled, layers }` on `EventConfiguration` is the shape he
> asked for, and dropping the helper parameter while keeping its strict guards was the right call.

> # Batch 28 is in as PR 2615 - both your questions answered (6:30 PM Central, 30 October 2026, from `work (aggiemap)`)
>
> **[PR 2615](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2615)** is open with `Closes #2593` and `Refs #2530`. Good work, and three parts of it
> are better than what the batch asked for:
>
> - **Keeping the filter, with the object ids opened to prove why.** "Production's `/3` repeats `/2`'s two
>   closures" is a measurement, not an inference, and it is what makes the choice defensible instead of
>   cautious.
> - **Folding Fall and Spring into one definition.** Two copies of 130 lines was *why* the service moving
>   meant two places to repoint. That is half of [#2599](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2599), which the duplication audit found
>   independently.
> - **Exempting `1=0` and date windows by form**, which I had not thought of. A structural exemption needs no
>   list and cannot go stale, and it is what took seven false positives to one.
>
> And **production's `allowedMapLayerFailures` is now `{}`**, which is worth saying out loud.
>
> ### Your questions
>
> **1. Production's Event Parking view holds the two closures: A, as you recommended.** Keep the filter and
> tell Transportation Services. It is in the drafted message to them with your measurements, as a heads-up
> rather than an ask - the map is correct either way now, and the comment you left says when to remove the
> filter.
>
> **2. The Buildings count failures: A, and filed as [#2616](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2616)** (Bug, Medium).
>
> **I filed it wider than you framed it, because your finding joins up with another.** The release tier that
> cleared today's build reported 5 failures and 32 flaky - and three of those failures and most of the flakes
> were *the same thing*: the server refusing about one count query in ten, on production as well as
> development. Your `Unable to complete operation.` on different maps each run is that, not a Buildings
> problem.
>
> So the issue is "the count queries are the suite's noise floor" rather than "Buildings is flaky", and it
> says what I think is worth trying: retry or lengthen the count, then **ask whether a count is the right
> question at all** - most of these checks only want to know whether a layer holds anything, and
> `resultRecordCount=1` answers that far more cheaply than counting a large layer. It also says explicitly
> **not** to put Buildings on an allowed list, which would hide a working check and a real empty-Buildings
> fault with it.
>
> **Your instinct to look for an issue and find none, rather than add an allow entry, is the reason this got
> filed properly.**
>
> ### Nothing queued yet
>
> You are idle and that is fine - the maintainer has eight pull requests waiting and I would rather not add a
> ninth tonight. If you want something, #2616's first step (retry or lengthen the count, with before and
> after flake counts) is the most valuable thing left in AggieMap, but wait for a batch.

> # Batch 28: your Move-In finding is #2612 - point the allow-list entry at it (5:05 PM Central, 30 October 2026, from `work (aggiemap)`)
>
> **The inverted check came out better than I suggested.** Exempting `1=0` and date windows **by form**
> rather than by name is the part I had not thought of: a structural exemption needs no list and cannot go
> stale, and it took seven false positives down to one real finding. Good.
>
> **And the one finding is not a fault**, which is worth knowing before you write its entry. I measured the
> service:
>
> | Query on `FallMoveInParking_view/FeatureServer/0` | Count |
> | --- | --- |
> | `1=1` | 170 |
> | `Type = 'Bike'` | **2** |
>
> So the base filter is fine - there are two bike registration points and the layer finds them. **It is the
> area effect on top that empties it**: neither is in Northside. That is the data being right, unlike
> Graduation, where the filter pointed at a layer that had moved.
>
> **Filed as [#2612](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2612)**
> (Task, Low). **Please point your `allowedEmptyFilters` entry at it**, with a few words saying it is the
> area effect rather than the filter - the repository's rule is that a known failure stays visible and tied
> to an issue, and an unexplained entry is exactly what someone later reads as a hidden bug.
>
> That is the only change I am asking for. **Everything else: push it.**
>
> I also noted on #2612 that Move-In is an August event and it is October, so the service's contents may
> differ in season - a reason not to encode anything clever about it. No action for you.

> # Batch 28: a progress line, please (4:56 PM Central, 30 October 2026, from `work (aggiemap)`)
>
> **You are alive** - heartbeat at 4:50 PM - so this is not a welfare check. But **your last progress line
> was 3:46 PM**, seventy minutes ago, and it said the fix was already green and you were re-proving. I
> cannot tell from here whether you are:
>
> 1. still re-proving the named-list version on dev and production;
> 2. reworking the check after my 3:48 PM note recommending the inverted form (check everything, allow the
>    known-empty per environment in `environments.json`); or
> 3. stuck on something.
>
> **One line saying which is enough.** No need to interrupt a run to write it.
>
> ### Why I am asking rather than waiting
>
> **#2593 is a live production fault** - the Graduation maps draw no event parking right now - and it is the
> one genuinely urgent thing outstanding. The maintainer has six pull requests waiting and this would be the
> seventh; I would rather he merged it tonight than tomorrow.
>
> **If the inverted check is turning out to be a bigger job than it looked**, say so and **push the named-list
> version as it stands.** The fix is the urgent half and it is green. The check can be a follow-up issue -
> I will file it - rather than holding a production fix behind a test-design improvement that I asked for
> as a recommendation, not a requirement. That was my call to offer and it is my call to withdraw.
>
> ### If you are nearly done
>
> Carry on and ignore this. Report as usual.

> # Batch 28: the named list gives up most of the check's value - one more look before you finish (about 4:00 PM Central, 30 October 2026, from `work (aggiemap)`)
>
> **The fix is right and the 7 false positives were a real finding.** This is about the check only, and it
> is a recommendation rather than an instruction - you have the measurements and I do not.
>
> You replaced *"a filter that selects nothing its service holds"* with **a named list of layers to check
> (Graduation's Event Parking)**. That removes the false positives, and it also means **the check can only
> ever catch the map we already fixed.** #2593 was not found by a check; it was found because somebody
> happened to look. A named must-check list leaves the next one to be found the same way.
>
> ### What I think fits better, and it is this repository's own pattern
>
> **Invert it: check every filtered layer, and keep a named list of the ones allowed to match nothing**, in
> `test/smoke/aggiemap/environments.json`, per environment - beside `allowedLayerFailures`,
> `allowedMapLayerFailures`, `allowedServiceFailures`, `allowedPopupFailures` and the rest, which exist for
> exactly this. CLAUDE.md's reasoning for them is that a fault stays **visible** and its fix gets noticed,
> rather than the check being absent.
>
> That gives you:
>
> - **fail-safe instead of fail-open** - a new map whose filter stops matching fails, without anyone having
>   to remember to add it;
> - **the 7 recorded with their reason**, where a reader can see them, rather than silently outside the
>   check;
> - **a deliberate act** to add an eighth, which is the point.
>
> ### One thing to check before you accept that
>
> **Are those 7 empty by design, or empty because the development GIS server does not serve the data?** It
> matters, and the lists above are already per environment:
>
> - **Environment artefact** - then the entries belong under `development` only, and the check stays strict
>   on production, which is where it matters most. That is how the dev server's missing services are already
>   handled.
> - **Genuinely by design on both** - then they are entries on both, each with its reason.
>
> **If after looking you still think the named must-check list is right, keep it and say why in the report**
> - you have seen the 7 and I have not. But if it is only that the inverted version was more work, the
> inverted version is the one worth the extra half hour: it is the difference between a check that found
> this bug and a check that records it.
>
> Also: while tracing a separate question I filed **[#2607](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2607)**
> against the same two files - **`graduation-fall` still offers December 2025's days**, with labels naming
> weekdays that are wrong for 2026. **Do not fix it in this branch**; it needs the real 2026 dates from the
> university. Just do not be surprised by it, and do not "tidy" those dates while you are in there.

## Batch 30 (aggiemap: #2655 - a tool that compares network routes to straight-line distance, to find where the routing network is wrong; 5 November 2026, 9:05 AM Central, from `work (aggiemap)`)

**Start after batch 29.** **Expected: 4 to 5 hours**, plus one long run you start and leave going.

[#2655](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2655) (Feature, Medium).
**Read it first and do not re-measure what it already measured** - the network, the modes, the `Length`
attribute, the building counts, the batch sizes and timings, the three hazards and the observed ratio
distribution are all in it, taken from real requests on 5 November. The maintainer asked for this directly:
quick tests he can run after a network change, and a full every-building-to-every-building matrix for
comprehensive errors and for comparing one network publish with the next.

### Build it as a tool, not a script

`tools/network-detour/` (name it better if you have one), with a `README.md`, beside
[`tools/layer-titles`](../../blob/development/tools/layer-titles/README.md) and
[`tools/builder-inventory`](../../blob/development/tools/builder-inventory/README.md) - read both first and
follow their shape: a `.mjs` entry point, run in a `node:24.22.1` container against a checkout, flags
documented in a table, and a README that says what the thing is *for* and when not to use it.

**Reuse before building** (CLAUDE.md, the maintainer's standing rule): the suite already has helpers for
asking which GIS host to use - batch 57's `#2604` work and `test/smoke/aggiemap`'s shared modules. Look there
before writing a host helper, and say in your report where you looked.

### The three tiers, smallest first

The smoke suite's tier design is the pattern ([its README](../../blob/development/test/smoke/aggiemap/README.md)):

1. **`quick`** - a **committed** set of pairs, so one run is comparable with the next. A couple of minutes.
   It must contain: a spread across distance bands (the ratio is distance-sensitive, see below), every pair
   any run has ever flagged, and pairs a person would actually ask about. This set is the regression test;
   it is checked in, and adding to it is how a found fault stays found.
2. **`full`** - every building with coordinates to every other. **779 buildings, 302,931 unordered pairs,
   about 4.4 hours single-threaded and under an hour at eight workers.** It must be **resumable**: a
   four-hour run that loses everything to one timeout will not be run a second time. Write progress as you
   go.
3. **`one`** - a named pair or a named building against everything, for chasing one report.

Flags: `--mode` (`Walk` default; `Bike`, `Bus`, `Drive`, `Walk_ADA`), `--network` (so one publish can be
compared with the next - that comparison is the point), `--threshold`, `--workers`.

### Get these five things right, because each one was found the hard way

1. **Key on `OBJECTID`, never `Abbrev`.** 778 buildings match the filter; **only 377 have an abbreviation.**
   A tool keyed on `Abbrev` covers under half the campus while looking complete. Carry `Abbrev` and
   `BldgName` for the report, key on the id.
2. **Join results on `RouteName`. Never by position.** A pair that cannot be routed comes back as *nothing*,
   with no error, so a positional zip mis-pairs every route after the first gap and reports confident wrong
   numbers. **Reconcile the counts on every batch and fail loudly** when routes back ≠ pairs sent minus pairs
   explained. This is the #2631 shape again: the failure returns success.
3. **The unreachable pairs are the most valuable output, not an error to swallow.** Fast pass with
   `ignoreInvalidLocations=true`, then re-ask each gap on its own with it **false**, which makes the server
   name it: `No route for "p0000" from location "1044" to location "1084". No solution found.` Report those
   with the server's own words, grouped by building - a building that cannot reach anything is a different
   fault from a pair that cannot be joined.
4. **The threshold has to vary with distance.** 50 m of detour is a ratio of 1.25 on a 200 m line and 1.025
   on a 2 km one, so a flat threshold fills the report with short pairs and buries the real errors. Report
   **excess metres beside the ratio** and band by straight-line distance. Measured on 84 real pairs: worst
   2.59, best 1.12, none below 1.0.
5. **A ratio below 1.0 is impossible** - a network path cannot be shorter than the straight line. If one
   appears, the measurement or the coordinates are wrong. Say so loudly; do not report it as a good result.

### Prove it on a fault you make

There is no production routing service (`gis.it.tamu.edu`'s `Routing` folder is empty), so this runs against
development only - **say that in the README and in the output**, so a run is never mistaken for having tested
production.

**The test that matters is not "the tool runs".** It is "the tool finds a break that is there and does not
cry wolf about one that is not". So:

- A unit test over the ratio, banding and reconciliation logic with **fixture responses**, including a
  response with a missing `RouteName` (does it fail loudly or mis-pair?) and one with a sub-1.0 ratio.
- Prove the reconciliation red first: feed it a batch where one route is absent and confirm it fails, naming
  the pair. That is the bug class this tool exists to avoid in itself.
- Then run `quick` for real, and put its output in the report.

### Start the full run early and leave it going

Per the maintainer's standing preference, the long thing goes first: **once `full` works, start it and carry
on with the writing while it runs.** Report its elapsed time and its finish time (US Central), and commit its
run file.

### The check and the notes

`bash scripts/check-in-volume.sh <branch>` - a new tool under `tools/` belongs to no Nx project, so expect
*No tasks were run* plus the `lint.yml` steps, unless you add a project for the unit tests, which would be
better. Exit code in the report.

No release note: this has no user-visible result. Apply `no-visible-change` thinking - say in the report that
you checked rather than leaving the box blank.

### The report

`home/reports/2026-11-05-30.md`. Lead with what `quick` found and what `full` found, then the branch commit,
then the unreachable buildings grouped - that list is what goes to the GIS team. Questions under
**Questions for the director (aggiemap)**.

## Batch 29 (aggiemap: #2653 - make `tsgisHost` obey the environment flag, so a development build reads the development server; 5 November 2026, 8:20 AM Central, from `work (aggiemap)`)

**Start now.** **Expected: 3 to 4 hours.** A branch. **This is yours because you built
[PR 2615](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2615) in batch 28** - you
already know `connections.ts`, `connections.spec.ts` and the graduation definitions, and this is the general
form of the special case you made there. It was queued to `copilot-home` as its batch 59 and moved here
because that machine has taken no batch since 30 October.

[#2653](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2653) (Bug, **High**) has
the whole measurement: all 57 services the app names on Transportation's host, asked of **both** hosts and
compared by layer id, layer name **and field list**. Read it first; everything below assumes it.

### What is wrong

`getDefaultGisHosts()` hard-pins `tsgisHost` to `arc.ts.tamu.edu` with a `TEMP:` comment, so the permit and
event maps ignore the environment flag that every other service obeys. The maintainer's words, 5 November:

> These maps should be reading from the dev host layers based on which environment the site is running in. If
> they are not doing this, it is an error that we have created in some of our work over time. [...] If these
> were previously hardcoded into the event definition files, it's because the dev layers did not exist
> previously, which they now do.

He is right, and `athleticsHost` - the constant you added `graduationParkingUrl` to in batch 28 - is the same
workaround applied by hand to twelve services. **This batch generalises it and retires it.**

Two facts that explain why nobody has simply flipped it:

- **`arc.ts-dev.tamu.edu`, the host in the commented-out line, does not resolve** and appears never to have.
  The dev counterparts live on `gis.dev.tamu.edu`, where you pointed graduation.
- **The dev server has no `TS_Events` folder.** It has a public `TS` folder of 60 services whose names line up
  one-for-one. So flipping the host alone returns nothing on about half of them, which is very likely why an
  earlier attempt was reverted to a pin.

### The fix

1. **`tsgisHost` resolves to `gis.dev.tamu.edu` on a development build**, by the same
   `readsDevelopmentGisServer()` test `gisHost` uses, so `actingAsProduction` and the smoke suite's explicit
   `Connections(host)` calls keep behaving.
2. **A path rule beside it: `TS_Events/<X>` on production is `TS/<X>` on the development server.** One rule,
   one place, with the measurement as its comment.
3. **Retire `athleticsHost`** into the general mechanism rather than extending it a thirteenth time. Its
   services are at the same path on both hosts, so they need no path rule - they stop being special.
4. **The four we are simply missing move with the rest**: `4H_Roundup_view`, `AggielandSaturday_view`,
   `Aggie_Family_Parade_view`, `Big_Event_view`. Public on the dev server at the identical path, same layer
   ids, **every field matching** - pinned to production only because nobody added them to `athleticsHost`.
5. **The sixteen that cannot move stay named on production, each with its own reason beside it**, the way
   `lactationRoomsUrl` and `basemapUrl` are. Their dev copies are the older MapServer the hosted view
   replaced and are **missing `objectid`** (and `SHAPE__Area`, `catid`, `createdat`, `publishedat`).
   `objectid` is the one that matters: the exact-match search sources and the share links are built on it.
   Routing them is #2209 again. **Name them individually. No silent fallback** - a fallback is how this
   becomes invisible a second time.

### Prove it red first, and prove the right thing

The bug is not a wrong URL. It is a right URL nobody revisited. So the test has to fail when a service is
pinned to production **without a stated reason**:

- In `libs/aggiemap/ngx/common/src/lib/connections.spec.ts`, over a development-host `Connections(...)`:
  every transportation URL resolves to the development host **except** an explicit, named allow-list - the
  sixteen plus the four retired 150th-era events (`150th_Kickoff`, `Kickoff_at_Kyle`, `Live_at_the_Station`,
  `Spirit_of_150_Week`, which have no dev counterpart at all).
- **That allow-list is the deliverable as much as the code is.** It is what the director takes to
  Transportation: "publish the hosted view for these sixteen on dev and the maps become testable."
- Run it against unmodified `development` and confirm it fails, naming services. Put the output in the report.
- **PR 2615 is not merged and touches `connections.ts` and `connections.spec.ts`.** Branch from
  `origin/development`, and if 2615 has merged by the time you start, say so; if it has not, expect to resolve
  it later and keep your diff narrow in those two files.

### The five that differ only in geometry fields

`Fish_Camp`, `HS_Graduation`, `Physics_Fest` and `SEC_Grounds_Conference` differ from their dev counterparts
only in `Shape_Area` / `Shape_Length`. **Grep the definitions, popups and search sources for those two
names.** If nothing reads them they move with the clean twenty, and the report says that was checked rather
than assumed. `TS_Main` is different: its layer 6 is missing real `GIS.TS.SPC_PNT_CNT.*` attributes, so expect
it on the allow-list with that as the reason.

### In a browser, because this is the part no test tells you

A development build of the branch, and for each of **business parking, contractor parking, freshman parking,
timed parking, night and weekend, visitor parking, Aggieland Saturday and Big Event**: the layers draw, the
legend has its symbols, a popup opens with its fields filled, and the copy link reopens the same feature.

**Take the "before" first and keep it**: a development build of plain `development` draws production's data,
and that state stops existing the moment the branch is on disk. Before and after for at least three maps.

Then **`test/smoke/aggiemap/run-local.sh local`**, and say what changed against the same run on
`development`. Layers will newly appear and some will newly fail - that is the point, and **every new failure
is named, not explained away**. Where the dev server genuinely lacks something the suite expects, that is an
`environments.json` entry with its own issue, as #1229 and #2350 did.

### The check and the notes

`bash scripts/check-in-volume.sh <branch>` - **the full affected check, not a project list.** This changes
`connections.ts`, which nearly everything reads; it is not a bug-fix-shaped change. Exit code in the report.

A release note at `docs/releases/unreleased/2653-dev-host-transportation.md` with its *What to test on dev*
row, images under `docs/screenshots/2653-dev-host-transportation/`. The user-visible result is real: on
development these maps begin showing development data.

### The report

`home/reports/2026-11-05-29.md`. Lead with the red test's output, then the branch commit, then the allow-list
with a reason per entry. Questions under **Questions for the director (aggiemap)**.

## Batch 27 (aggiemap: #2581 rewritten - a per-event refresh switch, **not** the women's refresh; 30 October 2026, from `work (aggiemap)`)

**Your batch 26 stop was right and your split was exactly what I wanted.** The maintainer has now decided
what to build instead, and it is bigger and better than the women's change you were stopped on. **Read
[#2581](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2581) again - I rewrote it; the title and body are new.**

Megan does not want Women's Basketball refreshing. The maintainer:

> Can we configure it in the definition file for the event, but have it set to false for now?

> They will eventually build it, and we should have it as an option that we can turn on/off in a
> generalized manner for different events.

### His decisions, so you do not have to infer them

He was given the options and chose:

1. **A field on `EventConfiguration`**, in the event's own definition file - not a named constant per file,
   and not a parameter on `athleticsDevelopmentSource`. That object is what a reader opens to ask what an
   event does, and it reaches football and men's basketball, which do not use that helper.
2. **A per-event switch plus a per-layer opt-in.** Both levels. Football refreshes **only its lots**; the
   men's refreshes **all three**. A single per-event boolean would start refreshing football's other layers.
3. **Fold football and men's basketball into it in the same change.** One way of doing this, not a fourth
   alongside three old ones.

**Your batch 26 finding that the men's cannot use `athleticsDevelopmentSource` because its popups differ is
still true and no longer blocking** - the switch is not on that helper.

### Your helper-only branch

`chore/2581-athletics-refresh-option` at `acc45cbc2` is good work and I have not thrown it away, but the
optional `refreshInterval` on `athleticsDevelopmentSource` is **not** where the switch goes now. **Keep its
two strict guards** - the ones proving an existing caller's source object comes out byte-for-byte unchanged.
That idea is the most valuable thing in the branch and it applies just as much to the new shape. Decide
whether the helper parameter still earns its place underneath the event-level switch; if it does not, say so
and drop it.

`feat/2581-womens-basketball-refresh` at `9411f5ffa` is **not** going anywhere - do not build on it.

### Women's Basketball

**The switch present and explicitly off**, with **Megan's decision recorded beside it in a comment** - that
she asked for it not to refresh, not merely that it is false. An unexplained `false` reads as an oversight
and the next person switches it on.

### Prove it

- **Red first.**
- **Football and the men's must behave exactly as they do now, and that is the claim to prove**, not
  assume. `mens-basketball.definitions.spec.ts` and `football-parking.lots.spec.ts` already assert
  `refreshInterval` is 1 - those are your guards that the fold-in changed nothing. Football: **lots only**.
  Men's: **all three**.
- `scripts/check-in-volume.sh <branch> affected` - this touches `EventConfiguration` and
  `common.definitions.ts`, so it reaches far more than one map and a project list would miss something.
  Exit 0.
- **No release note** unless a visitor sees a difference, and they should not. Say in the report that you
  checked rather than leaving it unmentioned.

Push to `fork`, report `branch ready:`. Questions go to `work (aggiemap)`.

---

## Batch 28 (aggiemap: #2530 - Megan republished the Graduation maps; 30 October 2026, from `work (aggiemap)`)

**After batch 27.** [#2530](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2530) has been open since 28 October and nobody has picked it up; the
maintainer chose this as home's next job.

Megan, in the issue:

- **Production** has been republished **with the layers split: now 4 layers, closures as a separate layer.**
- **Development** has been republished **as a hosted feature**, and the view AggieMap should read is a new
  URL under `Hosted/GraduationParking_view/FeatureServer`. She will decommission the referenced map once we
  are on the hosted view.
- **Both maps should be identical**, and her screenshot in the issue shows what they should look like.

### Why this is more than a URL change

**Read the issue and both services before touching a definition**, because the shape changed, not just the
address: a layer that was part of one service is now its own layer, so layer indices move. Getting an index
wrong here draws the wrong thing rather than failing, which is the worst kind of wrong.

**There is a known failure waiting on this.** The lab has reported Graduation Fall and Spring failing the
builder-map layer check on **both** environments, on the Road Closures legend, in batch 172 and since. A
separate closures layer is plausibly the fix, or at least changes the fault. **Check whether it clears**,
and say either way - if it clears, remove the known-failure entries in the same change, which is what the
repository's own rule asks.

**[#2521](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2521) is related and already investigated**: copilot-home found the Road Closures
legend does *not* reproduce on either environment any more, because the service was edited after the issue
was filed, and its branch `fix/2521-road-closures-legend` removes four stale known-failure entries. **Read
that report before you start** (`copilot-home/reports/2026-10-30-49.md`) so you do not redo it or collide
with it.

### Prove it

- **Ask both services what they actually are** before and after: layer ids, names, field names, and that
  each answers its own query. The repository's rule is that a check must ask what the app does, not just
  whether the service answers.
- **Both environments**, since she says both should now be identical - and say whether they are. If they are
  not, that is a finding for her, not something to paper over in a definition.
- Before/after screenshots of both Graduation maps, dev and production.
- `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` exit 0, plus the layers spec on both
  environments.
- A release note with its *What to test on dev* row.

Push to `fork`, report `branch ready:`.

---

## Batch 25 (gisday: #2574 - Admin → Users answers 500 past Auth0's 1,000-user limit; add a search; a branch; 30 October 2026, about 11:00 AM Central, from `work (gisday)`)

**High priority, start now.** About 90 minutes. Questions go to `work (gisday)`.

[#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574) has the evidence: on production,
`GET /api/users` answers 500 and Admin → Users spins for ever. `ManagementService.getUsers`
(`libs/common/nest/auth/src/lib/authorization/services/management/management.service.ts`) walks every page, 50 a page, and
**Auth0 refuses any page past the first 1,000 users**; the tenant has more than that.

### What to do

1. Branch `fix/2574-gisday-admin-users` from the latest `origin/development`.
2. **Red first**, with a fake Management API client in the existing spec style:
   - a tenant of more than 1,000 users whose page 21 is refused as Auth0 refuses it: `getUsers` returns the first 1,000 and does
     not throw, and logs that the list is cut off;
   - `GET users` (the controller) answers 200 with those, and says the list is incomplete (for example `{ users, truncated: true }`,
     or a header; choose the smaller change for the page and say which);
   - a search: `GET users?q=<text>` asks Auth0's user search (`users.list` with `q` and `search_engine: 'v3'`, matching name or email,
     the text escaped for Lucene) and returns matches, including a user who would be past the first 1,000.
   Prove them red.
3. **The API:** stop at the 1,000 limit cleanly (stop paging at 1,000 records, or catch exactly Auth0's refusal, not every error); add
   the search parameter. Reuse `_composeMetadata` for both. Keep `create:users` and the other guards as they are.
4. **The page** (`libs/gisday/platform/ngx/core/src/lib/pages/admin/pages/users/...`): a search box above the list (reuse the
   shared `tamu-gisc-textbox`, debounced), which asks the API; and a short line when the list is cut off: "Showing the first 1,000
   users. Search to find anyone else." **No new one-off styles.**
5. `scripts/check-in-volume.sh fix/2574-gisday-admin-users common-nest-auth,gisday-platform-data-api,gisday-platform-ngx-core,gisday-nest,gisday-angular`
   exit 0. Commit with `Closes #2574`; push to the fork.
6. Screenshots: the local stack has only a few users, so capture the page with a search typed and its result (signed in as the
   dev tenant's test admin, as the lab does), before and after, into `docs/screenshots/2574-admin-users/`, plus
   `docs/releases/unreleased/2574-admin-users.md` with its row. If the local stack cannot sign in, say so and skip.

Report as usual. The director opens the pull request.

---

## Batch 22 (security: #2564 - WITHDRAWN, moved to work-lab-leila batch 179)

## Batch 24 (aggiemap: #2573, the hatch at 60% so the building number is readable; 30 October 2026, from `work (aggiemap)`)

**#2558 is PR 2571, and checking the service first earned its keep again:** the enum ids do not match the
layers - `GATES` is `/0` *Basketball Icons*, `SYMBOLS` is `/1` *Basketball Closures* - so the issue's
"icons and parking" were two differently-named things and Closures was a third you included deliberately.
Watching a real browser for 150 seconds, and reporting that **no data was re-queried because nothing had
changed**, is what makes that pull request trustworthy rather than hopeful.

### Decided, from your questions file

The maintainer has answered, and these are now settled:

| | |
| --- | --- |
| **1** | #2520 **Medium**, #2527 **Medium**, #2529 **Low** - all set |
| **2** | **He** asks Transportation Services to republish the NSC and Break lots |
| **3** | **Women's basketball gets the same refresh**, its own small PR - batch 25, after this |
| **4** | **Your question 14 was right to ask: 60% was never applied.** This batch |
| **5** | #959, #960, #962 one at a time, #960 first - not yours yet |
| 9, 10, 11, 13, #141 | Taken by the director: leave the football casts for #1028; leave the 14 empty points and mention them to the GIS team; mark graduation's check heavy so it runs nightly; a follow-up issue for the basketball ids after 3 November; #141 stays open until #659 |
| 15, 16 | `deepmerge` - passed to the security director, not yours to answer |

### The task

[#2573](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2573). In
`construction-hatch.ts`, the hatch strokes go from `[230, 152, 0, 255]` to **`[230, 152, 0, 153]`**.

**That is the whole change.** Spacing stays 12 pt, stroke stays 1.5 pt, colour stays the same. He looked at
1524 on dev and a vertical grid line falls between the digits, so *1524* reads as *"15 24"*.

### The one thing that could make it wrong

**At zoom 15-16 the construction buildings are small and the grid is most of what identifies them.**
Lightening it too far trades a legible label for an unidentifiable building. He named **75%** as the
fallback if 60% looks washed out there.

So: **before and after at zoom 16, 17 and 18**, on College Station (1524, and 1526 beside it has the same
problem) and on one campus, since one symbol now serves all three. Then **your judgement in the report on
whether 60% holds up at 16** - and if it does not, **say so with the picture rather than shipping it.**
That call is his, as the density was.

A test that the stroke alpha is 153, red first. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,ts-events-ngx,aggiemap-angular`
- exit 0. Update #2459's release note rather than adding one; it already describes the hatch.

Push to `fork`, report `branch ready:`. **Small, so report quickly** - it rides the same build as the
basketball refresh and the dining kiosk fix.

## Batch 23 (security: deepmerge - WITHDRAWN, moved to copilot-home batch 51)

## Batch 21 (aggiemap: #2558, basketball parking refreshes like football - URGENT; 28 October 2026, from `work (aggiemap)`)

**Batch 20 found a live production bug by doing cleanup, which is the best kind of find.** The dining kiosk
opening the building's popup instead of the dining location's - and the `layerIndex: 1` that was meant to
stop it and never could. Red 3 of 3 against production first. It is **PR 2557**, and #2552 is set to High.
Measuring 19 views twice before and after, rather than reasoning about the order, is what makes that
branch trustworthy.

### This one is urgent and dated

[#2558](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2558), from the
maintainer, labelled `urgent`:

> We're going to need the men's basketball map to refresh for basketball icons and basketball parking
> layers every 60 seconds like football since it has an editor and can be updated day of to show lot
> closures. **I believe the first game is Nov. 3rd.**

**Field staff edit the service on game day and the map must show it without a reload.** Football already
does this.

### How football does it

`football-parking.definitions.ts`:

```ts
const lotsNative = (): FeatureNativeProps => hiddenNative({ labelingInfo: lotLabelingInfo, refreshInterval: 1 });
```

`refreshInterval` is **minutes**, so `1` is the 60 seconds the issue asks for. `football-parking.lots.spec.ts`
asserts every lot source has it - copy that idea.

### What men's basketball has now

`mens-basketball.definitions.ts`, three layers in `MensBasketball_ColdLayerSources`, each with plain
`native: { outFields: ['*'] }` and **no** `refreshInterval`:

| Layer | Enum id |
| --- | --- |
| Gates | `mens-basketball-gates` |
| Symbols (the "icons" in the issue) | `mens-basketball-symbols` |
| Parking lots | `mens-basketball-parking-lots` |

The map draws `MensBasketball_ColdLayerSources` directly - there is no development array for it - so this
is contained.

### What to do

1. **Symbols and parking lots get `refreshInterval: 1`.** Those are the two the issue names.
2. **Decide about Gates and say why.** Gate closures are exactly the kind of day-of change the editor is
   for, so it probably wants it too - but the issue does not ask, so make the call deliberately and
   record it rather than silently including or excluding it.
3. **Follow football's shape.** If a small helper like `lotsNative()` makes sense here, use one; do not
   invent a different mechanism for the same job.
4. **A spec**, modelled on `football-parking.lots.spec.ts`: each layer that should refresh does, every
   minute. **Red first.**

### Check the service, as always

**Confirm the layers actually carry what field staff edit** before trusting the issue's framing - that rule
has caught four things this week. Specifically: does the men's basketball service have the fields a closure
would be marked in, and do the layers return features today? If the editor writes somewhere these layers do
not read, polling them changes nothing and that is the finding.

### Women's basketball

**Do not change it in this branch.** It has the same shape and will likely want the same thing, but the
issue names men's, and polling a layer nobody edits is wasted requests every minute for every visitor. Put
it in your report as a question with a recommendation; I will take it to the maintainer.

`scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0. A release note with its
*What to test on dev* row - a reviewer needs to know how to see a refresh happen.

Push to `fork`, report `branch ready:`. **This is wanted for 3 November, so report as soon as it is ready
rather than polishing.**

## Batch 20 (aggiemap: #2061, the layerIndex values that order nothing; 28 October 2026, from `work (aggiemap)`)

**Batch 19 did the thing I asked and the thing I needed.** You confirmed all five entries were stale **by
running the specs** rather than trusting my table - which mattered, because if one fault had still been
live my claim to the maintainer that the republish was complete would have been wrong. And you photographed
production drawing in both modes: lots in two colours, symbols, three closures. That is the first time
anyone has seen that map working since it broke. It is **PR 2547**.

### Why this one is yours

In batch 18 you worked out the rule nobody had written down:

> an event map adds its layers in the **reverse of its layer-id enum**, one at a time, so the **first enum
> entry draws on top**; the order of the source list decides nothing.

[#2061](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2061) is the consequence:
**45 `layerIndex` lines across the event definitions that do not order anything**, because that is not how
ordering works here. They look like they mean something, and the next person to need a layer on top will
set one and watch it do nothing - which is three tries' worth of confusion, as you found.

copilot-home's triage line was: *"Per file, decide if the order was meant; move that into the `references`
order; delete the values."*

### How to do it without breaking a map

**Per file, and the deciding is the work.** For each `layerIndex`:

1. **Was an order meant?** If a map has a layer that must draw above another - an area over a building, a
   highlight over a lot - that intent is real even though the mechanism never worked. **Move it into the
   enum order**, where it does work.
2. **Or was it noise?** Many will be copied boilerplate that never had an intent. Delete those.
3. **Say which you decided for each file**, briefly. A table in the report is enough. That record is what
   stops someone re-adding them.

**Where an order is meant, prove it**: `layer-order.spec.ts` is the right tool and already covers Indoor
Track. Add a row for any map where getting it wrong would be visible.

### Watch for

- **This is wide** - 16+ files. If it gets unwieldy, **do the files where an order was clearly meant first
  and say what is left**; a half-done job honestly reported beats a rushed whole one.
- **`docs/map-layers.md` has a Drawing order section.** If your batch-18 rule is not in it, add it - that
  is the durable half of this, and more valuable than the deletions.
- The campus maps you touched in batch 18 are already right; do not re-litigate them.

`scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0. Push to `fork`, report
`branch ready:`. No pull request.

## Batch 19 (aggiemap: the GIS team fixed production - clear the exceptions and prove it; 28 October 2026, from `work (aggiemap)`)

**#2532 is PR 2541.** The layer-order rule you found - *an event map adds its layers in the reverse of its
layer-id enum, so the first enum entry draws on top* - is worth more than the fix, because it was not
written down anywhere and three people would each have discovered it the hard way. And you reported your
own near miss (pushing in the same command as a check whose exit code you had not read) rather than burying
it; that is in the pull request.

### What changed under us

**The GIS team republished production's baseball service while we were working.** Verified at 11:40 AM:

| | Before | Now |
| --- | --- | --- |
| `/2` | `Gate/Road Closure`, `objectIdField: objectid_1`, **HTTP 500 on every query** | **`Closures`**, `objectid`, `{"count":3}` |
| `/0` renderer | `simple` - one black dot | **`uniqueValue` on `name`** |
| `/3` renderer | `simple` - one pale blue fill | **`uniqueValue` on `type`** |
| Portal item overrides | three, keyed on fields the layers lacked | **none at all** |

So **#2510 and #2522 are closed**, and production's baseball service now matches development exactly.

### The task

**Three known-failure entries are now stale**, and the suite is about to start printing
`known failure now fixed` for them. That annotation exists so they get removed; removing them is this
batch.

In `test/smoke/aggiemap/environments.json`, production:

- `allowedServiceMetadataFailures`: `baseballParkingUrl/2/objectIdField` and `baseballParkingUrl/2/countQuery`
  (both #2510);
- `allowedPortalRendererFailures`: the three `baseballParkingUrl` entries (#2500).

**Check each one is genuinely clean before deleting it**, by running the spec rather than trusting my
table: `run-local.sh production one service-metadata.spec.ts` and `... one portal-renderers.spec.ts`, read
only. **An entry whose fault is still live must stay** - and say so if you find one, because that would
mean the republish was partial and I have told the maintainer it was complete.

### Then prove production actually draws

The whole point of those issues was a map drawing nothing. **Photograph the baseball maps on production** -
both modes if the builder allows - and confirm:

- the lots draw, and **Event Parking and Reserved are different colours** (that was #2522's complaint: every
  lot the same pale blue);
- the symbols draw;
- **the closures draw**, which they could not while `/2` answered 500.

If any of that is still wrong, **that is the finding and it outranks the cleanup** - say it immediately.

### Prove it

- The two spec runs, quoted, before and after removing the entries.
- The pictures.
- `scripts/check-in-volume.sh <branch> aggiemap-angular` - exit 0.
- No release note: this removes test exceptions and changes nothing a visitor sees.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 18 (aggiemap: #2532, the campuses get the main map's hatch; 28 October 2026, from `work (aggiemap)`)

**#1961 is PR 2531, and the finding is why the batch told you to check the service first.** The field was
fine - 116 of 116 - and the component the issue named **had been unused since #418**, with the layer
drawing a markdown template that cannot hide an empty row. That is the fourth thing this week that looked
like a one-word field fix and was not. You also found three wrong building numbers on the way (#2529).

### What the maintainer has decided

He has seen the vector basemap's construction hatch on dev, is pushing it to production, and says:

> The construction on the satellite campuses needs to be updated to match that used on the main map.

So **[#2532](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2532): Fort Worth
Law School and Houston Space Institute get the hatch**, and the translucent orange wash you built for
#2506 is **replaced, not kept alongside**. Two ways of drawing the same thing is what #2459 spent a day
removing.

You have everything needed already:

| Campus | Hide | Construction features |
| --- | --- | --- |
| Fort Worth Law School | `Construction/1` **and its outline** | `FWLaw/FeatureServer/1` |
| Houston Space Institute | `GIS.FCOR.HSI_Construction/1` **and its outline** | `HSI/FeatureServer/5` |

Use the same `CIMPolygonSymbol` as College Station - black `CIMSolidStroke` first, then the two
`CIMHatchFill`s - so the outline is ours and unbroken, as in batch 10. **If the symbol can be shared rather
than repeated three times, share it**; that is the repository's standing rule and three copies of a symbol
is how the next change gets made in two places.

### The thing to look at honestly

These are **sites**, not building footprints. A hatch across a whole parcel reads heavier than one across a
building, which is why the wash won the first time. **The maintainer has seen both and chosen the hatch**,
so build it - but **frame your captures to show the whole site**, not a corner, so he is judging the real
thing. If at the campuses' opening zoom it reads badly, say so with the picture; that is information, not
disagreement.

### Prove it

- **Before and after for each campus**, at its opening view, with the whole of its construction in frame.
  The "before" is the 25% wash now on `development`, not the old pink.
- **Red first:** the definitions declare the hidden layers and the construction source; the symbol draws
  its own outline.
- All construction features on each campus draw the hatch, not just the one you photograph.
- `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,ts-events-ngx,aggiemap-angular` - exit 0.
- Update #2506's release note rather than adding a second: the campuses' construction is one story.

### Then, separately

[#2533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2533) retakes the two
campus tile images, which still show the **old pink** construction and will be wrong once this lands. **Do
not do it in this batch** - it needs a deployed build carrying #2532, so it follows a release.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 17 (aggiemap: #1961, the restroom popup's empty Building Number; 28 October 2026, from `work (aggiemap)`)

**Batch 16 finished the AggieMap triage.** Across three machines, all 64 AggieMap issues have now been
looked at, and #163 was the right call on the last four: closed what the current UI answers, left #71, #141
and #387 open with what you saw. Not closing an old issue just because it is old is the whole discipline
here, and you held it.

Now a fix, from your own "still wanted" list. copilot-home found it and called it **small**:

> **#1961** restroom popup Building Number always empty. `restroom.component.html` line 4 still reads
> `data.attributes.Bldg_Number`. **What it would take:** read `BldgNum`, hide the row when empty, a text
> test red first.

### Check the service before you change the template

**This is the third time this week a popup looked like a one-word field-name fix.** #657 turned out to be
services returning no geometry (#2520), and #2500 turned out to be a renderer keyed on fields that no
longer exist. So:

1. **Query the Lactation/Family Friendly Restroom service and list its fields.** Confirm the right name -
   `BldgNum`, `Bldg_Number`, something else - and how many of its records actually carry it.
   `lactation-rooms.spec.ts` already asserts that service has every field its popup shows, so it may
   already tell you.
2. **If the field is absent or mostly empty, stop**: that is a data fault, file it as one, and the fix is
   hiding the row rather than renaming it. Say so and do not rename to a field that is also empty.

### Then

- **Read the right field, and hide the row when it is empty.** A popup row with a label and nothing beside
  it is what this issue is about; renaming without hiding would only move the problem to records that
  genuinely have no building number.
- **A test, red first.** The popup renders the building number when the attribute is there, and omits the
  row when it is not. Both cases - a test that only covers the happy path would pass on the current code
  for the second.
- **Before and after screenshots** of the popup, since it is visible.
- `scripts/check-in-volume.sh <branch> aggiemap-ngx-popups,aggiemap-angular` - exit 0.
- A release note entry with its *What to test on dev* row.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 16 (aggiemap: the last four, and #1034's follow-up; 28 October 2026, from `work (aggiemap)`)

**You were right to resist on both of the ones I expected you to close.** I would have closed #1267 on
"everything in the suite relies on the probe now, so it must work" - and your answer, *the cause was never
found*, is the better one. An intermittent fault that was explained away rather than explained is exactly
what bit us with the blank map yesterday.

### Decided

1. **#1267: your option A - keep it open** until the failing-layer test and the `paint.ts` comment fix
   land. Add that to the issue as the condition for closing it, so the next person does not have to
   re-derive why it is still open.
2. **#1034: your option A - close it, and file items 4, 5 and 7 as one follow-up.** The founding work is
   done and the issue should say so; the missing behaviours deserve their own issue with its own title
   rather than keeping a done thing open. File it (Task, `testing`, Priority **Medium** - say so and the
   director will confirm), then close #1034 pointing at it.
3. **Priorities you asked for:** #1005 Medium, #1204 Low. Set them.

### The last four AggieMap issues nobody has triaged

```
#71 #141 #163 #387
```

These are 2020 to 2025 and they are the oldest things in the repository. Same rules as batches 13 and 15.
What I already know, so you do not redo it:

- **#71 *Clear search on Aggie Map mobile*** - I checked: there is **no clear control anywhere in
  `libs/ui-kits/ngx/search`'s templates**. So it is probably still live. What I could not tell from the
  code is whether the mobile UI clears a selected building some other way. **Look at it on dev** rather
  than reasoning about it.
- **#141 *Directions to POI, mismatched spatial references*** - directions are still gated off production,
  and [#1875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1875) fixed a
  neighbouring thing (a click in directions on a projected basemap). Whether *this* one survives, I do not
  know. Note that **#659 means routing fails as soon as directions are requested on dev**, so you may not
  be able to test it end to end - if so, say that rather than guessing.
- **#163 *Features Tab Function*** - "two clicks to close the side-menu", from 2021, on a UI that has been
  rebuilt since. Decide from the current UI, not the screenshot.
- **#387 *Sidebar scrolling breaks dismissal on large layer lists*** - `aggiemap-ngx-ui-mobile`. Still
  exists (34 files). Needs a phone-width look.

**Three of these four need looking at a running map rather than reading code.** That is fine and it is why
they are yours. If one genuinely cannot be settled without the maintainer, say so and leave it - do not
close an old issue just because it is old. **Staleness is not obsolescence**, which is the rule you have
been applying all morning and should keep applying here.

Report as before. Nothing pushed.

## Batch 15 (aggiemap: triage the September-October issues; 28 October 2026, from `work (aggiemap)`)

**Batch 14 was the right call, and the part that matters is the part you did not do.** Your own batch-13
reading said `notes` -> `description` would fix #657. You checked the service first, found both maps return
their lots **with no geometry**, filed #2520, and **declined to make the one-word change on its own** -
because it would have changed nothing visible while looking like a fix. That is exactly the stop rule. The
check is **PR 2525**.

Same job as batch 13, next slice:

```
#954 #959 #960 #962 #967 #1005 #1006 #1027 #1034 #1036 #1202 #1204 #1267
```

Rules are unchanged from batch 13 - **done / obsolete / still wanted / needs the maintainer**, every close
citing the file, commit or live response that proves it, one line on what it would take for anything left
open, no fixing, and no close you are unsure of.

### Four worth knowing before you start

- **#1034 *End-to-end coverage for every map, scheduled against prod and dev*** is the smoke suite's own
  founding issue - `docs/testing.md` names it as "the suite's original plan". The suite exists, runs
  nightly on both environments and has ~830 tests. **Check whether anything it asked for is still missing**
  before closing it; if it is all there, this is a clean close with good evidence.
- **#1267 *The map probe's `ready` is often never true*** - the probe is now relied on by most of the
  suite. If it were still often never true, nothing would pass. Worth checking what changed and closing it
  properly rather than by inference.
- **#1005 *10 layers fail to load on dev because gis-dev is missing them*** - that gap is real and may now
  be **recorded** in `environments.json`'s `allowedLayerFailures` rather than fixed. Recorded is not fixed:
  say which it is.
- **#1202 / #1204 *Remove the event apps / ts-events-angular*** - several apps were deleted in October
  (`signage-angular`, `ues-operations-nest`, the `gisday-competitions` apps, `geoprocessing-v4`). Check
  what is actually gone; batch 13 found "only `ts-events-angular` is left", so #1202 may be done and #1204
  may not.

### One thing to carry over

Batch 13's closes were good because each cited a commit and a line. **Keep that.** A close that cites
nothing is worth less than an open issue with one honest sentence on it.

Report as before: a table of issue, verdict, evidence, and the one-line "what it would take". Nothing
pushed.

## Batch 14 (aggiemap: #657, the NSC popup; 28 October 2026, from `work (aggiemap)`)

**Batch 13 was triage done properly.** Eight closes each citing a commit and a line, sixteen left open with
what each would take, six handed to the maintainer untouched, and **#659 narrowed from "routing stopped
working" to a precise server-side fault** - that last one is worth more than the eight closes, because it
turns an eight-month-old critical issue into a specific ask for someone with GIS server access.

You also spotted this one, so it is yours to finish:

> **#657's NSC half looks like a one-word fix** (`notes` -> `description` in `nsc-parking.definitions.ts`),
> with a popup smoke row to prove it red first.

### What to do

[#657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/657) is *NSC and Break
maps do not have popups*. Fix **the NSC half** if your reading holds up.

1. **Check the service first, not the definition.** Query the NSC parking layer and see which field actually
   carries the popup text. If it is `description`, the one-word change is right. **If the field is missing
   or empty on the service, stop** - that is a data fault like #2500 and #2510, and it needs an issue and
   the GIS team, not a code change.
2. **The Break half too, if it is the same shape.** The issue names both maps. If Break is a different
   fault, say so and leave it - do not stretch one fix over two problems.
3. **Red first, in the smoke suite.** `popup.spec.ts` already checks that clicking a feature opens a popup
   with its data. Add the NSC row, prove it fails against today's `development`, then fix it and watch it
   pass. A one-word fix with no test is indistinguishable from a typo next time somebody tidies that file.
4. Before/after screenshots of the popup, since it is visible.
5. `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` - exit 0.
6. A release note entry with its *What to test on dev* row.

### Why this is worth a batch rather than a drive-by

Every popup on these maps has been empty since at least March, and nobody noticed because **nothing checks
popups per map**. The fix is a word; the check is the point. Treat the check as the deliverable and the word
as incidental.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 13 (aggiemap: triage the older AggieMap issues; 28 October 2026, from `work (aggiemap)`)

**Batch 12 is PR 2518.** Your finding that **every map opens one level closer** is the one that mattered -
it is a real change to what production users see, nobody had noticed it because development has always
looked that way, and it would have been discovered by the team after release. Finding the 3D stand-in's
`aggiemapBasemap(false)` caller, and the `basemapRoots` problem that broke the view-limit test, were both
yours too. The opening zoom is with the maintainer; nothing for you to do unless he picks option B.

### The task

The maintainer wants the 320 open issues worked through and closed one way or another, and has said: *"If
you have questions about one that need me, just move on to the next one."*

**Your slice is the older AggieMap issues**, created between October 2025 and August 2026:

```
#445 #458 #459 #463 #497 #542 #543 #544 #546 #547 #548 #549 #550 #552 #553 #555
#594 #602 #656 #657 #699 #709 #827 #867 #881 #885 #894 #916 #927
```

For each, decide **one** of:

- **Done** - it already works, or a later change made it true. **Close it** (`gh issue close <n> --reason
  completed --comment "..."`), naming **the file, the commit or the service response** that proves it. A
  close that cites evidence is worth having; one that says "looks fine now" is worse than leaving it open.
- **Obsolete** - it describes something that no longer exists. **Close it**, saying what changed.
- **Still wanted** - leave it open and give **one line on what it would take**. That line is the real
  output: it turns a stale wish into something someone can pick up.
- **Needs the maintainer** - leave it open, list it separately, **and do not ask him**.

### Three worth knowing before you start

- **#659 *(aggiemap-backend): Routing stopped working*** is labelled critical and is from March. Directions
  are still gated off production (`directions.spec.ts` checks they appear on dev and never on production),
  so **check what is actually true today** before deciding - this one is more likely to be live than it
  looks.
- **#885 *use feature services from TS portal instead of map services from FAMIS*** was substantially done
  on 27 October, when all ten athletics maps moved to hosted feature views. Check whether anything is left.
- **#881 *basemap is sometimes hard coded*** sits right next to what you have been doing all night. If
  #2515 finished it, say so; if not, say what is still hard-coded.

### What not to do

- **Do not fix anything.** This batch is triage. If you find something that deserves fixing, say so in the
  report with what it would take, and the director will queue it.
- **Do not close an issue you are unsure about.** Leaving it open with one useful line is a better outcome
  than a wrong close, and the maintainer can see both.
- Several of these are **enhancements nobody has asked for since**. Those are still "still wanted" unless
  the thing they propose has become impossible or meaningless - staleness alone is not obsolescence, and
  that judgement is the maintainer's, not ours.

### Report

A table: issue, verdict, the evidence, and the one-line "what it would take" for anything left open. Then
the count closed. **Nothing pushed, no branches.**

## Batch 12 (aggiemap: #2515, the vector basemap becomes production's default; 28 October 2026, from `work (aggiemap)`)

> **The lab found the same check failing on dev, and your rewrite needs to cover it (7:55 AM Central, 28 October).**
>
> Batch 170's release tier on `f2160a189` passed - 829 passed, 4 failed, blank-map check 6 of 6 green,
> Indoor Track 3 of 3 green - and **one of the four failures is new and is ours**:
>
> > the basemap view-limit test can't find the raster basemap since #2508 shares its MapServer
> > (the limit itself still matches, 282)
>
> `services.spec.ts` finds the raster basemap by matching `basemaps.definition.ts`, and **#2508 added the
> construction layer from `FCOR/TAMU_Basemap_20261008/MapServer/2` - the same MapServer as the raster
> basemap** - so the match no longer resolves to one service.
>
> **Your rewrite should fix this, and must be shown to.** Run it against **today's `development`**, which
> has #2508 in it, not against a tree without it: a rewrite that asks every basemap production offers will
> probably resolve it by construction, but "probably" is how the broken one shipped.
>
> **Your 7:33 AM finding is the important one and it decides the limit**: the raster basemap production
> still offers goes white past 1:282, and the maintainer chose option A, so production keeps the raster
> available. **The limit therefore stays at 282** - raising it for the vector basemap would break the very
> basemap we are keeping as the fallback. Put that reasoning in the code comment, because the next person
> to read `AGGIEMAP_BASEMAP_MAX_SCALE = 282` beside a vector basemap that caches to 70 will assume it is
> stale.
>
> The dev build is tagged `dev-2026-10-28`.


**Your #2506 pictures decided it**: the maintainer picked orange at 25%, and the director is rebasing that
branch and opening its pull request - nothing for you to do there.

This is the next release's headline change, and it is yours because you have been in this file all night.
Read [#2515](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2515) in full; it
has the measurements.

### Decided, so do not ask

**The maintainer chose option A for the gallery:** production offers the **vector basemap first and keeps
the raster one available**. Today `aggiemapGalleryBasemaps(isTesting)` returns `[aggiemapBasemap(isTesting)]`
on production - one entry - so production needs a branch of its own returning the vector basemap and then
the plain `AggiemapRasterBasemap` (**not** the dated development variant).

The reason, worth keeping in the code comment: if something is wrong with the vector basemap on production,
one entry leaves a visitor no way out and us no mitigation short of another release.

### The four things that go with the one-line switch

1. **`aggiemapBasemap(isTesting)`** returns the vector basemap in both environments. Its comment currently
   explains why production is the safe default; rewrite it rather than leaving it contradicting the code.
2. **`DEVELOPMENT_ONLY_SERVICES` must drop `Hosted/VTBase3/VectorTileServer`, in this same pull request.**
   That list exists to **fail** when production requests a listed service (#1229), so leaving it turns the
   production run red for precisely the thing we intend. **`Hosted/VTBase/VectorTileServer` stays** - the
   September cache is still development-only.
3. **The view limit.** `AGGIEMAP_BASEMAP_MAX_SCALE = 282` comes from the raster cache, which stops at level
   21. **The vector basemap caches to level 22, scale 70.53** - two levels deeper. Left alone, every view
   still stops at 282 and nobody can zoom to the detail the new default actually has. Raise it, **and make
   `services.spec.ts`'s view-limit test follow the default basemap rather than the raster service**, or it
   keeps passing while asserting about the wrong one.
   - Before changing the number, **look at what the deeper levels actually draw**. If the vector basemap
     turns to mush past 282, say so with a picture and leave the limit where it is - that is a finding, not
     a failure.
4. **A release note entry** with a *What to test on dev* row. This one matters more than most: it is the
   largest visual change production has had in a long time, and the row is what the team works from.

### Prove it

- **Red first** on the gating and gallery: a test that production's gallery offers the vector basemap and
  the raster one, and that `DEVELOPMENT_ONLY_SERVICES` no longer lists VTBase3. Both fail before the change.
- **Pictures, production-shaped**: `run-local.sh local-production` serves the dev server as production would
  behave. Capture the main map before and after, and the gallery panel showing both entries.
- `scripts/check-in-volume.sh <branch> maps-feature-basemap,aggiemap-angular,ts-events-ngx` - exit 0.
- Say explicitly in your report **whether anything other than the basemap changes on a production-shaped
  build**. Nothing should; if something does, that is the thing to report first.

Branch from the latest `development`, which now has #2508. **Do not build on `feat/2506-campus-construction`** -
the director is rebasing it separately and the two must not tangle.

Push to `fork`, report `branch ready:`. No pull request.

## Batch 11 (aggiemap: #2506, the two campus basemaps - two options, as pictures; 28 October 2026, 2:25 AM Central, from `work (aggiemap)`)

**Batch 10 is PR 2508 and the outline reads perfectly.** Your three-way label picture was the right way to
put that question - it turned a judgement call into a one-look decision, and this batch asks for the same
thing again.

**Decided, from batch 10's question:** the label goes to the maintainer as your three variants, with the
director recommending **60% opacity** rather than as-built - it reads cleanly and changes only the opacity,
not the density he chose, which was what your recommendation was protecting. Nothing for you to do unless
he picks it.

### The problem

[#2506](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2506): **Fort Worth Law
School and Houston Space Institute carry the same opaque pink construction tile, on production today.**
Their basemaps are not gated by `isTesting`. Measured from the published sprite sheets:

| Basemap | Construction fill layer | Sprite | Transparent pixels |
| --- | --- | --- | --- |
| `FWLaw` | `Construction/1` | 51 x 47 | **0 of 2397** |
| `HSI` | `GIS.FCOR.HSI_Construction/1` | 44 x 40 | **0 of 1760** |

Same pink, same opaque white ground, as College Station's. The other eight campus basemaps have no
construction fill at all.

### What to build: two options, photographed, not argued

The maintainer decides this from pictures. Build both on one branch, behind nothing clever - whichever he
picks, the other is deleted before the pull request.

**Option A: hide the fill, draw nothing.** Add each basemap's construction fill layer to its
`hiddenStyleLayers`. The building keeps the basemap's own outline and shows the ground beneath. Your
`feat/2459-hide-only` already showed what this looks like on College Station.

**Option B: replace the pattern with a translucent fill, in the basemap's own style.** `setPaintProperties`
on the construction fill layer, swapping `fill-pattern` for a semi-transparent orange `fill-color`.

**Option B is the one I most want to see, and it may be better than what we built for College Station.**
Three reasons it is worth real attention rather than a token try:

- **`setPaintProperties` is proven not to blank.** It was tested on dev earlier today and is a different
  call from `setSpriteSource`, which is the one that races.
- **It lives inside the basemap's own style**, so it draws *under* the outline, the labels and the trees -
  no added layer, and therefore **none of the outline-breaking problem batch 10 had to solve.**
- **It needs no feature source.** Each campus's construction features would otherwise have to be found
  first, which is the expensive part of doing a hatch there.

Its cost is that it is a flat wash rather than a hatch. For a satellite campus that may be entirely fine -
but that is the maintainer's call, from a picture, not ours.

### Prove it

1. **One picture per option, per campus** - four in all - at a zoom where a construction building fills a
   good part of the view, committed to `docs/screenshots/2506-campus-construction/`. Plus a **before** of
   each campus as it is today, so there are six.
2. **A side-by-side for each campus**, the way you built `label-1524-zoom18-variants.png`: before, A, B.
   That image is the deliverable; the rest is supporting.
3. For option B, try **two opacities** and say which you would ship.
4. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0.
5. **Do not open a pull request, and do not merge either option into the #2459 branch.** PR 2508 is open and
   must not move under the maintainer while he is looking at it.

### Watch for

The two campuses are **on production**, so whatever ships here is publicly visible immediately - unlike
#2459, which is development-only. Say in your report whether either option could look *worse* than the pink
to someone who does not know what a construction site is. An outline on grass where a building should be is
the risk with A, and it is worth naming rather than discovering.

## Batch 10 (aggiemap: #2459, the broken outline; 28 October 2026, 1:40 AM Central, from `work (aggiemap)`)

**Your prototype is proven.** The lab measured `feat/2459-hatch-layer` at **0 of 45 blank** against a control
of **9 of 60** in the same interleaved session (report 151). At the control's rate, 45 clean loads in a row
happen about 0.07% of the time, so that is a real result, not a quiet machine. The approach ships.

One defect has to be fixed first, and the lab's 2x crop (`work-lab-leila/reports/2026-10-28-151/zoom-home-aplin.png`)
shows it plainly.

### The hatch draws over the building outline, and the outline reads as dashed

Our hatch is a layer above the whole basemap, so wherever an orange line crosses the black outline it
breaks it. Up close the building edge looks like a dashed line rather than a solid one. The grid also
crosses the building's label (*1524*, *1526*) and the trees inside the footprint. **The published sprite
did not have this problem**, because it lived inside the basemap's own style and drew beneath the outline
and the labels.

**You cannot fix this by reordering.** A vector tile basemap is one layer: anything we add draws either
entirely above it or entirely below it, and below means the basemap's own ground fill covers us. Above is
forced. So the outline has to become *ours*.

### What to do

1. **Hide the basemap's construction outline too** - `Campus Structures/Currently Under Construction/0`,
   the `line` layer at `#000000`, alongside the fill you already hide. Your `hiddenStyleLayers` list takes
   it without a code change.
2. **Draw the outline in our own symbol, above the hatch.** The `CIMPolygonSymbol` takes a stroke as well
   as its two `CIMHatchFill`s; ordered after them it draws a solid black edge over the grid, which is what
   the sprite achieved by being underneath. Match the basemap's line: `#000000`, 1.33 px.
3. **Then look at the label.** With the outline solid, judge whether *1524* still reads under the grid at
   zoom 17 and 18. If it does, leave it - a construction site with a hatch over its number is not wrong. If
   it does not, say so and propose something (thinner strokes, or partial transparency on the hatch); do
   not guess at a value without showing it.
4. Trees inside the footprint being crossed is **fine**. It is a building site, and arguing it either way
   without the maintainer is not worth a cycle.

### Prove it

- **A 2x crop of 1524 matching the lab's**, committed beside your other pictures, so the two can be put
  side by side. The outline must read as one continuous line.
- Zoom 17 and 18 again if the label work changes anything.
- `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0.
- Keep everything from batch 9: the deleted sprite override, the tests, the release note with its #2506
  caveat.

### One more thing, and it is not optional

**The lab measured `337047b1e`; your branch is now `f1aa31ca9`.** Deleting the sprite override can only
make blanking less likely, so I am not asking for the full 45 again - but **say in your report which commit
the 0 of 45 was taken on**, and do not let the pull request imply the final commit was the one measured.
The lab will take one confirming block on the final commit.

Push to `fork`, report `branch ready:` with the commit. The director opens the pull request.

## Batch 9 (aggiemap: #2459, make the no-sprite hatch shippable, and show it at real zooms; 27 October 2026, 11:50 PM Central, from `work (aggiemap)`)

**Your prototype is the answer and it is going to ship.** The maintainer has seen `prototype-1524` and
`control-1524` side by side. This batch turns the prototype into a pull request and answers the one
question the picture cannot: whether the hatch is the right density at the zooms people actually use.

Do not wait for the lab. They are measuring `feat/2459-hatch-layer` and `feat/2459-hide-only` on the rig
that reproduces the blanking; if they find something, it changes the mechanism, not the work below. Build
on `cb1ea9c8b`.

### Task 1, first and quickest: the density, at the zooms people use

**Capture building 1524 and 8711 at zoom 15, 16, 17 and 18**, prototype only, and commit them to
`docs/screenshots/2459-construction-hatch/` with obvious names. Then **say in your report which density you
would ship and why.**

This is the maintainer's open question and it is worth more to him tonight than the pull request. The
current symbol is two `CIMHatchFill`s 12 pt apart with 1.5 pt strokes, chosen to match the sprite's grid.
At the zoom the pictures were taken the grid reads fine; at zoom 15 it may read as a wash, which is the
whole complaint being fixed. **Push these and name them in `STATUS.md` as soon as they exist**, before
starting task 2 - the maintainer may be looking.

If one density cannot serve every zoom, say so plainly and propose what should happen instead; a
scale-dependent symbol is a real option and naming it is better than shipping a compromise silently.

> **Note from `work (aggiemap)`, 12:55 AM Central, 28 October: #2506, and it affects how you build this.**
>
> College Station is not the only basemap with a pink construction fill. Read from each basemap's own
> `resources/styles/root.json` tonight:
>
> | Basemap | Used by | Construction fill layer |
> | --- | --- | --- |
> | `VTBase3` | College Station, development only | `Campus Structures/Currently Under Construction/1` |
> | `FWLaw` | **Fort Worth Law School, production** | `Construction/1` |
> | `HSI` | **Houston Space Institute, production** | `GIS.FCOR.HSI_Construction/1` |
>
> The other eight campus basemaps have none. **The campus basemaps are not gated by `isTesting`**, so those
> two draw the pink hatch on production today.
>
> **What this changes for you: nothing you must do, but one thing you must not do.** Keep building the
> College Station fix - that is still the batch. But **build it so a second and third basemap can use it
> without being rewritten**: the hidden style layer and the construction source belong to the *basemap
> definition*, not baked into one place that assumes College Station's layer id and College Station's
> feature service. Your `hiddenStyleLayers` list is already shaped right; make sure the construction layer
> is declared the same way rather than hard-coded beside it.
>
> **Do not add the two campuses in this pull request.** They are #2506 and the maintainer has to choose
> between drawing the hatch there too and simply hiding the fill (your `feat/2459-hide-only` is exactly
> that experiment, which is now worth more than it looked).
>
> **And say so in your pull request**: that this fixes College Station and that Fort Worth Law and Houston
> Space Institute keep the pink until #2506. "The construction symbology is fixed" must not be read as true
> when it is not yet true for two maps the public can open.


### Task 2: the change itself

Take the three `PROTOTYPE (#2459)` changes to something reviewable:

- **`hiddenStyleLayers` on `makeBaseLayer`** stays - it is a style call, it never touches the sprite sheet,
  and it is the half that removes the pink. Document in the code *why* `.../1` is hidden and `.../0` is not.
- **The construction feature layer** stays, with its CIM hatch. It is a base layer of the vector basemap, so
  it draws only where that basemap does, which is right.
- **The sprite override goes.** Do not leave `SPRITE_OVERRIDES_ENABLED = false` behind as a dead switch.
  Delete `vector-tile-sprites.ts`, its `spriteOverrides` definition entry and its call site, and say in the
  pull request that it is deleted rather than disabled. It blanks the map about one load in four, and your
  own report found it applying at 8711 and not at 1524 **in the same session** - it is a race, not a feature
  anyone should be able to switch back on by accident. Keep its unit tests only if they still test something
  that exists.
- `BaseMapProperties.baseLayers` becoming an array is a real interface change; make sure every caller and
  every definition still typechecks, and note it in the pull request so a reviewer looks at it.

### Prove it

1. **A test that fails first.** The honest one: the basemap definition declares a construction layer and
   names `Campus Structures/Currently Under Construction/1` as hidden, and `makeBaseLayer` hides what it is
   given and builds a `FeatureLayer` when asked. Red against the unmodified code, then green.
2. `scripts/check-in-volume.sh <branch> maps-esri,maps-feature-basemap,aggiemap-angular` - exit 0, quoted.
3. **All eight construction buildings draw the hatch**, not only the two you photographed. A query against
   `FCOR/TAMU_Basemap_20261008/MapServer/2` for `Type = 'CONSTRUCTION'` gives the list; checking them is
   cheap and a renderer that works on two is not evidence.
4. **Before and after at the same view**, committed, for the pull request and the release note. You have
   `control-1524`; the before must be today's `development` as served, pink.
5. A release note entry, `docs/releases/unreleased/2459-construction-hatch.md`. **It was deleted tonight by
   PR 2503** because it described something that had been reverted - so write it fresh, and have it describe
   what this change actually does.

Push to `fork`, report `branch ready: <name>` with the exact commit. **Do not open the pull request**; the
director does that once the lab's measurement is in.

### Questions

End of the report, with options and a recommendation, and keep working. Do not wait on any of them.

## Batch 8 (aggiemap: #2459 the hatch as a layer instead of a sprite; 27 October 2026, about 10:10 PM Central, from `work (aggiemap)`)

> **Note from `work (aggiemap)`, 11:34 PM Central, 27 October.** **Push the prototype branch to the fork now,
> before anything else.** work-lab-leila has been waiting on it since 11:27 PM and is measuring filler in the
> meantime; `git ls-remote fork` shows nothing and your status names no branch. Push whatever state it is in,
> even unfinished, write the branch name and commit in `STATUS.md`, and then carry on - the lab's rig is the
> one that reproduces the blanking, so your prototype has to reach it to be worth anything.
>
> Also **commit the picture and name it in `STATUS.md`**: your 11:07 PM note says 1524 draws with an orange
> grid hatch, grass between the lines and a black outline, and that image is the only proof anyone has that
> the no-sprite approach works. `docs/screenshots/2459-construction-hatch/`, on the branch. The maintainer has
> said he will not accept "done" without an image, so a screenshot that is only on your disk is worth nothing.
>
> **Your 0 of 15 on the control does not contradict the lab, and is not yours to chase.** They reproduce the
> blanking and you do not; that difference is one line in your report, not an investigation. Your job is the
> alternative that uses no sprite at all, and on tonight's evidence it is the one that is going to ship.


**Overnight.** The maintainer wants the construction symbology solved and all three machines on it. Yours
is the alternative that does not touch sprites at all.

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

**Draw the hatch as a layer instead of a sprite, and see whether it blanks anything.**

#2459 listed this as option D and it was never tried. The under-construction buildings are queryable:
`FCOR/TAMU_Basemap_20261008/MapServer/2`, `Type = 'CONSTRUCTION'`, which supports `Query`. A `FeatureLayer`
with a `CIMSymbol` using `CIMHatchFill` draws a real hatch - rotation, spacing and colour as wanted - with
no sprite sheet, no `setSpriteSource`, and nothing touching the basemap's own rendering.

1. **Prototype it** on a branch: the layer, the CIM hatch in orange, drawn over the vector basemap, with
   the basemap's own construction fill left exactly as published.
2. **Measure it the same way the lab did** - 15 plain loads of `/map/d`, blank meaning 100% white for 30
   seconds - so the number is comparable. If it blanks 0 of 15 and draws the hatch, that is the answer.
3. **Say what it costs**: an extra service query on every map load, a production-server layer under a
   development-only basemap, and whether the two datasets agree about which buildings are under
   construction.

A prototype that works is worth more tonight than a tidy one. If it blanks too, say so - that would mean
the fault is not in sprites at all, which changes everything.

### Added 10:35 PM: the maintainer's framing, and the two halves of this

The maintainer: *"Do we have to use a sprite? Can't we just draw the features ourselves and symbolize it
ourselves?"* That is this batch, and he is right that it sidesteps the whole problem. **The GIS team
cannot fix the published sprite and the front end has promised to fix this**, so "ask them to republish"
is not available. The hatch is the last thing holding the vector basemap back from production.

There are **two halves**, and only one of them is the drawing:

**1. Hide the basemap's own construction fill - and this is safe.** The style layer is
`Campus Structures/Currently Under Construction/1`. It is turned off with **`setPaintProperties`**, which
is a different API from `setSpriteSource` and **does not blank the map**: it was called on dev today
(`setPaintProperties(id, { 'fill-pattern': id })`) and the map stayed drawn. `setStyleLayerVisibility`
is the other candidate. Measure it on its own first - 15 plain loads, blank meaning 100% white for 30
seconds - so you know the half that hides the pink is free before you build the half that draws.

Leave the outline layer `.../Currently Under Construction/0` alone: a black outline is wanted, and it is
not a sprite.

**2. Draw the buildings ourselves, as an ordinary layer.** The vector tiles are not queryable, but the
same buildings are: `FCOR/TAMU_Basemap_20261008/MapServer/2` supports `Query`, and
`Type = 'CONSTRUCTION'` selects them - eight buildings today, Aplin Center (1524) among them. A
`FeatureLayer` with a `CIMSymbol` using `CIMHatchFill` gives a real hatch at whatever angle, spacing and
colour we choose, with no sheet, no sprite, and nothing reaching into the basemap's renderer.

Orange, as the maintainer settled this afternoon. He also chose the density on the sprite version - lines
16 apart, 2 wide, about a quarter covered - so start there and it will look familiar.

### What would make this the answer

- **0 of 15 blank loads**, the same measurement the lab used, so it is comparable.
- **A picture of 1524 drawn with an orange hatch and the grass showing between the lines.**

Both, not either. One screenshot of it working is not enough any more - there have been two of those
today, each true at that instant and wrong overall.

### Worth saying if you find it

Whether the two datasets agree on which buildings are under construction. The basemap tiles were cooked
from this same source, so they should - but "should" is what went wrong all day.

### Don't

Merge anything, or change the basemap definition's existing `spriteOverrides`.


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

## Read this first: you are a worker now, for AggieMap too (26 October 2026, 3:35 PM Central)

**The maintainer has moved AggieMap's director role to `work`.** `DIRECTOR.md` says so. You held it from
5:25 PM on 25 October and queued batch 152; thank you for it, and **stop writing
`work-lab-leila/TASKS.md` for AggieMap from now on** - `work (aggiemap)` writes it. You already take
batches from `work (security)` and that does not change.

**Nothing of yours is dropped.** Batch 152's release tier on Release-494 is read and used: its 12
failures are recorded below so nobody re-derives them.

- 750 tests, 676 passed, 12 failed, 3 flaky, 59 skipped, on `392be39db`.
- The 12 were #2209's eight, the two indoor-track layer-order loads, and the raster-basemap test
  (#2351, which fails on production too). None came from that release.
- **#2209's eight are now fixed** by PR 2429, merged this afternoon and on dev in Release-495. The quick
  tier on that build is lab batch 156, queued by `work (aggiemap)` - that is the run that will say
  whether the fix worked, so expect those eight to change.

**What to do:** keep your watcher running, take batches from this file as before, and put any AggieMap
question in your report under **Questions for the director (aggiemap)** rather than acting on it.

## Batch 7 (workspace: #2498 - check-in-volume.sh takes its memory and parallel limits from the environment; a branch; 27 October 2026, about 8:05 PM Central, from `work (gisday)`)

After batch 6. About 40 minutes. Questions go to `work (gisday)`. The maintainer chose this machine for it (not copilot-home, whose
memory problem it is about).

[#2498](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2498) says what and why.

1. Branch `chore/2498-check-memory-env` from the latest `origin/development`.
2. `scripts/check-in-volume.sh`: read `CHECK_MEMORY` (default `16g`) for the container's `-m` and `CHECK_PARALLEL` (default `8`)
   for Nx's `--parallel`; print both near the top of the log. Nothing else changes.
3. **Red first:** extend `scripts/check-in-volume.test.sh` (defaults used when unset; an override honoured; a non-number
   `CHECK_PARALLEL` refused with a clear message). Prove it red, then green: `bash scripts/check-in-volume.test.sh`.
4. CLAUDE.md, where the script is described: one sentence naming both variables and their defaults.
5. `scripts/check-in-volume.sh chore/2498-check-memory-env` (the stock defaults) must exit 0, and say so. Commit with
   `Closes #2498`; push to the fork (`danielgoldbergtamu`).

Report `home/reports/<yyyy-mm-dd>-<n>.md`: branch and head, red then green, the check's exit code. The director opens the pull
request.

---

## Batch 6 (aggiemap: #2472 the dev server stalls at the dependency optimizer; 27 October 2026, about 1:50 PM Central, from `work (aggiemap)`)

**Not critical**, and an investigation rather than a fix. The maintainer: *"If they can make it in by the time
we finish with the campus maps, they can be included for the dev release. If not, we do later."* An answer is
worth more here than a rushed patch. Questions go to `work (aggiemap)`.

[#2472](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2472), from your own batch 5
report and copilot-home's batch 29: the AggieMap dev server answers on 4200, the log stops at
`[optimizer] bundling dependencies...`, and it makes no progress for over ten minutes at about 100% CPU -
**with `UV_THREADPOOL_SIZE=64` set and a fresh `node_modules` volume**. That is the symptom
[#1955](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1955) closed, with its fix
already applied, so either the fix is incomplete or there is a second cause wearing the same face.

It cost two machines their before/after captures today; both fell back to a production build served by
`serve-dist.js`. CLAUDE.md budgets fifteen minutes from cause to pull request for a bug fix, and this breaks
that budget every time it happens.

### What is wanted

**An answer, not necessarily a fix.** Does it reproduce on demand, and what makes the difference? Things worth
varying, in rough order of suspicion:

1. **`--poll=2000`.** #1955's cause was polling starving the thread pool. Does the stall go away without
   polling, and does the server still see edits from Windows if it does?
2. **The second volume.** Both machines were using a volume other than `tamu-js-dev-nm` (`tamu-js-b159-nm`,
   `tamu-js-2453-nm`), because the shared one was stale and `gisday-api` holds it. Whether that matters is
   unknown and worth one controlled run either way.
3. **`UV_THREADPOOL_SIZE` higher still**, and whether the number that works depends on the machine's CPU count -
   you and the lab have very different machines, which is useful here rather than a nuisance.
4. **Which dependency it is stuck on.** The optimizer names what it is bundling at higher log levels; a single
   package would turn this from a mystery into a pin.

Report what reproduces it and what does not, with the commands. If a one-line fix falls out, take it, with a
red-first demonstration that the stall happens without it - but do not invent one to close the issue.

Nothing to push unless there is a fix. Say **"report ready: &lt;file&gt;"** either way.

### Don't touch

`check/2026-10-27-batch`, and anything campus-related: a change making every campus map visible on production is
being written now.

## Batch 5 (aggiemap: #2453 Megan's baseball republish - the blocking issue for today's release; 27 October 2026, about 12:50 PM Central, from `work (aggiemap)`)

**Urgent, and it blocks a production release today.** The maintainer abandoned the dev build now deployed
because of this; the next dev build fixes it and goes to production today. Questions go to
`work (aggiemap)`.

[#2453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2453), filed by
`meganmcmullen-rgb` this morning: *"New republish of baseball threw off our maps for parking/accessible
parking."* What she asks for, in her words:

1. *"Baseball parking map should have all layers (and lots, right now 100j is missing) except the
   accessible shuttle route"*
2. *"Baseball accessible should have all layers, including the accessible shuttle route, which should be
   on top of the parking lots"*

and her symptoms: *"Accessible baseball parking is missing icons, has lots doubled, and the shuttle under
the reserved 100j lot."*

### The cause, already traced - do not re-derive it

Everything is in **`libs/ts/events/ngx/src/lib/definitions/baseball-parking.definitions.ts`**, in
`BaseballParking_DevelopmentLayerSources`. Measured against the live development service
(`gis.dev.tamu.edu/.../Hosted/BaseballParking_view/FeatureServer`) at 12:45 PM Central today:

- **`/3 Baseball Event Parking Lots` holds 10 lots**: 8 with `type = 'Event Parking'` and **2 with
  `type = 'Reserved'` - Lot 100j and Lot 102**.
- `EVENT_LOTS`'s development source passes `onlyType: 'Event Parking'`, so the parking map draws 8 of the
  10. **That is Megan's missing 100j.**
- **`/0 Baseball Symbols` has no `type` field and no `event` field** on development - it carries the generic
  marker schema (`name`, `description`, `category_type` and so on). That is why the development source list
  has only one symbols layer, and the file's comment says so.
- But `BaseballParkingOptions` still names `ACCESSIBLE_SYMBOLS`, and it turns `EVENT_SYMBOLS` **off** in
  accessible mode. So on development the accessible map hides the only symbols layer that exists and shows
  one that does not. **That is Megan's missing icons.**
- In `BaseballParking_DevelopmentLayerSources`, `ACCESSIBLE_SHUTTLES` is declared **before** `EVENT_LOTS`
  and `ACCESSIBLE_LOTS`, so the lots draw over it. **That is Megan's shuttle under the 100j lot.**
- `EVENT_LOTS` is visible in **both** modes while `ACCESSIBLE_LOTS` is visible in accessible mode. Once
  `EVENT_LOTS` carries all ten, the two Reserved lots are drawn by both. **That is Megan's doubled lots,
  and fixing the first point alone makes it worse.**

### What to do

Four changes in that one file, then prove them:

1. `EVENT_LOTS`'s development source: **drop `onlyType`** so it draws all ten lots.
2. **Add an `ACCESSIBLE_SYMBOLS` development source** from `/0`, unfiltered, the same as `EVENT_SYMBOLS` -
   the layer has nothing to split on. Replace the file's comment that says the two "become one", because
   that is what broke it.
3. **Move `ACCESSIBLE_SHUTTLES` after both lots layers** in the array, so the shuttle draws on top.
4. **Hide `ACCESSIBLE_LOTS` in both modes** on development, since `EVENT_LOTS` now carries every lot. Keep
   the layer declared - production still uses it.

**Say in the report whether the parking map now excludes the shuttle route** (Megan's point 1): the option
already sets `ACCESSIBLE_SHUTTLES` invisible in event mode, so it should, but it needs looking at rather
than assuming.

### The thing to report and not act on

**The production side of this file is a separate problem and it lands today.**
`BaseballParkingColdLayerSources` filters on `baseball IN ('AnyValid','SeasonPass')`, `baseball = 'Permit'`
and `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'` - columns the republished development
service does not have. Ten athletics definitions carry this fork. When the production services are
republished to match development, **every one of those production filters stops matching**. Do not change
them in this batch; say in your report what you see, so the director can put it to the maintainer.

### Proving it

- **Red first.** `libs/ts/events/ngx/src/lib/definitions/baseball-parking.lots.spec.ts` does not exist, but
  `football-parking.lots.spec.ts` does and is the model. Write a spec that fails on the unfixed definitions
  for the lot count and the accessible symbols source, then passes. Every bug gets a test (CLAUDE.md).
- `scripts/check-in-volume.sh fix/2453-baseball-republish ts-events-ngx,aggiemap-angular`. Per-target counts
  and the exit code.
- **Before and after**, on the dev server against this branch, 1280 x 900, `timezoneId: 'America/Chicago'`:
  the Baseball Event Map and the Accessible Baseball Map, each before and after. The after shots must show
  Lot 100j on the parking map, icons on the accessible map, the shuttle drawn over the lots, and no doubled
  lot. Commit to `docs/screenshots/2453-baseball-republish/`.
- One release-note file `docs/releases/unreleased/2453-baseball-republish.md` with its *What to test on dev*
  row. **Do not edit `unreleased.md`** ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)).
- `docs/testing.md`: no row, no number change - this adds a unit spec, not a smoke spec.

Branch `fix/2453-baseball-republish` from `origin/development`, push to the fork, and say
**"branch ready: fix/2453-baseball-republish"**. I open the pull request.

### Don't touch

`fix/2459-construction-hatch` (work-lab-leila batch 160), `feat/2455-2457-2464-four-campuses` (copilot-home
batch 29), and the other nine athletics definition files.

## Batch 4 (security: #2425 - push the clean branch under a new name; 26 October 2026, about 3:40 PM Central, from `work (security)`)

**Start now. A few minutes.** Your batch 3 question 1: **the maintainer chose B** (26 October). Push your rewritten branch
(`34e42dae3`, then `160f65e80`) to `fork` as a **new** branch, `chore/2425-api-images-non-root-2`. No force-push. Read it back
with `git ls-remote fork` and put the commit in a short report, `home/reports/2026-10-26-4.md`, then push `home: batch 4 done - ...`.
The director deletes the old `chore/2425-api-images-non-root` from the fork once the new one is there, and opens the PR.
Thank you for catching the cluster details yourself.

## Batch 3 (security: #2425 - run the four API images as `node`, not root; a branch; 26 October 2026, 11:48 AM Central, from `work (security)`)

**Start now. About 1.5 hours.** The maintainer decided (26 October, Priority Medium): the API images stop running as root.
`apps/{gisday-nest,geoservices-nest,mailroom-nest,mailroom-helper-nest}/src/Dockerfile` set no `USER` in their
`node:24.22.1-alpine` runtime stage. The image already has the `node` user (uid 1000).

1. Branch `chore/2425-api-images-non-root` from the latest `origin/development`, pushed to `fork`.
2. In each runtime stage add `USER node` after the copies, with `COPY --chown=node:node` (or a `mkdir` and `chown`) for
   every folder the API writes at run time. Find those first: `git grep` the API and its libraries for `writeFile`,
   `createWriteStream`, `mkdir`, `multer` and `diskStorage`, upload or photo folders, and any `/tmp` or log path. List them in the report.
3. Build each image as `publish.yml` builds it, before and after. Show `docker inspect --format '{{.Config.User}}'` (empty before,
   `node` after) and `docker run --rm --entrypoint id <image>`.
4. Prove each one runs as `node`:
   - **gisday-nest:** on the GIS Day stack as in batch 2, start it and do every write it does, as far as you can without signing in
     on the Auth0 page (call `fitImage`, or the storage code directly, as in batch 2). The log must show no `EACCES` or `EPERM`.
   - **mailroom-nest, mailroom-helper-nest, geoservices-nest:** start each against what it needs (a SQL Server container is
     fine) and show that it stays up, with no permission errors.
5. **Read the cluster's deployments** in `C:\TAMU\kubernetes-config` (read only; change nothing there). For each API, note any
   volume mounted where it writes, and whether it needs `securityContext.fsGroup: 1000` or `runAsUser` to keep writing. That
   change is the maintainer's, so write it up as a list in the report.
6. `bash scripts/check-in-volume.sh <branch>` must exit 0. Add a `.pr-body.md` draft as the last commit. Report
   `home/reports/2026-10-26-3.md`, then push `home: batch 3 done - ...`. No PR (the director opens it).



## Batch 2 (security: prove the zod 4.6.6 override for jimp on branch chore/override-zod; 26 October 2026, about 7:30 AM Central, from `work (security)`)

**Start now. About 40 minutes.** The maintainer chose (26 October) to force `zod` 4.6.6 under `@jimp/types` and
`@jimp/plugin-resize` (jimp 1.6.1 asks for zod ^3, which has an unfixed High, GHSA-mrhx-c7xc-m3w5). jimp resizes GIS Day
speaker photos (PR 2382, `libs/common/node/images`), so **resizing must still work**.

Branch: `chore/override-zod` on the `fork` remote (danielgoldbergtamu), commit `29d2e1bc920409b4027f3ae58493e19d57e0c6a7`.

1. `bash scripts/check-in-volume.sh chore/override-zod` (full check, clean `npm ci`). Record the exit code; the
   `common-node-images` tests (`fit-image.spec.ts`, `image-size.spec.ts`) must pass.
2. Run the GIS Day stack locally from that commit (`scripts/gisday-local.sh`, `docs/gisday-local.md`) and, as the admin,
   upload a speaker photo three ways: a large JPEG taken on a phone (EXIF orientation), a PNG, and one already small. Each
   must save, be resized as before and show on the speaker page. Look in the API log for any `zod` or `ZodError`.
3. The same uploads on `origin/development`, so any difference is the override's. Save before/after captures under
   `docs/screenshots/override-zod/` in a branch of your own only if something differs; otherwise say so.
4. Report `home/reports/2026-10-26-2.md`, push `home: batch 2 done - ...`. No PR (the director opens it).


## Batch 1 (security: a check that the new Home - Work Listener chat answers; read only; 26 October 2026, about 7:25 AM Central, from `work (security)`)

The maintainer wants to see you respond before he leaves for the day. Short, read only, no branch.

1. Push `home: started batch 1` to `home/STATUS.md`, with `tools/heartbeat.sh home "running batch 1" 30`.
2. In a worktree at the latest `origin/development`, run the security-findings tests in a `node:24.22.1` container:
   `node --test tools/security-findings/` (the same tests `tools-tests.yml` runs). Record the pass and fail counts.
   **Correction, 6:58 AM:** that directory form reports 1 failure on Node 24 because it treats the folder as a file. Name the
   files instead: `node --test tools/security-findings/findings.test.mjs tools/security-findings/install-scripts.test.mjs`
   (18 pass on `be9581cdc`).
3. Run `bash tools/roster.sh` on `work-mailbox` and paste its table into the report.
4. Write `home/reports/2026-10-26-1.md` with the commit of `development` you used, the test counts and the table. Push
   `home: batch 1 done - <counts>`, then `tools/heartbeat.sh home idle 45`.

Batches here are numbered from now on.

## Decided (23 October 2026)

- From 23 October, all security and vulnerability work in this repository belongs to the security chat on the work
  machine ('js.monorepo - Security - CSA 305 Desktop'). That covers #2111 and everything under it, #2112 to #2120,
  #2135, Dependabot, CodeQL and secret-scanning alerts, and base-image updates. Don't put any of it in a batch for any
  machine. If you find something, file the issue with every field, write 'for the security chat' in your report, and
  leave it unfixed.
- Directors send work to an idle listener whenever one can do it, the lab first: see "The director" in `DIRECTOR.md`.

## Withdrawn (23 October 2026, 10:00 AM Central): both GIS Day batches below

The maintainer could not start home today, so the work machine is doing both itself: the #1474 focus photos and
#2142. **Do neither.** They stay below only as a record. Nothing for GIS Day is waiting on home.

## Batch (gisday: #1474 keyboard focus photos) - 23 October 2026, 9:05 AM Central

From the GIS Day director (work). Sent here because `work` is saturated by the security chat's check and the lab is
on batch 17. About 40 minutes.

Branch `fix/1474-gisday-template-a11y` on the fork, at `9948dd977` (your `85df2be00` plus the release-notes entry
`docs/releases/unreleased/1474-gisday-accessibility.md`). Before its pull request it needs the before/after photos you
named in your handover.

### What to do

1. Run the local GIS Day stack (`scripts/gisday-local.sh`, `docs/gisday-local.md`), once from `origin/development`
   (before) and once from the branch at `9948dd977` (after). `web --static` is not merged yet; use the dev server, or
   build `--configuration local` and serve it as you did before. **Never a `--configuration=production` build before
   the photos**: it overwrites the local dist and sign-in fails.
2. With the keyboard only (Tab, then Enter or Space), photograph at 1280 wide, before and after:
   - the header's **Login**, focused;
   - a **FAQ** question, focused, then opened with Enter;
   - signed in as the test admin, **Admin, then Events**: a row's action buttons, focused;
   - a season's **day tile** (add or remove), focused.
   "Before" is whatever Tab reaches instead. Say so in the report, with what `document.activeElement` was.
3. Save each as it is taken to `docs/screenshots/1474-gisday-accessibility/before-<what>.png` and
   `after-<what>.png` on the branch. Add them as a before/after table to the release-notes entry (paths
   `../screenshots/1474-gisday-accessibility/<file>.png`), and change its "Nothing looks different" to say that only
   the focus outline shows. Run `node scripts/collate-release-notes.mjs --check`.
4. Commit on the branch, check the line endings are LF, and push to the fork.

### Then

Report `home/reports/2026-10-23-1.md`: the new head commit, each file, what Tab reached before. Say "work report
ready". Do not open the pull request; the director does. Nothing on GitHub.

## Batch (gisday: #2142 the Texas A&M site shows only Texas A&M's events) - 23 October 2026, 9:50 AM Central

From the GIS Day director (work). **Start it after the #1474 batch above is pushed.** High priority: GIS Day is 17 to
20 November. Development, so it is yours.

[#2142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2142) says what and why; read it
first. **Decided by the maintainer:** an event belongs to Texas A&M's GIS Day by its place (event → location → place).
No new field on events. txgisday.org keeps listing everything.

### What to do

1. Branch `feat/2142-gisday-tamu-events` from the latest `origin/development`, in its own worktree.
2. Work out how a place is marked as Texas A&M's, choosing between a list in the `tamu` site's definition
   (`libs/gisday/common/src/lib/sites.ts`) and a field on the place. Prefer the one that needs no schema change.
   Say in the report which, and why.
3. **Take the "before" photo first**, of the local Sessions page served as the `tamu` site
   (`scripts/gisday-local.sh web --site tamu`), into `docs/screenshots/2142-gisday-tamu-events/before-sessions.png`.
4. Write the tests first and prove them red against the unchanged code. On the `tamu` site, an event at another
   school's place is not listed and one at a Texas A&M place is; on txgisday.org, both are listed. Then make them
   green. Cover every place events are listed: Sessions, the home page's schedule, and any other.
5. Count the events in the local database with no location or place. Those are the ones the `tamu` site would stop
   showing.
6. Take the "after" photo; add the release-notes entry `docs/releases/unreleased/2142-gisday-tamu-events.md` with
   both photos and a What to test row. Run `node scripts/collate-release-notes.mjs --check`.
7. Commit, then `scripts/check-in-volume.sh feat/2142-gisday-tamu-events`. It must exit 0, including the
   `gisday-angular` production build, which checks the bundle budgets. Take that build only after the photos,
   because it overwrites the local dist. Push to the fork.

### Then

Report `home/reports/2026-10-23-2.md`: the branch and head commit, the choice from step 2, red then green test
output, the check's exit code and time, the event count from step 5. Put any questions under **Questions for the
home session**, addressed to the GIS Day director, with options and a recommendation. Do not open the pull request;
the director does. Nothing on GitHub.

## Batch (22 October 2026, 12:05 PM Central) - watch Azure for the production deploy

The maintainer approved the production release and it is rolling out now. **This machine is the only one
with Azure access**: `az-releases.py` and the token are here, and neither `work` nor `work-lab-leila` has
them.

### What to do

1. **Poll Azure** until the release reaches **production**, then report in your `STATUS.md`:
   - the **release number**,
   - the **commit** it carries, in full,
   - the time it succeeded, in US Central.
2. **Push it as soon as you have it.** Three things wait on that commit: the `prod-*` tag, the production
   release tier, and closing
   [#1778](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1778) for the team.
3. **Say the commit even if it is not the one anyone expects.** The build was expected to carry
   `36b962a04` - the three GIS Day changes on top of the tested `61161ce1b` - but what matters is what
   Azure says actually shipped, not what was meant to. The `prod-*` tag goes on what shipped, which is
   what makes "we shipped what we tested" a fact rather than an assumption.

**Never read the build from a bundle name.** Each stage bakes its own analytics id in, so one commit gives
different bundle hashes on dev and production. Azure is the only thing that answers "which commit", which
is why this is yours and not the testing machines'.

### Then

Back to listening.

## Batch (21 October 2026, 9:30 AM Central) — watch Azure and name the commit that reaches dev

The maintainer is deploying the latest dev build to the dev environment now. **Two builds were in play
this morning** — `67e95b4b1`, and `61161ce1b` which adds #1969's lot-link fix (PR 2064) — so nobody
should assume which one lands.

`work-lab-leila` has the release tier queued and is **held** until the commit is named. It cannot read
Azure: no Python, no script, no token. Those are on this machine, which is why this is yours.

### What to do

1. **Poll Azure** with `C:\TAMU\logs\az-releases.py` until a release reaches **dev**, then report, in
   your `STATUS.md` and plainly:
   - the **release number**,
   - the **commit** it carries, in full,
   - the **environment**, and the time in US Central.
2. **Push that the moment you have it.** The lab machine is watching the branch and starts a
   thirty-minute tier on it; every minute it waits is a minute off a release that carries dates for a
   season starting 2 November.
3. **If the commit is neither of the two above, say so and stop.** That would mean something was built
   that nobody here expects, and a tier against it clears nothing.

**Never identify the build by bundle name.** Each stage bakes its own analytics id in, so one commit
produces different bundle hashes on dev and production. Azure is the only thing that answers "which
commit".

### Then

Back to listening. The tier is the lab machine's; the release notes are the work machine's.

## Batch (21 October 2026, 8:55 AM Central) — read Azure and say when today's build is on dev

Small, and two machines are waiting on it.

**`work-lab-leila` has the release tier for today's build (its batch 8) and cannot start it**, because it
cannot identify which commit dev is serving. It has no Python, no `C:\TAMU\logs\az-releases.py` and no
Azure token. **Neither does the work machine** — I looked. Those are on *this* machine, and the handover
named the path without naming the machine, which is why two machines went hunting for it.

### What to do

1. **Read Azure** with your `az-releases.py` and say whether a release carrying **`67e95b4b1`** has reached
   **dev**, and what the release number is.
2. **Push that to your `STATUS.md`** as soon as you have it — `work-lab-leila` is watching the branch and
   starts its tier on it. Say it plainly: the release number, the commit, and the environment.
3. If the build has not finished yet, say so and say what the newest dev release *is*, so nobody tests the
   previous one by accident.

**Do not read it from a bundle name.** Each stage bakes its own analytics id in, so one commit produces
different bundle hashes on dev and production — a bundle name cannot identify a commit across environments.
That is the whole reason this read exists.

### Then

Nothing else; back to listening. The tier is the lab machine's, and #1969 is its batch 6 — the branch is
pushed at `1199f263`, with images, the notes file and its pull request still to come.

### Worth fixing while you are in there

The handover said "`C:\TAMU\logs\az-releases.py`, PAT from the user environment" without saying **on
home**. Add the machine, so the next director does not send someone to the wrong box. A path with no
machine is not an instruction on a four-machine branch.


## No batch tonight (20 October 2026, 7:35 PM Central)

Batch 12 is done and nothing follows it tonight. The maintainer has decided: #2007, #1974's second half
(NestJS 12) and #1973 (Vitest 5) all stay parked. Five pull requests are queued or coming and those need his
attention before any new work starts.

**Your question 1 from report 10 is answered: A, accept it as is.** The load you tested — 14 of 20 CPUs taken
by something unrelated — is heavier than the real case this fixes, the limit still names a starved machine
rather than hiding it, and the release tier already forbids anything heavy beside it. Finding Service Parking's
exact threshold would cost 45 minutes to refine a number we have just established should not be the thing we
rely on.

Your PR is open: [2013](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2013).

**One thing worth knowing for next time.** You reported `check-in-volume.sh` on that branch as "affected check
exit 0". It was exit 0 — and it ran nothing: `No tasks were run`, three times, because the only file you
changed lives in `test/smoke/aggiemap/`, which is not an Nx project. The exit code was real and the check was
empty. `tsc -p test/smoke/aggiemap --noEmit` is the one that actually typechecks the suite, and it is what the
pull request quotes. Not a criticism of the work, which was good — it is the trap CLAUDE.md describes, and it
caught this machine once today as well.

**You are about to become the director**, when the maintainer gets home. Read `DIRECTOR.md`'s **Handover**
section before you do anything else.


## Read this first (20 October 2026, 11:05 AM Central)

**Stop the NestJS 12 work and start batch 10.** Two reasons, and neither is a criticism of the work:

1. **Batch 10 (#1986) is what the maintainer asked for**, twice, in his own words, and it has a deadline that
   NestJS 12 does not: #1987 is still live on production and #1981's fix is not deployed, so the check can be
   proven against two real faults *now* and not after they ship. Batch 10 says what to do.
2. **NestJS 12 would collide with work already in flight here.** `development` moved when the maintainer merged
   PR 1984 (Nx 23.3) and PR 1983, and PR 1985's branch conflicted on `package.json` and `package-lock.json`.
   The work machine has resolved that to **Nx 23.3.0 with NestJS 11.2.7**, rebuilt the lock from the resolved
   `package.json`, and is running the full affected check on it now. A second NestJS move on top of an unmerged,
   unchecked NestJS 11 is two dependency changes in flight at once.

NestJS 12 and #1973 come back after batch 10; nothing is thrown away.

**The protocol point, for next time:** the task file is the work. When a batch finishes and there is no next
one, say so in `STATUS.md` and wait — don't pick the next thing. That is the director's call, and it is the
rule the cloud session has had all along.

## What the work machine did with your batch 9 branch

`fix/1988-legend-numeric-where` is good work and the report is exactly what a report should be. The PR is being
opened here. **The before is already captured** from production, with the fault measured as well as
photographed: both legend groups show one row with **no** symbol, which is #1987 exactly. So don't re-take it.

Your note about `docs/testing.md` is right and is handled: PR 1989 takes the total to 481, and #1988's branch
will get `development` merged in and the total set to 482 before its PR opens.

Written by the work session **only while another machine directs** (see `DIRECTOR.md`). The home session does each new batch here,
as `DIRECTOR.md` says for a listener. Development work: branches, agents, pull requests.

## Both urgent fixes are merged (20 October 2026, 1:45 PM Central) — batch 10's window is still open

PR 1989 (#1981) and PR 1990 (#1987, #1988) are both on `development`; all three issues are closed.

**This does not close batch 10's window, and the distinction matters.** Production is still serving
`prod-2026-10-20` (`8463ac6af`), which predates both fixes, so **both faults are still live on
aggiemap.tamu.edu** and #1986's check can still be proven red there. That stays true until a production
deploy, not until the next dev build. Dev loses them as soon as the next dev build goes up.

So: **prove the check against production, and say the bundle hash you saw**, the way the baseline tool records
one — a tag is a claim, the bundle is the proof. If you prove it against dev instead and dev has already moved,
the check will pass and prove nothing.

Rebase batch 10's branch on the latest `development` before you go much further: `docs/testing.md`'s total is
now **482** and both of those fixes added a spec, so a branch cut before today will fight you over that line.

## For batch 10, measured here (20 October 2026, 11:50 AM Central)

While opening PR 1990 the work machine ran the DOM legend scan on ten maps, production against a local
production build of your branch. Three things it learned that batch 10 should not have to rediscover:

- **The routes need `/map/d`**, and the real names are `/parking/visitor-parking`, `/parking/motorcycle-parking`,
  `/parking/accessible-parking`, `/parking/ts-main-parking`, `/parking/service-loading`. A wrong route does not
  fail: the SPA fallback serves `index.html`, the page renders, and the scan reports zero layers and zero legend
  groups, which reads exactly like a map with nothing switched on. **A check for #1986 has to fail on a route it
  cannot load, not record an empty result.** This caught the work machine out twice before it noticed.
- **The main map (`/map/d`) shows nothing to a DOM scan**: its layer list is behind the menu, so `.layer-item`
  does not exist until something opens it. Every event and parking map renders its list on load. So the
  read-from-the-page approach covers the maps built from definitions and *not* the main map, which is the one
  with the most layers. Worth weighing when you choose between that and the build-time manifest.
- **`/parking/service-loading` did not settle** inside 70 seconds on one of the two runs. Whatever #1986 does
  about a map that does not settle, it should say which, not skip quietly.

The scan itself is `legend-compare.mjs` on the work machine; ask for it in your report rather than writing it
again. Result, for the record: **0 regressions, 4 groups fixed.**

## New: say when you will next be heard from (20 October 2026, 9:00 PM Central)

`DIRECTOR.md` has a new section, **Saying when you will next be heard from**, and it applies from batch 13:
when you start, write `Next update by HH:MM Central` in your `STATUS.md` and push it **before** beginning
the work; move it on as you push progress; remove it when you report. If you need longer, push a new one
with a line saying why — running late is fine, a missed deadline with no explanation is not.

The reason is tonight's: the lab machine sat blocked on approval prompts and nothing could tell, because a
blocked session and a busy one look the same from outside. A deadline set before you can get stuck is the
only thing that survives you being unable to speak. A branch watcher was tried and gave three false alarms
in two days while catching nothing real.

Batch 13 has no stated duration because it predates this. Put a deadline on whichever part you are on.

## Batch 13 (20 October 2026, 8:20 PM Central) — the team's own issues, and you open the pull requests now

**Change of practice, decided by the maintainer tonight: you open your own pull requests.** You have `gh` -
you have been filing issues with it all day - and routing every branch through the director has been adding a
wait for no benefit. Open them as [CLAUDE.md](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/CLAUDE.md)
says: issue first, body built **from the template file**, every field set, before/after images committed and
linked by raw URL pinned to a commit, an entry in `unreleased.md` and a row in *What to test on dev*.
`work-lab-leila` still cannot - it has no `gh` - so its branches keep coming back to the director.

**And the ordering rule behind this batch:** the team's own issues outrank anything we invent. Two urgent
issues filed by the team today sat untouched for hours while machines did tooling work. That is the habit
being corrected, not the tooling.

### 1. #2001 — Women's Basketball parking updated (urgent, team-filed 3:36 PM)

**[#2001](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2001).** The map has
been updated on dev and women's basketball starts **2 November**, so this has a real deadline. It should now
have exactly two layers:

- Accessible Parking Spaces
- Women's Basketball Event Parking Spaces

Read the issue and its screenshot before changing anything; the maintainer's words and the picture are the
specification, not this summary.

**It overlaps work already merged.** `fix/1992-accessible-parking-sports-maps` changed Women's Basketball's
Accessible Parking Spaces layer to take its symbol from the portal item - that branch is open as a pull
request and may be merged by the time you start. Check `development` first and build on whatever is there;
do not revert or duplicate it.

`map-layers.spec.ts` covers this map, so a layer list that disagrees with the definition now fails. Run it
red-first on dev if the dev map already shows the new state, and say what it printed.

### 2. #1970 — the wrong popup on a deep-linked feature (High)

**[#1970](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1970).** A feature
opened by `?lot=`, `?feature=` or a search result is drawn in the main map's `selection-layer`, a graphics
layer titled **Selected Buildings** whose popup is the buildings popup - so the panel says "Selected
Buildings" and shows the wrong fields. A branch exists from earlier today, `fix/1970-selection-popup-title`
(`32895a0af`), which was paused before the images were taken. Check what is on it, merge the latest
`development`, finish it and open the pull request.

### Then stop

Nothing else tonight unless the maintainer or the director says so. #2007, NestJS 12 and #1973 stay parked.

### Still true, and worth not relearning

- **A green check can mean nothing ran.** `check-in-volume.sh` on a branch that only touches
  `test/smoke/aggiemap/` returns exit 0 with `No tasks were run`, because that is not an Nx project. It
  caught this machine on batch 12 and the work machine twice today. Read the log. For the suite,
  `tsc -p test/smoke/aggiemap --noEmit` is the real check.
- **`docs/testing.md`: add no row and change no number** unless you add a spec ([#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002)).
- **Production still carries every fault fixed today** - nothing has deployed since `prod-2026-10-20`. That
  is why red-first against production still works for anything fixed today but not yet released.

## Batch 12 (20 October 2026, 6:05 PM Central) — #2008: the settle limit measures the wrong thing

Batch 11 was excellent work and all three branches are in flight here. This is small and closes a loop the
new lab machine opened.

### What happened

`/parking/maintenance-parking` failed `map-layers.spec.ts`'s 240-second settle limit on two machines under
six workers, and passed when run alone. A third machine joined today with 24 CPUs and 64 GB, and
**[#2008](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2008)** was given to it
precisely because 6 workers is not contention there. Its answer:

| Run | Workers | Maintenance Parking |
| --- | --- | --- |
| whole spec | 6 | passed, 41.5 s |
| whole spec, repeat | 6 | passed, 46.6 s |
| that map alone | - | passed, 43.4 s |

Against 134 s and 147 s on the loaded machines. Five other maps loading beside it made no measurable
difference. **So the 240-second number measures how much CPU the machine has to spare, not how long the map
takes to draw.** The maintainer has agreed the fix.

### The fix

Tag Maintenance Parking and Service Parking (`/parking/service-loading`) as **`@heavy`** in
`map-layers.spec.ts`. That mechanism already exists from
[#1716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1716): heavy tests run
after everything else, two at a time, so they are not settling against five other map loads. The 240-second
limit then stays a real "this map has become slow" signal instead of being padded into a guess about the
machine.

Those two maps are the ones that load every parking space on campus - the
[#1897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1897) family. If you find
others in the spec with the same shape, say so rather than tagging them on a hunch.

**Do not raise the limit**, and do not scale it by worker count: both turn a measurement into a guess, and
the point of this change is that the limit should mean something.

### Proving it

The honest difficulty is that this is a fix to a failure that only appears under load, so "it passes now"
proves little on an idle machine. What *can* be shown:

- the two tests are tagged and the heavy lane picks them up — the run reports them running after the rest;
- the whole spec still passes on a local production build;
- the run's wall-clock time, before and after, so a reviewer can see what tagging two tests costs.

If you can reproduce the original failure by loading your machine deliberately, that is better evidence than
any of the above and worth the extra few minutes. If you cannot, say so plainly in the report rather than
implying the fix is proven.

### The rest

Branch `test/2008-heavy-space-maps` from the latest `development`. `Closes #2008`. **No pull request** — say
"branch ready" and this machine opens it. `docs/testing.md`: **add no row and change no number**, including
the Total. That rule landed today as
[#2002](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2002): three pull requests
conflicted on that one line in an afternoon, the check never reads the counts, and they are refreshed at
release from a measured run.

### Still parked

#2007 (replace `lotFill` with `symbolFromServiceClass`, Low), #1974's second half (NestJS 12) and #1973.

## Batch 11 (20 October 2026, 3:25 PM Central) — #1991, #1992, #1993: the three your own check found

Batch 10 did what it was asked to and then some: `map-layers.spec.ts` found three faults on public maps that
nobody knew about. The maintainer has set **all three to High** and put them on the board as Todo. They are
yours. PR [2000](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2000) is open for
#1986 itself, so the check is in flight while you fix what it caught.

### Decided (the maintainer's answers to report 8)

1. #1991 **High**, #1992 **High**, #1993 **High**. (You suggested Medium for #1993; he said High.)
2. Open #1986's PR now and leave production red on the three — **done**, that is PR 2000. Do **not** add them
   to `environments.json` as allowed failures. The point of the check is that they are visible.
3. "Drawn" stays **at least one feature**, with the share as an annotation. Your recommendation, taken.
4. The settle limit stays **240 s**, with a map that does not settle failing and saying so. Taken.
5. The quick tier stays as it is. Taken.
6. `drawn-symbols.spec.ts` is **deleted** — done here, on #1986's branch, with `docs/testing.md`'s total at
   **551**. Don't re-add it.

### The work

Three issues, and they are not three separate investigations — **#1991 is #1981 again**:

- **[#1991](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1991)** — Vendor
  Parking draws 0 of 10 lots, `LotType` undefined on every feature. That is exactly #1981's cause: the
  service's renderer keys on `GIS.TS.ParkingLots.LotType`, which the service does not publish. #1981's fix
  (`8e505e2fd`, `lotFill` in `business-parking.definitions.ts`) is the pattern — **reuse it, don't copy it**.
  If the same shape is now wanted on two maps, it belongs somewhere both can import, not pasted twice. Keep
  the comment explaining why the override exists, as `docs/map-layers.md` requires.
- **[#1992](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1992)** — Accessible
  Parking Spaces on Women's Basketball, Indoor Track and Softball: the renderer asks for
  `Disabled,Volleyball` and the data says `Accessible,Basketball`. Three maps, one layer, so one fix should
  clear all three. Worth checking whether any *other* map uses this layer before deciding where the fix goes.
- **[#1993](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1993)** — Indoor
  Track's Team Bus Parking has no symbol for lot type `SPORTS`. Smallest of the three.

**Whether any of these is really ours to fix is a fair question** — #1991 and #1992 both look like the
service being wrong rather than us. Say so in the report if that is what you find: the maintainer is already
sending Transportation Services a note about #1981's field, and these would go in it. But the maps should
draw correctly in the meantime either way, which is what #1981 did.

### How to prove each one

`map-layers.spec.ts` already fails on all three, on production, naming the maps. So: **run it red first on
production and quote what it said**, then green on a local production build of your branch. No new spec is
needed unless you find something it does not cover — if you do, that is the more interesting finding, say so.

### The rest

One branch per issue if they are genuinely separate, or one branch for #1991 and one for #1992+#1993 if the
sports maps share a fix — your call, say which and why. From the latest `development`; `docs/testing.md` is
at 551 once PR 2000 merges, so rebase rather than guess. **No pull requests**: say "branch ready" and name the
before/after each one needs, and this machine takes the images and opens them.

### Still parked

#1974's second half (NestJS 12) and #1973. NestJS 11 merged as PR 1985, so NestJS 12 no longer stacks on an
unmerged branch — but it waits until these three are done.

## Batch 10 (20 October 2026, 10:45 AM Central) — #1986, the per-map check the maintainer asked for

**Do this after batch 9.** Batch 9 is the fix; this is the check that stops it, #1981 and #1987 all coming
back. The maintainer asked for it twice, in his own words:

> we need to add some tests for each map that the layers that it is supposed to draw based on the definition
> for the map are in fact listed and do in fact draw

> We need to check each of the maps to make sure that the legends show for the layers that are turned on.
> Again, not sure how this is sneaking through, but we need to update our tests so that we cannot release
> without legends showing again.

### Don't touch

- **`chore/1974-nestjs-11`** — the work machine has taken over its conflict with Nx 23.3 (PR 1984 merged) and
  is rebuilding the lock file. Do not push to it.
- **`fix/1981-business-parking-lots`** — PR 1989, the work machine's.

### What the check has to cover, for every map

Three things, because the three faults we have each slipped past a different one:

1. **Every layer the definition declares is listed** in the sidebar. (Nothing has broken this yet; it is the
   cheapest of the three and it is what the maintainer asked for first.)
2. **A layer that is switched on draws something.** #1981: both lot layers loaded, answered every query and
   held 73 and 6 lots, and drew none, because the service's renderer had no symbol for them.
   `drawn-symbols.spec.ts`, on #1981's branch, does this for one map — generalise it.
3. **A layer that is switched on has a legend entry with a symbol in it.** #1987: the entries were there with
   their names, and empty.

### How to get the declared layers

**Do not import the definitions into the Playwright process.** `global-setup.ts` already records why: it pulls
the Angular dependency graph in, which fails first on the JIT compiler and then on bundler-only module
resolution. Two ways that do work, and the first is likely better:

- **A build-time step** that writes the declared layers per route to a generated JSON file, the way
  `map-manifest.generated.json` is already produced, and the spec reads that file.
- **Read it from the running app** through the probe or the DOM, which is what the suite does today. This
  checks "listed and drawn and in the legend" but cannot catch a layer the definition declares that never
  reaches the sidebar at all — point 1 above.

Say which you chose and why.

### Prove it red before the fixes land

This is the part with a deadline. **#1987 is still live on production and #1981's fix is not deployed yet**,
so production currently carries two real faults for this check to find. Once they ship, proving the check
would mean reconstructing the broken state by hand. So: **run it against production and record what it says,
before anything merges.** If the work machine has to run it, say so in your report and it will.

The work machine already has a DOM-level legend scan written for exactly this
(`.layer-item.visible`, `.collection-group-title-text`, `.collection-group-content`,
`tamu-gisc-legend-element`, a row counting only if it holds an `img`, `canvas`, `svg` or a background image).
Ask for it in your report rather than writing it again.

### The rest

One branch, `test/1986-every-map-draws-and-legends`, from the latest `development`. `Closes #1986`. A row in
`docs/testing.md` with the count, as `drawn-symbols.spec.ts` has. **No pull request**: say "branch ready" and
the work machine opens it.

If this turns out to be more than one batch of work, do the legend half first — that is the one with a live
fault to prove it against — and say so.

## Batch 9 (20 October 2026, 12:10 PM Central) — #1987, and you already found its cause

**This machine is idle and #1987 is High and untouched.** Batch 8 was pushed at 10:40 AM and your `STATUS.md`
never mentions it, so it was missed — not a fault, but it is the work to do now. **Batch 9 replaces batch 8;
ignore batch 8.**

### #1988 is the cause of #1987 — you found it without connecting the two

**[#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987)** (High, `critical`):
Freshman Selectable Parking's layers draw and are listed, and the legend shows their names with **no symbols**.
Production console:

```
Error querying layer for legend item: {label: Resident Student Priority,   value: 1,1, ...}
Error querying layer for legend item: {label: Freshman Student Selectable, value: 0,1, ...}
```

**[#1988](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1988)** (Medium), which you
filed while finding #1981's cause, says `_buildLegendWhereClause` quotes every value, so a numeric field is
compared as a string and the server rejects it — and you wrote: *"#1981's fix gives those two layers simple
renderers, so Business Parking no longer reaches this code, **but any other unique-value renderer on a numeric
field does**."*

The freshman map's values are `1,1` and `0,1` — **numeric fields**. That is the same code path. So **#1988's fix
is #1987's fix**, and one branch should close both.

### What to do

1. Fix `_buildLegendWhereClause` so a numeric field is compared as a number. Be careful what counts as numeric —
   take it from the layer's field types, not from whether the value looks like a digit, or a string code such as
   `'09400'` will be unquoted and break.
2. **A test proven red first** against production or a build that reproduces it, on a unique-value renderer over a
   numeric field. Say what it printed.
3. One branch, `fix/1988-legend-numeric-where`, from the latest `development`. In the pull request body, close
   **both**: `Closes #1988` and `Closes #1987` — the maintainer's rule allows a closing keyword only for issues
   the change really closes, and this closes both.
4. **No pull request, no screenshots** — work takes the before and after on the freshman map and opens it.

### Afterwards

#1974's second half, then #1973 once #1972 (PR 1984) is merged, as you had planned.

## Batch 8 (20 October 2026, 10:40 AM Central) — #1987, straight after #1981

**The maintainer, just now:** #1987 is **High** and this machine takes it **next, after #1981**. Batch 6 stays
parked until both are out.

**[#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987): Freshman Selectable
Parking's legend shows no symbols.** Both layers are on, both **draw**, both are listed under Layers — and the
Legend shows their two names with no symbols at all, so nothing says what red and blue mean. Live on production.

### Read this before starting: it is probably the same bug as #1981

Production's console on the freshman map:

```
Error querying layer for legend item: {label: Resident Student Priority,   value: 1,1, ...}
Error querying layer for legend item: {label: Freshman Student Selectable, value: 0,1, ...}
```

and on Business Parking:

```
Error querying layer for legend item: {label: UB Permit and UB+ Permit Authorized, value: 1,Street, 1,Surface, 1,Surface Visitor, ...}
```

Same message, same code path. **Look at `value`:** `1,1`, `0,1`, `1,Street`, `1,Garage` are each a comma-joined
tuple of two field values — what a `UniqueValueRenderer` with **more than one field** produces. The legend's
per-item query looks unable to turn a composite value back into a valid `where` clause.

**If that holds, it predicts the affected set:** any map with a multi-field unique-value renderer, and only those.
It would also explain why this was never noticed — most maps use a single-field renderer.

**Prove or discard it; two samples is a hypothesis, not a cause.**

### The difference that may matter

On the freshman map the layers **draw** and only the legend is empty. On Business Parking the lot layers **do not
draw at all**. One fault may produce both, or they may be two bugs sharing a message. **If #1981's fix also fixes
this, say so and do not write a second fix** — close both from one branch and say that in the report.

### What to do

1. Cause first, with evidence, before any fix.
2. A test proven red first, on a map with a multi-field unique-value renderer. Say what it printed.
3. Branch `fix/1987-legend-multi-field-renderer` from the latest `development`, unless it is one branch with
   #1981, in which case say so.
4. **No pull request, no screenshots** — this is visible, so the work machine captures before and after and opens
   the PR. Say "branch ready".

### Not yours

[#1986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1986) is now **High** and
covers the test gap behind both: every map, every declared layer **listed**, **drawing**, and **in the legend**.
It must be proven red **against production before these fixes land**, because Business Parking and the freshman
map are the only two live examples. The director will place it.

## Batch 7 (20 October 2026, 10:10 AM Central) — URGENT: #1981, the Business Parking map

**Stop everything else and do this first** (the maintainer, just now). **Batch 6 is paused**, including the
production release tier: park it where it is and come back to it when #1981 is fixed and out. Park #1974 too.

**[#1981](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1981), labelled `critical`:
the Business Parking map draws its UB spaces but not its two lot layers.** It should show the spaces *and* the
lots in maroon and pink. It is live on production now.

### What the work machine already established — don't redo it

**The service is healthy. This is ours.** Every definition expression in `business-parking.definitions.ts`
returns data, asked of `TS_Events/BusinessParking/MapServer` directly:

| Layer in the definition | Query | Rows |
| --- | --- | --- |
| UB 2 Hour Spaces, layer 0 | `Spc_Type = 'UB'` | **58** |
| UB and UB+ Authorized, layer 1 | `UB_Lot = 1 AND LotType IN ('Street','Surface','Surface Visitor')` | **90** |
| Only UB+ Authorized, layer 1 | `UB_Lot = 1 AND LotType IN ('Garage','Garage Visitor')` | **7** |

The service has exactly two layers: `0 Marked Business Spaces`, `1 University Business Parking Lots`. Split
apart, `UB_Lot = 1` alone returns 97 and each `LotType` list returns its 90 and 7. So the data is there and the
filters are right.

**Production's console names the two missing layers, in the legend code:**

```
Error querying layer for legend item: {label: UB Permit and UB+ Permit Authorized,
  value: 1,Street, 1,Surface, 1,Surface Visitor, symbol: SimpleFillSymbol, preview: div}
Error querying layer for legend item: {label: Only UB+ Permit Authorized,
  value: 1,Garage, 1,Garage Visitor, symbol: SimpleFillSymbol, preview: div}
```

plus a `404` on some resource. Note the `value:` — the definition expression is being taken apart into a list of
values, which is the shape of a legend or renderer lookup, not of a layer failing to load.

**A hypothesis, not a conclusion:** these two layers are the only ones on this map that **share a service layer
URL** (`/1`) and are distinguished only by their `definitionExpression`. Something that keys off the URL — the
legend's per-layer query, or the renderer lookup — may be collapsing them or failing on the pair. Prove or discard
it; don't assume it.

**Likely suspects by date:** PR 1950 (`<arcgis-map>`, rehosts every map) and the recent legend work (#1939, the
layer-order fix; #1857, the legend listing). Check whether an older build draws the lots before blaming any of
them — that is the fastest way to localise it.

### What to do

1. **Find the cause and say what it is**, with evidence, before writing a fix.
2. **A test proven red first**, as always. Say what it printed when it failed.
3. Branch `fix/1981-business-parking-lots`, from the latest `development`. Report on #1981.
4. **No pull request and no screenshots** — this map is visible, so the work machine captures the before and after
   and opens the PR, as for #1960 and #1954. Say "branch ready" and the work machine takes it.
5. If the cause turns out to be PR 1950 and the fix is not quick, **say so immediately** rather than working on:
   that is a revert decision for the maintainer, and it is already on production.

### After it is out

A second issue follows for the gap that let this through: **every map should have a check that the layers its
definition says it draws are listed and do in fact draw**. The work machine is filing it; it is not this batch.

## Batch 6 (20 October 2026, 9:20 AM Central) — the release tier against production, on this machine

**Decided** (the maintainer, this morning):

- **The release tier against production moves to home.** The work machine has the GIS Day session's
  `nx build gisday-angular` running in `C:\TAMU\wt-1976` at about 400% CPU, and the maintainer wants that machine
  usable. Nothing about this run is work-machine-only: only **visual-baselines screenshots** are, and this is not
  that.
- **Your question 1: yes.** #1972's pull request is opened before #1974's and merged first, so #1973 is unblocked.
  The director opens it; you do not need to.
- **#1978 is High, #1979 is Medium**, both now on the board.

1. **The release tier against production** (report on: #1935)
   - **Park #1974 first.** This runs on a quiet machine or not at all: **nothing else heavy on home while it runs**,
     no build, no check, no agent. A tier spoiled by contention cost a whole run on 19 October, and this one says
     whether production is healthy after the promotion.
   - `test/smoke/aggiemap/run-local.sh production release`, from a checkout at **`8463ac6af`**, which is what
     production serves (`prod-2026-10-20`).
   - **Confirm production first**, and do it this way, because the obvious check is wrong: production serves
     `main-AYJ2SDWT.js` while dev serves `main-IORMDVQQ.js` **for the same commit** — the Google Analytics id is
     substituted per stage (`G-GNS4JMVEZW` against `G-71VY0QZS5P`) and is baked into the bundle. So compare a
     bundle with **the same environment's** previous one, never across environments. What to check: the
     `prod-2026-10-20` tag resolves to `8463ac6af`, and production's bundle is no longer `main-TK2R62YY.js`.
   - **Expect about 537 tests**, not dev's 576: the suite hides development-only features on a production host.
   - The work machine reached **260 of 537 with nothing failing** before the maintainer stopped it for resources.
     That is **not a result** and is not to be carried over or added to yours — start from scratch and report only
     what your own run produces.
   - Report per failure what failed and why, and **say plainly whether production is healthy**. No Azure actions,
     no promotion, no approval.
   - Push `work`-style started and finished lines to `home/STATUS.md` as usual.

2. **Then carry on with #1974's second half**, and #1973 once #1972 is on `development`.

3. **Open the pull requests for your two branches that need no images** (the maintainer, 9:40 AM: the work machine
   keeps only what needs screenshots stored on it).
   - **#1972 first** — `chore/1972-nx-23-3` (`1ad923945`). Your `.pr-body.md` is drafted in `C:\TAMU\wt-1972`;
     build the body **from `.github/pull_request_template.md`**, not fresh, apply the `no-visible-change` label
     with the reason written out, and put it on the board at Pending Approval. Merging is the maintainer's.
   - **Then #1974's first half** — `chore/1974-nestjs-11` (`db2f1f339`), the same way. Its closing line was
     waiting on question 1, which is now answered: #1972 merges first.
   - Check with `gh pr view <n> --json closingIssuesReferences` a few minutes **after** opening, not immediately:
     GitHub fills that in asynchronously and an early empty reading means nothing.
   - These are light, so they can be done before or after the tier; the tier is the thing that needs the machine
     quiet.

**Not yours:** the production screenshot set keyed `prod-2026-10-20` stays on the work machine, as does #1970's
and #1975's before/after imagery, **and their pull requests**, which carry those images.

## Batch 5 (20 October 2026, 7:40 AM Central) — the tailgating kiosk, then the upgrades

Written by home as director just before handing over to work, so home has its day's work. **Decided** (the maintainer,
this morning): #1975 is Medium; #1972 Low, #1973 Medium, #1974 Medium; **#1974 goes ahead although GIS Day is out of
scope**, because its servers share the packages: full check of every project, GIS Day's included (his 4A).

1. **#1975: a kiosk map for Football Tailgating** - already running here (an agent, worktree `C:\TAMU\wt-1975`, branch
   `feat/1975-tailgating-kiosk`). Report the branch, the kiosk's path, and its judgement calls (layers, opening view,
   game-day notice) as Questions for the director. No PR, no screenshots: work takes them and opens it.
2. **#1972: Nx 23.2 to 23.3.** Branch `chore/1972-nx-23-3` from the latest `development`. This PR also adds #1972, #1973,
   #1974 and #1918 to the modernization path table in `docs/releases/unreleased.md`, and brings its stale ArcGIS row up to
   date (5.1.27 on production since `prod-2026-10-20`; `<arcgis-map>` with #1949). Full check, clean `npm ci`. Branch ready, no PR.
3. **#1973: Vitest 4 to 5.** Same rules; same test count per project before and after; time the suite before and after.
4. **#1974: NestJS 10 to 11, then 11 to 12**, one branch each, full check of every project each time.
   Only 2 after 1 is pushed, and so on: one upgrade at a time, so their lock files don't collide.

## Batch 4 (19 October 2026, 3:05 PM Central) — #1960, wanted today, then the #1954 merge

**Decided** (the maintainer, this afternoon): **#1960 is High and goes out today.** He also merged **PR 1958**
(#1952), so `development` has moved; **1959** (#1953) is open with its conflict resolved here, and **1950** is held
until today's release ships.

Take **task 1 first** — it is the one with a deadline.

1. **#1960: draw lactation rooms from the new hosted service, and show what it adds**
   - The GIS team (Eric Irwin) published a replacement and asks us to repoint:

     | | |
     | --- | --- |
     | Today | `${connections.inforUrl}/2` = `FCOR/MapInfo_20190529/MapServer/2` |
     | New | `Hosted/Lactation_Spaces_view/FeatureServer/0` |

     Add the new one to `connections.ts` beside the others rather than hard-coding it in the definition;
     `inforUrl` stays, because layers 0, 1, 3 and 4 of that service are still in use.

   - **Added 3:30 PM, and it changes the URL you write.** The new service exists **only on the production GIS
     host**. Checked from here:

     ```
     gis-dev.it.tamu.edu/.../FCOR/MapInfo_20190529/MapServer/2    404 Layer not found
     gis-dev.it.tamu.edu/.../Hosted/Lactation_Spaces_view/...     404 Service not found
     gis.tamu.edu/.../Hosted/Lactation_Spaces_view/FeatureServer/0   OK, 8 fields, 35 records
     ```

     So **`${gisHost}` would 404 on dev**, exactly as the current layer already does — today's lactation layer
     fails to load on dev for this reason, and has for as long as the dev server has lacked that service. It works
     on production. Pin the new URL to `https://gis.tamu.edu` and say why in a comment beside it, the way
     `basemapUrl` is pinned for #1696, and name an issue to restore `${gisHost}` once the GIS team publish it on
     the development server. **Do not quietly leave it on `${gisHost}`**: that ships a change nobody can check on
     dev.
   - **Every field name changes, so the popup must be rewritten, not repointed.** `Name` becomes `bldgname`,
     `MapDisplay` becomes `availability_type` (with `availability_times` now carrying the hours), and `Notes`
     becomes `notes`. There are two new fields, `access` and `amenities`.
   - **The trap:** `lactation.component.html` puts `Notes` into `<a [href]="data.attributes.Notes">` because today
     it is a URL. In the new service `notes` is prose containing an email address, so leaving that would render a
     broken link. It becomes text.
   - **A standing bug to fix while you are there:** the template reads `data.attributes.Bldg_Number`, which exists
     in **neither** service — today's field is `BldgNum` — so "Building Number:" has always rendered empty.
   - **The maintainer's decision on what the popup shows (his 2A):** building name and number, availability type
     and times, access, amenities, and the notes as text. Everything the service carries.
   - **21 rooms today, 35 in the new service**, so expect 14 more on the map; say the count you see. On dev the
     layer draws nothing at all today, so the before image is an error state, not a popup - the work machine has
     captured it.
   - Reuse before building: the popup is one of the components in `libs/aggiemap/ngx/popups`, and the others show
     how multi-line detail is laid out. No purpose-built CSS.
   - Tests: one **proven red first** that fails against the old source or the old field names, so a future repoint
     cannot silently empty this popup again. Say what it printed when it failed.
   - Branch `feat/1960-lactation-hosted-service`, from the latest `development` (which now has #1952).
   - Report on: #1960. **No PR, no screenshots** — work captures the before/after and opens it.

2. **#1954: merge `development` into your branch** (the maintainer's 2A)
   - `fix/1954-deep-link-respects-filter` was branched before #1952 merged, and both change
     `selectFeatureByFieldMatch`, so it now conflicts. You wrote the `createQuery` change and know what must
     survive, so the merge is yours.
   - For reference, 1959's conflict was only `docs/releases/unreleased.md`, where both entries belonged and both
     were kept; its code merged on its own. Yours touches the same method, so expect a real code conflict: the
     qualified-field match picks the field, your change limits the rows, and both must remain.
   - Push, say so, and work checks and opens the PR.

## Batch 3 (19 October 2026, 12:20 PM Central) — #1954, the finding you made

**Decided** (the maintainer, just now): **#1954 is Medium**, as you suggested, and it is yours to fix — you found it
and you have the context. He also cleared the work machine to check, screenshot and open the pull requests for
#1952 and #1953, which is happening here now; don't touch those branches.

**Your batch 2 notes are accepted as they stand.** The comparison gap you marked TO COME can now be filled: the
final build differs from production on **nothing above 20%**, and the one shot that looked like a change (Leggett,
20 August, 15.26%) was the opening view animation caught mid-flight — re-captured on the same build it is 3.02%
from production, and 26.57% from its own first shot. The layer-order difference that was unexplained yesterday is
**fixed**: `/parking/ts-main-parking` lists its layers alphabetically again, matching production. Add that when you
next touch the notes; don't open them again just for this.

1. **#1954: a `?lot=` deep link can select a feature the map's filter excludes**
   - What you saw: on Motorcycle Parking, `?lot=100j` selects space 26692, an `H/C` space, on a map that draws only
     `M/C`. The same before and after #1952, so it is not caused by that change.
   - Goal: a deep link cannot select a feature the map's own filter excludes. The lookup in
     `EventService.selectFeatureByFieldMatch` queries the layer directly, and a layer's `definitionExpression`
     governs what it *draws*, not what `queryFeatures` returns unless the query says so.
   - Decide and say which is right: applying the layer's `definitionExpression` to the lookup query, or letting
     ArcGIS do it. Say in the report why, and what it means for a map whose filter changes after the link was
     shared — a link that selected a feature yesterday may select nothing today, and that is probably correct, but
     it should be a decision rather than a side effect.
   - **Test proven red first**, as before: on a map whose layer is filtered, a link naming a feature outside the
     filter selects nothing instead of selecting it. Say what it printed when it failed.
   - Branch: `fix/1954-deep-link-respects-filter`, from the latest `development`. Not from #1952's branch — that one
     is going through review here and the two must not be entangled.
   - Report on: #1954. **No pull request**, and no screenshots: work opens it with the images, as before.

2. **If that finishes**, carry on with #1949. Nothing else is queued for you.

## Batch 2 (19 October 2026, 10:05 AM Central) — the release notes, while the maintainer is still out

**Batch 1 is done and its two branches are read and accepted.** Both diffs were reviewed here: the matcher change
is backwards compatible (`'LotName'.split('.').pop()` is `'LotName'`, so the thirteen services that already worked
still match), and the `.catch` in #1953 is scoped to the lookup alone. **Work will check, screenshot and open both
pull requests** once the capture finishes — nothing heavy runs beside it.

Your finding is filed as **#1954** (a `?lot=` link can select a feature the map's filter excludes), Bug, on the
board, **priority left unset** for the maintainer, with your suggestion of Medium recorded. Don't start it.

1. **#1935: bring the release notes up to date with what is now known**
   - You own the notes (`C:\TAMU\wt-notes`, branch `docs/release-2026-10-18`, `docs/releases/2026-10-19.md`), and
     only one machine edits them, so this stays with you. These numbers are handed over rather than discovered.
   - **The full tier on Release-484** (build 20261019.5, `8951a6364`), run here 7:38-8:50 AM Central:
     **880 passed, 2 failed, 7 flaky, 30 skipped of 919**, 1.1 hours.
     - **Only one failure is real:** `directions.spec.ts:72`, the AVP feature popup, which is **#1951**,
       Transportation Services' server. Production has it too — the same deep link opened its popup on only 4 of 8
       loads there — so nothing in this release causes it.
     - **The other failure and all seven flaky results were this machine's own contention** and are not the
       release's: a browser loop and query matrices were run beside the tier. A re-run of `maps.spec.ts` alone on an
       idle machine was **74 passed, 0 failed**, including `/map`, which had failed all three attempts. Write the
       notes from the re-run, and say plainly that the tier's other failures were a measurement fault here, not a
       fault in the build.
   - **The dev tag:** there is none. The maintainer's decision is no `dev-*` tag until a rerun is clean, so the
     notes must not claim one. The release is **held** on #1951 and production still serves `264eebb42`.
   - **Still to come from this machine:** the comparison against `prod-2026-10-16-corrected` (capture running, about
     two hours left) and, if Transportation Services' service recovers, a clean full tier. Leave a clearly marked
     gap for each rather than guessing; they will be handed over the same way.
   - Everything else the notes need — what each change does, the issue and pull request links, the closing table —
     is yours to write.
   - Report on: #1935. **Don't merge the notes**: they merge before production, which the maintainer decides.

2. **If that finishes and nothing new has arrived**, carry on with #1949 as far as it goes. Nothing else is queued
   for you; the remaining release work needs this machine.

## Batch 1 (19 October 2026, 9:20 AM Central) — while the maintainer is in a meeting

**Decided** (the maintainer, this morning, before he left):

- **Today's release is held** on #1951, Transportation Services' server. It is not ours, production has it too, and
  nothing in the release causes it. Release-484 (`8951a6364`) is **not tagged** and will not be until a rerun is clean.
- **The deep-link fix is the matching fix, not a per-map search source.** He first chose a search source for the AVP
  map; the audit then found **fourteen** services with the same fault, so he moved to fixing the matcher, with one
  requirement in his words: *"we need to support existing links that are out there"*.
- Three issues are filed, with every field set: **#1951** (High, Transportation Services' server — nothing for us to
  write), **#1952** (Medium, the deep links), **#1953** (Medium, `drawEvent` losing the view and flash).
- **Screenshots stay on the work machine** until the Kubernetes visual compare exists. So these branches are written
  and unit-tested on home; **work captures the before/after images and opens the pull requests.** Don't open a PR.

Both tasks are code and unit tests only. Neither is on the release's critical path, so take them in order and don't
rush the first.

1. **#1952: make a lot deep link resolve where the service's fields are table-qualified**
   - Goal: `?lot=100j` selects the lot on `/parking/avp-parking/map`, and on the other thirteen services listed in
     the issue, **without breaking a single link already shared**.
   - The cause, proven: `EventService.selectFeatureByFieldMatch` compares field names exactly
     (`layerFields.includes(fieldName)`), and these services expose `GIS.TS.ParkingLots.LotName`, not `LotName`,
     because they join `ParkingLots`, `Lot_Use` and `Lot_Notes`.
   - Do: match on the **last dot-segment** of a field name, so `GIS.TS.ParkingLots.LotName` satisfies `LotName`.
     Keep the priority ordering that `candidateFields` gives, and keep the query correct — the field the `where` is
     written against must still be the layer's real, qualified name.
   - **Existing links:** `selectFeatureFromUrl` tries `?feature=<layerId>:<objectId>` first and returns as soon as it
     resolves, so links shared since #809 in June keep working. Prove it rather than assume it: a test that both
     forms select the same feature on the same map.
   - Extra parameter spellings go through `urlQueryParamAliases`, as buildings already do (`bldg`, `Bldg`,
     `BldgAbbrv` and its aliases). Add any the TS links use.
   - Tests: a unit test **proven red first** against the unfixed matcher — say in the report what it printed when it
     failed — and a smoke assertion that `?lot=` resolves on one map from the broken group and one from the working
     group, so the audit in #1952 stays true.
   - Branch: `fix/1952-qualified-field-deep-links`. Report on: #1952.

2. **#1953: keep the chosen view and the focus flash when a feature lookup fails**
   - Goal: a failing `selectFeatureFromUrl` no longer costs the map its opening view and its flash.
   - In `EventService.drawEvent` those three steps share one `try`, so an error in the lookup skips the two after it.
     Let the view and the flash run either way. **No retries** — a retry would hide the outage the smoke suite should
     keep reporting, and #1951 tracks it.
   - Tests: a unit test proven red first, that a throwing `selectFeatureFromUrl` still leaves
     `applySelectedChoiceView` and `flashFocusFeature` called.
   - Branch: `fix/1953-draw-event-view-and-flash`. Report on: #1953.

3. **#1949, Esri's map components** — carry on as far as it goes, as before. Lowest of the three.

**Say "branch ready: <names>"** in `home/STATUS.md` when a branch is pushed and its unit tests pass. Work builds and
checks it, captures the images and opens the PR.

**If anything here is already done or half-done from this morning, say so and don't redo it.**

## Batch 31 (8 November 2026, from `work (aggiemap)`) — #2707: a click into a map that is still drawing is thrown away (High)

**Read [#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707) and its measurement
comment first.** The lab put 320 loads per path behind this; the numbers there are the specification for your fix, and
its "how it was measured" section is worth copying rather than reinventing.

**The fault, in one line:** `MapService`'s click handler is `view.hitTest(e)` and nothing else
(`libs/maps/esri/src/lib/services/map/map.service.ts`, around line 222) — no fallback, no retry. Until the buildings
layer view holds the graphics under the point, the hit test comes back empty and **the click is discarded silently**.

**What that costs a visitor:** on dev, **0 of 20** clicks opened a popup once the framing had settled, about six
seconds in, which is when the page looks completely ready. Production was 1 of 20. It is only reliable at sixteen
seconds. The click is dropped, not slowed — a click that missed never produced a popup in the twenty seconds allowed.
This is on production today.

### The fix the maintainer chose

**When the hit test comes back empty, fall back to querying the layers at that point.**

That is deliberately the path that already works: `TripPlannerService` queries `buildings-layer` directly with
`featuresIntersectingPoint` rather than going through the hit test, and it set a stop **110 of 110 times**, including
on clicks made while the map was still drawing. The routing click is not affected by this fault at all, and the reason
is exactly this difference.

Two options were rejected, and it is worth knowing why so the fix does not drift into them: holding the click until the
layer view settles was rejected because it makes every early click feel laggy, and changing the probe's `ready` was
rejected as a fix because it changes nothing for a visitor.

**Points to settle while building it, and say what you chose:**
- **Which layers to query.** Querying every layer on every missed click is a lot of requests. The popup only ever opens
  for a layer that has a `popupComponent`, so that is the natural set.
- **Ordering.** A real hit test returns graphics top-most first, and `orderHitsForPopup` then moves the selection
  highlight behind. A fallback has to produce an order the popup service can use the same way.
- **A click that genuinely hits nothing** — bare ground — must stay cheap and must not open anything.
- **The hit test is skipped entirely on the trip planner route.** Do not change that.

### Prove it red first

The regression test is the point of this one, and #2707 records that the suite's existing waits are **not enough**: a
check that waits for `ready`, or for `ready` plus settled framing, still lands inside the dead window — that is the
0-of-20 row. So a test written the way the suite writes them today would pass against a map nobody can click.

**Write the check so that it fails on the unfixed code**, by clicking in that window deliberately, and say in the pull
request what the unfixed code did when you ran it.

### Not in this batch

The basemap's intermittent 500s produce the same symptom by a different route and last the whole visit
([#2702](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2702)). Whether this fallback also
rescues that case is worth a sentence in your report, but do not build for it.

A click on a Nature Rx marker in the routing panel names the stop by bare coordinates rather than by the space's name.
The maintainer has decided that should be fixed; it is a separate change and not yours this batch.

### The report and the pull request

One pull request, from a fork branch, issue linked, body from the template, with before and after evidence — a visible
fault needs them, and here the "before" is a click that does nothing, so the measurement stands in for a screenshot.
`scripts/check-in-volume.sh <branch> maps-esri,aggiemap-angular` at least; say what you ran.

`home/reports/2026-11-08-31.md`, and say **"report ready: <file>"**.

## Batch 32 (8 November 2026, from `work (aggiemap)`) — two new event maps from Transportation (#2712 Urgent, #2713 High)

Both are new maps Megan has published services for. Take them in order; **#2712 is the only Urgent on the
board.** One pull request each.

I have already checked both services — they are up, public and carrying data, so nothing here is blocked.

### A rule that applies to both, and is the point of today's other work

**Do not hard-code layer titles.** A layer's name belongs to whoever publishes the service
(`docs/map-layers.md`). A `title` on a layer source replaces it and means a rename upstream never reaches
the map. [PR for #1523](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1523)
has just deleted fourteen such overrides; do not add new ones. The same goes for symbology and layer order:
take what the service publishes unless there is a specific reason, and write the reason beside it if so.

The layer names below are what the services publish today. If one reads badly, that is a request to Megan
to rename it, not a string to correct in the definition.

### 1. [#2712](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2712) — Micromobility draft map (Urgent)

`https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Micromobility_Map_WFL1_view/FeatureServer`

| Layer | Name | Features |
| --- | --- | --- |
| 0 | Micromobility Corridor | 12 |
| 1 | Allowed Sidewalks | 28 |
| 2 | Micromobility Facilities | 255 |

**Megan wants it on dev only for now**, refined and moved to production next week.

**The gating is the part to get right, and it is easy to get wrong here.** The service is on
Transportation's **production** host, so the map will work perfectly on production the moment it ships —
which is exactly why it must be gated deliberately rather than left to chance. Nothing without a production
service is visible on production unless explicitly allowed, and the maintainer decides when it moves
(#1229). So:

- gate it with `TestingService` / `isTesting`, as the bus routes and the vector basemap are;
- add it to `DEVELOPMENT_ONLY_SERVICES` in `test/smoke/aggiemap/development-only.ts`, with the pages that
  request it, so the smoke suite **fails** if production ever asks for it.

That last line is what makes the gate real rather than a promise.

### 2. [#2713](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2713) — NCAA Volleyball map (High)

`https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/NCAA_Volleyball_view/FeatureServer`

| Layer | Name | Features |
| --- | --- | --- |
| 0 | Accessible Parking Spaces | 1 |
| 1 | NCAA Volleyball Event Parking Lots | 8 |

**The map's name is `NCAA Volleyball 1st & 2nd Round`.** Games are 4 and 5 December; whether A&M hosts is
announced on **29 November**, so this must be ready to go to production at a few days' notice.

**This is a new map, not an edit of the existing volleyball one.** `volleyball-parking.definitions.ts`
reads a different service filtered by `event = 'Volleyball'`. Reuse its *patterns* - and
`common.definitions.ts` where it fits - but do not change it.

This service is on the **development** host only, so a production build has nothing to read. Gate it the
same way as #2712 and list it in `DEVELOPMENT_ONLY_SERVICES` too.

### Both maps

- A Discover entry, so the map can be found, with keywords.
- Event dates where the configuration takes them (volleyball: 4 and 5 December 2026).
- Before and after screenshots - here "before" is that the map does not exist, so a capture of the new map
  on dev is what the pull request carries - and a release-notes entry in `docs/releases/unreleased/` with
  its *What to test on dev* row.
- `scripts/check-in-volume.sh <branch> ts-events-ngx,aggiemap-angular` at least.

### The report

`home/reports/2026-11-08-32.md`, and say **"report ready: <file>"**. Questions under **Questions for the
director (aggiemap)** with a recommendation - the maintainer is away, so I will hold them and answer what
I can.

## Batch 33 (8 November 2026, from `work (aggiemap)`) — #2713's pull request conflicts; rebase and re-verify (High)

**Batch 32 was good work.** Both maps gate correctly, both take their layer names from their services, and capturing
each one *as production* to show it hidden is exactly the right evidence. [PR 2725](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2725)
(Micromobility) **is merged** and is in the dev build running now.

**[PR 2727](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2727) (NCAA Volleyball) is not.**
It now reports `DIRTY` - merging 2725 first put it in conflict, almost certainly in `all.definitions.ts` and
`test/smoke/aggiemap/development-only.ts`, where both maps register themselves.

### What to do

Merge the current `origin/development` into `feat/2713-ncaa-volleyball-map` and resolve. The conflicts should be
"keep both" - two maps registering side by side - but **read them rather than assuming that**: a registration list
resolved at speed is how an entry silently disappears, and the one that disappears is the one nobody looks at until
29 November.

**Then prove both maps are still registered**, not just that it compiles:
- both appear in `declared-layers.generated.json`;
- both are listed in `development-only.ts` with their pages;
- `development-only-maps.spec.ts` still covers both;
- the check on the merged branch, as you ran it before.

### Worth knowing, because it changes what I told you in batch 32

I told you not to hard-code layer titles. **That was right, and it was nearly reverted on my mistake.** I removed
fourteen such overrides in PR 2720, measured a local build where the layers could not load, saw them fall back to the
service's name, and had the whole thing reverted. Your NCAA screenshot - real layer names, from an untitled hosted
view - is part of what showed me I was wrong.

So: **keep taking names from the services, as you did.** The thing I got wrong was my verification, not your
instruction. The checks that should have existed are now [#2731](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2731).

One genuine caveat from it, which applies to both your maps: **an untitled layer that fails to load shows its
service's name.** Both of yours load on dev today. If either service ever goes missing there, the layer list will read
"NCAA Volleyball view" rather than a sensible failure, and that is tracked on #2731 rather than by you.

### The report

`home/reports/2026-11-08-33.md`, and say **"report ready: <file>"**. Say what each conflict was and how you resolved
it - that is the part worth reading on this one.

## Batch 34 (8 November 2026, from `work (aggiemap)`) — #2731: check a layer's title against the name its service publishes (High)

Batch 33 was right and I verified it rather than taking it on trust: both maps are registered in
`all.definitions.ts`, `development-only.ts` and `declared-layers.generated.json`. [PR 2727](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2727)
is merged and on dev.

**Read [#2731](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2731) in full before
starting.** This batch exists because I got a layer-naming change badly wrong today, twice, and nothing in the suite
could contradict me either time.

### What happened, because it is the specification

[PR 2720](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2720) removed fourteen `title`
overrides so layers would take their names from their services. I then measured a **local** build, saw every layer
reading its service's name - "Muster view", "SoccerParking view" - and had the whole thing reverted as broken.

It was not broken. Those layers had **never loaded**: `loaded: false`, `Failed to fetch`, because a build served from
`127.0.0.1` cannot reach Transportation's services. An untitled layer that fails to load shows its *service's* name,
because `sourceJSON.name` is never read. The mechanism works perfectly when the layer loads - Soccer's parking layer
on dev has been untitled for months and reads "Soccer Event Parking Lots".

So the check has to answer two different questions and never confuse them:

- is this layer's **title** what its service publishes?
- did this layer **load at all**?

### What to build

**1. The probe exposes the layer's own service name.** `sourceJSON.name`, read after the layer loads, as `symbology`
already is. Nothing else here is possible without it - and its absence is why every argument about these names today
was made by reading a document or querying a service by hand.

**2. A declared list of deliberate overrides, with a reason each** - map, layer id, title, why. `docs/map-layers.md`
already requires the reason; making it data lets it be checked. **A unit test asserts every `title` in the definitions
appears in that list**, so a new override cannot be added silently.

**3. A smoke check**, for every layer of every map, against a deployed environment:
- the layer **loaded**, and is not in the override list → its title **equals** its service's layer name;
- it is in the override list → its title equals the **declared** one, so a drifted override is caught too;
- it did **not** load → report *that*, as a load failure, and judge nothing about its name.

That third branch is the whole point. A check that cannot tell "wrong name" from "never loaded" will mislead the next
person exactly as it misled me.

### What you will find, and must not treat as a bug

**Twelve layers fail on dev's main map today** - Construction Zones, Visitor Parking, RNS Spaces, the bike services,
Emergency Phones and others. They are the dev GIS server's missing services, long known. **None shows a fallback name,
only because every one of them still carries a title.** Your check should report them as load failures and move on.

Do not try to fix them and do not add them to the override list.

### Scope

**Only the probe and the suite.** No definition changes - removing the overrides again is #2719 and comes after this,
on the evidence this produces.

### The report and the pull request

One pull request, `Closes #2731`, body from the template, `no-visible-change`. Say in the report **what the check
reports today against dev** - which layers match, which are declared overrides, which could not be judged. That first
run is the baseline #1523 gets worked through.

`home/reports/2026-11-08-34.md`, and say **"report ready: <file>"**.

## Batch 35 (8 November 2026, from `work (aggiemap)`) — #2744: six layers dead on dev from one URL (High)

**Batch 34 is merged** ([PR 2745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2745)). The
layer-title checks are in `development`, and they are what makes
[#2719](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2719) safe to retry later - the work
I got wrong this morning and had reverted. Thank you for building the instrument rather than the opinion.

### The fault

[#2744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2744). `bikeMapUrl` and
`bikeRacksUrl` in `connections.ts` read `${gisHost}`, and the development server answers **499 Token Required**:

| Host | `TS/BikeMap/MapServer` |
| --- | --- |
| `gis.tamu.edu` | **OK** - 6 layers |
| `gis.dev.tamu.edu` | **499 Token Required** |

**The service exists on dev. It is not public there.** The ArcGIS client reports that as "Service not found", which
reads like a missing service and is why this has been misread. It is exactly
[#2695](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2695), where 4-H Roundup's
development view answered 499 and a development build could not draw it.

Six layers on dev's main map are dead from this one URL: Dismount Zones, City Bike Lanes and Routes, Campus Bike Lanes,
Bike Fix Stations, Bike Racks, EV Charge Stations.

### Three parts, in this order

**1. Pin both to production, with reasons.** `connections.spec.ts` already has
`READ_FROM_PRODUCTION_ON_DEVELOPMENT` - a list with a reason each and a test asserting every entry really does read
production. Add these two as 4-H Roundup was added.

**2. A check that finds the next one.** This matters more than the fix. Nothing today notices a service that *should*
be pinned and is not; #2695 was found by a smoke run after a map stopped drawing, this one by the maintainer's eye.

Ask every `${gisHost}` service in `connections.ts`, against the development host, whether a development build could
read it - and fail, naming the service, when one answers 499 or 404 while production serves it.

**The trap, from #2653:** a 499 proves nothing about whether a service *exists* - a nonsense path returns the same
code. The half that matters here is the other one: **a 499 proves a development build cannot use it.**

**3. Flag it on the page.** Where a layer reads production because dev cannot serve it, the dev site should say so -
a small marker beside the layer's name in the Layers list, **development only**. The maintainer's request.

- it must not appear on production;
- it must come from the **same list** as the pin, so a layer cannot be pinned without being flagged or flagged without
  being pinned;
- it should be a property of the layer source, **not a hard-coded list in a component**, or it becomes another thing
  to keep in step by hand.

### Why this one first

[#2742](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2742), a Sustainable Transportation
map, is blocked on it: that map would list six layers and draw none of them on the only environment it is visible on.

### The report and the pull request

Part 1 is visible on dev (six layers that draw), so screenshots and a release note. Parts 2 and 3 can share the pull
request or follow - **say which you chose.** `scripts/check-in-volume.sh <branch> aggiemap-ngx-common,aggiemap-angular`
at least.

`home/reports/2026-11-08-35.md`, and say **"report ready: <file>"**.

## Batch 36 (8 November 2026, from `work (aggiemap)`) — #2756: two pins are coarser than their evidence (High)

**Batch 35 was excellent and is on hold, not rejected.** [PR 2755](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2755)
found three dead services where I had specified one, emptied dev's `allowedLayerFailures`, and collapsed two ways of
pinning into one. That last part answered a question the maintainer had asked an hour earlier about a different
mechanism, without being told.

**Why it is held.** The maintainer looked at your after-screenshot and said: "almost all of the layers on the main map
are prod only - this is crazy. I was pretty sure we had a dev construction layer."

He was right. The markers are accurate about what the code does; **two of the pins are wrong about what is possible.**

### What I measured, 8 November

**Construction** - `constructionUrl` is pinned to `Hosted/TSConstruction_Hosted`, which is 499 on dev. But dev **has**
construction:

| | layer 0 | fields |
| --- | --- | --- |
| dev `TS/TSConstruction/0` | Current Construction A... | 11: `OBJECTID, Name, Number, StartDate, EndDate, Owner, Description, Notes, Link` |
| prod `Hosted/TSConstruction_Hosted/0` | Current Construction A... | 13, lower case |

**Visitor Parking** - `tsMainUrl` is pinned because **layer 6** lacks `SPC_PNT_CNT`. That is true. But the Visitor
Parking layer is **layer 4**:

| `TS_Main` | layer 4 Visitor Kiosks | layer 6 Parking Lots |
| --- | --- | --- |
| dev | **5 fields, identical** | 57, `SPC_PNT_CNT` absent |
| prod | 5 fields | 58, present |

Same eight layers, same names, both hosts. One layer's missing field pins eight layers' worth of consumers.

### The work

**1. Can `tsMainUrl` be pinned per layer?** So layer 6's consumers read production and the rest read their own
environment. A second connection for the space-count layer may be simpler than per-layer pinning - **say which you
chose and why.**

**2. Which two fields does the hosted construction view add**, does any map read them, and if not can dev read
`TS/TSConstruction` with the field names mapped? The case difference is the same problem
[#2722](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2722) must solve for the basemap,
so it may share an answer. **If the hosted view's extra fields are genuinely needed, that is a fine outcome** - write
the reason into the pin so the next person does not re-ask.

**3. Fold the result into PR 2755** rather than a second pull request. It is held for this, and two changes to the
same list in sequence is how a list gets half-updated.

### The general point, which is worth more than the two fixes

**A pin is invisible until something draws it.** These two have been in place since #2653 and nobody questioned them.
The first time they appeared on screen, the maintainer spotted one immediately.

So your marker is working - and what it reveals is that **pinning is per service while at least one reason is per
layer**. A coarse pin quietly removes a whole service from development testing. If per-layer pinning turns out to be
the right shape generally, say so; that is a bigger change than this batch and worth its own issue.

### Also done, so you do not redo it

I corrected [#1745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1745), the GIS team
list: its row said `TS/BikeMap` is "not published at all" when it is published behind a token, and I added a row for
the sixteen Transportation hosted views dev lacks.

### The report

`home/reports/2026-11-08-36.md`, and say **"report ready: <file>"**.

## Batch 37 (8 November 2026, from `work (aggiemap)`) — #2742: a Sustainable Transportation map in the Transportation section (High)

**Batch 36 was the right answer and it is in.** A second connection for layer 6 rather than per-layer pinning is the
smaller change, and your reasoning for why — every other entry in the list is about a whole service — is the part that
makes it reviewable later. Finding that dev *does* have the space counts, under `GIS.TS.SpacePnt_Count.*`, turned a
"missing dataset" into a one-line ask of Transportation. That is the second time this evening a pin turned out to be
coarser than its evidence.

### [#2742](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2742): the map

The Transportation section lists Micromobility (live on dev) and, from the lab's batch 19, Bus Routes. **This is the
third: Sustainable Transportation.**

**It depends on your own batch 35/36 work.** The Sustainable Transportation service has no dev counterpart, so
[PR 2755](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2755) is what makes it readable on
dev at all, and what marks it as production data there. **Branch from `fix/2744-bike-services-on-dev`**, not from
`development`, and say so in the report; I will rebase onto `development` once 2755 merges.

**Follow the Micromobility map's shape** (`micromobility.definitions.ts`, `mapType: 'transportation'`). That is the
pattern the section already uses, and a third map is the point at which a copied-between-definitions helper would
start to look reasonable — so if you find yourself writing one, that is the #2591 tell, and say so instead.

**Development-only**, per [#2753](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2753):
it reads a service, so **build-time exclusion**, not `TestingService`.

### Decided, so you do not re-ask

Both of your batch 36 questions go to the maintainer with **A** as my recommendation — add each to
[#1745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1745) as an ask of Transportation
(rename the dev join to `SPC_PNT_CNT`; publish the hosted construction view on dev or repair the MapServer). Do not
work around either in code. I will confirm after he answers.

### The report

Visible on dev, so before and after screenshots and a release note with its *What to test on dev* row. Check the
projects you touch.

`home/reports/<date>-37.md`, and say **"report ready: <file>"**.

## Batch 38 (8 November 2026, from `work (aggiemap)`) — #2767: Transportation maps are at the wrong URL (High, do now)

**Batch 37 is [PR 2766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2766), merged.** Your
branch sat on PR 2755's commits, which squash-merged, so I cherry-picked your four onto the merged `development`
rather than rebasing; clean, exit 0, and the diff carried only #2742's files.

**The finding that mattered** was not the map: it was that `development-only-maps.spec.ts` demanded every
development-only map's services be on `DEVELOPMENT_ONLY_SERVICES`, which `TS/BikeMap` can never be. Computing the
exemption from the definitions, and adding a smoke check that proves the **gate** rather than the services, closed a
hole that had left Micromobility and NCAA Volleyball asserted only indirectly. Both of your questions were answered as
you proposed; the maintainer accepted losing the unlisted production link.

### [#2767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2767): the URL says parking

The maintainer opened `dev.aggiemap.tamu.edu/parking/micromobility/map/d` and said what the URL should have said:
**`/transportation/<id>`**. A micromobility map is not parking, and the URL is the part a visitor copies and reads.

**The cause is in the issue** — `discover.mapType` picks the All Maps section, `discover.type` builds the URL, and
nothing ties them together, so a map can be listed under Transportation with a `/parking/` path. Read the issue; it
names the files.

**The part I care most about is point 2:** decide whether the segment is derived from `mapType` or whether these maps
gain `type: 'transportation'` — and make it so that **a map listed under Transportation cannot keep a `/parking/`
URL**. Two independently settable properties that must agree is the fault itself, not just its symptom. Say which you
chose and why.

**Do not move the other `/parking/` maps.** Football, soccer, volleyball and the rest are parking maps, listed under
Parking, public on production, and their URLs are right.

**`/parking/<id>` must keep working**, redirecting. Both maps are development-only so no public link exists, but a URL
that 404s silently is worse than one that moves.

### Decide and report, do not guess

**The bus map is in this section and has no `/parking/` URL** — it is `/map/d/bus`, a panel of the main map (#2743).
Say whether it should become `/transportation/bus` too, with your reasoning. It decides whether `transportation` is
"a section" or "a kind of map", so I would rather have your argument than your assumption. If you think it should
stay, say that.

### Watch for

- **#2742 and #2753 both merged tonight** and both touch what you are about to change: the smoke gate check asserts
  `/parking/<id>` lands under `/map` on production, and `development-only-gates.spec.ts` reads the listings. Branch
  from the current `development` and expect to update both.
- `global-setup.ts`'s crawl and `DEVELOPMENT_ONLY_CONTROLS` name these routes too.

### The report

Visible on dev, so before and after screenshots and a release note with its *What to test on dev* row. Check the
projects you touch.

`home/reports/<date>-38.md`, and say **"report ready: <file>"**.

## Batch 39 (8 November 2026, from `work (aggiemap)`) — #2768 then #2765: stop hard-coding what the services already say (Medium)

**Batch 38 is [PR 2773](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2773), open.** Your
design call was right and the maintainer took it: the **section** decides the address, not a new `type`. Your reason
is the one that settles it — a new `type` leaves two properties that must agree, which is the bug, and deriving the
address makes disagreement impossible by construction rather than caught by a test. `MapAddressGuard` keeping the
rest of the address was the detail I would have missed.

**Two things you should know about the merge.** You found the red trunk independently and fixed it; so did I, about
twenty minutes earlier, in [PR 2770](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2770),
which had already merged. **Yours was the better fix and I kept it**: `checkedMaps` asserts the suite opens the map's
address, where mine waived the requirement for a map with shared services. An exemption says "do not ask for proof";
yours says "here is the proof". I removed mine rather than leave one rule with two implementations.

That duplication was my fault, not yours — you had no way to know 2770 existed. I will tell you when I am working in
your area.

**The bus map stays at `/map/d/bus`**, on your argument. The lab is recording that decision in the code.

### 1. [#2768](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2768): April Ring Day, listed again (do this first, it is small)

`visible: false` with no reason recorded, while October and November Ring Day carry no such flag. The maintainer has
confirmed it should be listed. Remove the flag and its `LISTINGS_HIDDEN_FROM_PRODUCTION` entry, then **look at the
page** — it is a spring map, so check where it lands and that the column reads sensibly beside its two siblings.

### 2. [#2765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2765): the override sweep

This is the maintainer's standing goal made systematic: **no front-end change should be needed when the GIS team
renames a layer, reorders layers or changes symbology, unless there is a specific reason.** The registry
([#2745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2745)) has **202 entries**, almost
all marked `unreviewed (#1523)`.

**Ask every service, then remove every override that merely restates it.** Eight graduation entries are known to
repeat their service word for word; #2634 removed two others by hand the same way.

**Three things that decide whether this goes well:**

- **Ask the service; never reason from the definition file.** [PR 2720](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2720)
  was reverted because I judged removed overrides broken on a build where the layers had never loaded — a missing
  title and a service-supplied title look identical on screen. Query both GIS hosts. Where you capture, assert
  something that only exists when the layer actually resolved, as a legend entry does.
- **Where a title goes, its registry row goes with it**, in the same change.
- **For the rest, the outcome is a reason, not a removal.** `docs/map-layers.md` says an override needs a reason
  written beside it; replacing `unreviewed (#1523)` with a real one is worth as much as a deletion.

**Scope it and say where you stopped.** 202 is a lot. If it is better as "every event map" or "every service that
answered", do that and report the rest rather than rushing the tail. A partial sweep with a clear boundary is more
useful than a complete one I cannot trust.

**Hold it off `development` until the maintainer has tested tonight's release** — have the branch ready and say so;
I will open the pull request when he is done.

### The report

Both are visible, so before and after screenshots and release notes with their *What to test on dev* rows.

`home/reports/<date>-39.md`, and say **"report ready: <file>"**.

## Batch 40 (9 November 2026, from `work (aggiemap)`) — #2707: the buildings layer cannot be hit-tested (Urgent, do now)

**The release is held on this.** Nothing else in this batch. The maintainer reported it from dev this morning with two
screen recordings, and the cause is found and measured — what is left is the fix, the proof, and a check that stops it
coming back.

### The fault, already established (do not re-derive it)

`buildings-layer` reads `TAMU_Basemap_20261008/MapServer/1` ("Structure Data") and takes the service's symbology, as
[`docs/map-layers.md`](../docs/map-layers.md) says it should. The service returns:

```json
{ "type": "simple", "symbol": { "type": "esriSFS", "style": "esriSFSSolid",
  "color": [252, 189, 204, 0],
  "outline": { "type": "esriSLS", "style": "esriSLSNull", "color": [110,110,110,255], "width": 0 } } }
```

**Fill alpha 0, null outline, width 0 — the layer draws nothing.** Every building footprint on screen is the basemap's;
the feature layer is an invisible click target over it. A fully transparent symbol is not reliably hit-testable, because
`view.hitTest` reports what was rasterised and nothing was.

Measured on dev build `863ed2b51`, `view.hitTest` at each building's centroid and at a point a quarter of the way in
from a vertex, asking whether `buildings-layer` is among the results:

| Building | centroid | inside the shape |
| --- | --- | --- |
| Davis Football Player Development | no | no |
| Bright-Slocum Center | no | no |
| Kyle Field | no | yes |
| Student Recreation Center | no | yes |
| Events Pavilion in Aggie Park | no | no |
| Hagler Center | yes | no |
| West Campus Parking Garage, Coolidge, Adam C. Sinn, Billy Pickard | yes | yes |

**Ruled out, with measurements — do not spend time on these:** projection (view, layer and vector basemap are all
`wkid 102100` / `latestWkid 3857`), labels (`labelClasses: 0`, service `labelingInfo: none`; the labels on screen are the
basemap's), scale (`minScale 36000`, measured at 1:2257 and 1:9028), and this release (the service is the same
everywhere, and production behaves the same).

Full write-up, with the recordings' numbers:
[#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707#issuecomment-6740241755).

### 1. Red first, and this one needs a running build

The fix is in the application, so prove it against **your own dev server**, not a deployed environment:
`test/smoke/aggiemap/run-local.sh local`, with `aggiemap-dev` running from your worktree.

**The red proof is a hit-test measurement, not a popup one.** Ask the map's own `view.hitTest` at the centres of
buildings taken from `buildings-layer` itself — query the layer for the features in the current extent, take each
`geometry.centroid`, convert with `view.toScreen`, and record whether `buildings-layer` is among the hit results.
Record the same buildings before and after, in the same extent, so the two runs are comparable.

**Not a fraction of the viewport.** `popup.spec.ts` clicks `box.width * 0.117`, which is how
[#2701](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2701) item 3 came to click Evans
while asking for Harrington. A point taken from the feature's own geometry is the building wherever the framing puts it.

### 2. The fix

Override the renderer where `buildings-layer` is declared —
`libs/aggiemap/ngx/common/src/lib/definitions/main.definitions.ts`, the `native` block — with a fill alpha of **1**
instead of 0. Invisible to the eye, rasterised, hit-testable.

**Write the reason beside it**, as `docs/map-layers.md` requires: what the service returns, why the override exists,
and that it can be removed when the service publishes a hit-testable symbol. An override with no comment is
indistinguishable from an oversight — that is how 95 of them accumulated.

**Say whether alpha 1 is enough**, or whether the null outline has to be replaced too. Measure rather than assume; if
alpha alone fixes it, leave the outline as the service has it.

### 3. It has to work on every map, because that is the complaint

The maintainer's words: *"Map clicking to select features on the map needs to work on all maps, not just the main
map."* `buildings-layer` is declared once and used everywhere, so one override should cover all of them — **prove it**:
measure on the main map and on at least two others, one of them an event or parking map
(`/parking/avp-parking/map/d` is the map in his recordings).

### 4. The check that stops it coming back

[#2778](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2778) is the standing click grid, and
this measurement is the method it wants. **Add the spec in this pull request**: click building centres taken from the
layer, at human speed, and assert the popup names **the building just clicked**. It must fail on the unfixed code.

If it is better as its own pull request, say so rather than doing it — but the fix must not merge with nothing watching
it.

### Also

- Screenshots before and after, and a release-notes entry with its *What to test on dev* row: this is visible.
- **Do not open the pull request**; push the branch and say "branch ready".
- The service is the real fault. Draft the row for
  [#1745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1745) asking the GIS team to
  republish layer 1 with a hit-testable symbol, and put it in your report rather than filing it — the maintainer
  decides what goes to them.

### The report

`home/reports/2026-11-09-40.md`, and say **"report ready: <file>"**.

> ### Added to batch 40 (7:05 AM Central, 9 November, from `work (aggiemap)`) — two things, after the maintainer asked how the fix should work
>
> **1. Measure the renderer options against each other before committing to one.** My "alpha 1" recommendation is the
> usual Esri behaviour, not something measured here, and today's results are *partially* successful at alpha 0 — the
> rasterisation is marginal rather than absent. If alpha 1 is equally marginal the fix is a coin flip. So run the same
> buildings, in the same extent, three times:
>
> | | |
> | --- | --- |
> | alpha 0 | today's behaviour, the red proof |
> | alpha 1, outline left as the service has it | the proposed fix |
> | alpha 1 plus a hairline outline (width 0.5, alpha 1) | the fallback if alpha alone is marginal |
>
> **Report all three rates**, and take the smallest change that is reliable. If none of them is, say so plainly — that
> result sends the fix to querying the layer by the clicked point instead of hit-testing it, which is a different and
> larger change, and finding that out early is worth more than a fix that half works.
>
> **The contrast that says the shape is right:** the same basemap's layer 9, *Surface Parking*, is published with an
> opaque fill (`alpha 255`) and a 0.4 px outline, and clicks on parking lots work. Layer 1, *Structure Data*, is the one
> published invisible and the one that does not answer. One difference, matching behaviour.
>
> **2. The routing half of #2707 may have a different cause — check, do not assume.**
> `libs/maps/feature/trip-planner/src/lib/services/trip-planner.service.ts:378` finds `buildings-layer` and queries it
> with `queryFeatures`, not `view.hitTest`. A query does not care what the layer draws, so **this fix may not touch the
> routing-stop symptom at all.** Say which path routing actually uses and whether your fix changes it. If it does not,
> that is a finding worth reporting, not a gap to quietly leave: #2707 has carried both symptoms as "believed to be one
> fault" since 6 November, and that belief is now testable.

> ### Batch 40 revised (7:15 AM Central, 9 November, from `work (aggiemap)`) — the source changes, and your measurement changes the diagnosis
>
> **Your hold was right and your measurement is better than mine.** 280 of 280 at alpha 0, once the layer view had
> finished updating, against my 13 of 20. I never waited for `layerView.updating === false` — my probe reported
> `updating: true` throughout and I measured anyway. **So "the transparent symbol is not hit-testable" is not
> established**, and the alpha-1 result I sent you is suspect for the same reason. Treat both as withdrawn.
>
> That leaves a real contradiction, and it is now the interesting part: **headless, settled, alpha 0 works; the
> maintainer's own Chrome does not.** Candidates, in the order I would test them: the layer view never settling on his
> map, a headed-versus-headless rasterisation difference, or clicks arriving while the view is still updating. Your
> PR 2718 click-query note is the fourth.
>
> ### What the maintainer has decided
>
> > "buildings-layer needs to come from the vector source. We are not going to use the old map service any more. Make
> > everything work from the vector tile layer and the services that it is based on."
>
> ### What I have established about that source, so you do not repeat it
>
> **`https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/FeatureServer`** is the vector basemap's companion
> feature service — the one you already spotted the campuses using. It answers on the **production** GIS server with no
> token, which matters: the vector *tiles* are development-only ([#1229](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1229)),
> but this FeatureServer is not, so buildings can move to it without waiting on that.
>
> **Layer 0, "Campus Structures"** — against today's `TAMU_Basemap_20261008/MapServer/1` ("Structure Data"):
>
> | | old (MapServer/1) | new (VTBase3/FeatureServer/0) |
> | --- | --- | --- |
> | features | 1003 | **1984** |
> | fields | `BldgName`, `Number`, `BldgAbbrev`, `Address`, `BldgNum` … | the same set, **lower case**: `bldgname`, `number`, `bldgabbrev`, `address`, `bldgnum`, plus `isbldg`, `creationdate`, `editdate` |
> | fill | `[252,189,204,0]` — invisible | **`[100,200,200,255]` — opaque teal**, solid outline |
> | minScale | 36000 | 36000 |
> | spatial reference | 102100 | 102100 |
>
> **Three things follow, and each is a decision you should take and justify rather than guess at:**
>
> 1. **The field case.** Everything that reads a building reads `BldgName` and friends — the popup, the three search
>    sources, the directory page. This is the same fault
>    [#2722](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2722) has to solve for the
>    basemap, so look there first and share an answer if there is one.
> 2. **1984 against 1003.** Nearly double. `isbldg` exists on the new layer, so some of the extra may not be buildings.
>    **Find out what the extra 981 are** before deciding whether the layer needs a definition expression. Do not filter
>    blind, and do not assume the old count was right either.
> 3. **The symbology is opaque teal.** Drawn as published it would paint teal over the basemap. An override is needed,
>    and this is where your #1526 finding lands.
>
> ### Your #1526 finding is the most important thing either of us has found today
>
> `1da11a41b` removed `color: [0, 0, 0, 0.01]` from `buildings-layer`, from `campusClickOverlayNative` (all ten
> satellite campuses) and from the dining kiosk's buildings layer, under "draw every layer the way its service
> publishes it". **That 1% fill was not decoration — it was there so the layer could be clicked**, and nothing recorded
> that, so removing it looked like tidying. `campus-overlay.definitions.ts` still claims a 1% fill in its comment,
> which is now false.
>
> **Put that on [#2707](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2707) as its own
> comment before anything else**, with the commit and the three call sites. Whatever the final fix is, "a click target
> needs a fill, and the reason must be written beside it" is the lesson, and it is exactly what
> `docs/map-layers.md` exists to prevent. It also means **the ten satellite campuses may have the same fault right
> now** — check one and say.
>
> ### The work, in order
>
> 1. **Settle the contradiction first**, because it decides whether the move even fixes anything. If alpha 0 is
>    hit-testable once settled, the fault is timing or the headed browser, and changing source alone will not fix it.
> 2. **Then the move**: `buildings-layer` to `VTBase3/FeatureServer/0`, with the field case, the count and the
>    symbology each decided and written down.
> 3. **Then the check**: still the red-first spec that clicks building centres by name and asserts the popup names that
>    building. It must fail on today's code.
> 4. **Routing is out of scope** — your `featuresIntersectingPoint` finding settles that it never used `hitTest`. Put
>    that on #2707 too; it has carried both symptoms as one fault since 6 November.
>
> **Do not touch `surface-lots-layer` or the campuses in this branch**, even though layer 6 is Surface Parking and the
> same move applies. One change per pull request; say what you would do and I will batch it.

> ### Batch 40, the move is on (7:35 AM Central, 9 November, from `work (aggiemap)`)
>
> **The maintainer's decision: start the move now, handling the padding defensively in our code.** He also chose
> characterising the failed queries over chasing the latency, so the latency stays a recorded number, not a hunt.
>
> **But check your padding blocker before you build anything for it — I think it is not there.** Asked of both
> services, same building:
>
> | | old `MapServer/1` | new `VTBase3/FeatureServer/0` |
> | --- | --- | --- |
> | `BldgNum` / `bldgnum` | `0468` + six spaces | `0468` + six spaces |
> | `Number` / `number` | `0468` | `0468` |
>
> **The padding is identical in both, and it is not new.** And `?bldg=` does not read that field: `BUILDING_EXACT` in
> `search-sources.ts` queries `where: { keys: ['Number'], operators: ['='] }`, which is unpadded on both services. So
> the deep links are untouched by the move as long as you keep using `number`.
>
> **If you were planning to key the link on `bldgnum`, don't** - that is what would introduce the padding problem
> rather than inherit it. If you meant something else by the blocker, say so, because it changed the maintainer's
> answer and he should know if it was wrong.
>
> **What the move actually is, then:**
>
> 1. **Field case across the call sites** - `Number` to `number`, `BldgName` to `bldgname`, `BldgAbbrev` to
>    `bldgabbrev`, and the rest. You counted about fifteen. This is [#2722](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2722)'s work and the maintainer's decision unblocks it - **record the decision on #2722** rather than
>    leaving that issue waiting on an answer that has arrived.
> 2. **The extra 1,021 rows.** Your `bldgnum IS NOT NULL` gives today's 963. Say what the extra rows are before you
>    filter, and put the reason in the definition, not only in the report.
> 3. **The symbology, and this one is the interesting one.** The new service publishes an opaque teal fill
>    `[100, 200, 200, 255]` with a solid outline. Drawn as published it paints over the vector basemap's buildings -
>    which, by your own Galveston finding, is exactly what the campuses are doing wrong right now. So buildings needs a
>    near-invisible fill, **which is reinstating what #1526 removed**.
>
>    **Write the reason beside it, properly**: that the layer exists to be clicked, that the basemap draws the
>    buildings, that an opaque fill would double-draw them, and that #1526 removed this fill once already because
>    nothing said why it was there. That comment is the whole point of `docs/map-layers.md` and it is the thing that
>    stops this recurring a third time.
>
> **Scope:** buildings only in this branch. `surface-lots-layer` is layer 6 on the same new service and the same move
> applies, and the ten campuses need the opposite fix (a transparent fill, not an opaque one). Say what you would do
> for each; I will batch them. One change per pull request.
>
> **The spec still comes with it**, as agreed: correctness gates, per-click time only recorded, and a gating assertion
> that no buildings query failed - the HTTP 200 failures are the thing nothing has ever checked.

## Batch 41 (9 November 2026, from `work (aggiemap)`) — the rest of the feature layers off `TAMU_Basemap_20261008` (High, do now)

**Batch 40 is open as [PR 2786](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2786).** The
body is yours almost unchanged; both image links verified 200 before it went up. The red being *observed* rather than
forced, and every miss landing inside a failed query's envelope, is what makes it an argument rather than a claim.

### Your questions, answered

1. **#2785 recovery: A, your recommendation** — retry an error-body query in a request interceptor, with the lab's
   `hasAllFeaturesInView` fallback as the second line. A lost tile is features missing from the *map*, not only from
   the hit test, and only a retry fixes both. **Not yours and not now**: the lab is building the fallback, and the
   retry goes on #2785 as a comment for whoever takes it.
2. **`popup.spec.ts`'s `?bldg=0468` sequence: A**, rewrite it to take its buildings from the layer's geometry. **Not
   now** — it is red for a reason we understand and it is not this fault.
3. **The campus click overlays: A**, the fill back with its reason and the false comment corrected, its own pull
   request. **Not now.** It is a real visual regression on ten campuses and it is queued, not forgotten.
4. **The rest of the service: A, and it is this batch.**

### The work

**The maintainer has said twice that nothing is to point at `TAMU_Basemap_20261008/MapServer`.** Batch 40 moved the
buildings. This batch moves the remaining feature layers.

| Old | Used by | New |
| --- | --- | --- |
| `/9` Surface Parking | `main.definitions.ts`, `search-sources.ts` | `VTBase3/FeatureServer/6` Surface Parking |
| `/12` Wall Area | `ues-operations-angular` definitions | `VTBase3/FeatureServer/9` Wall Area |
| `/0` Garage Parking (10 rows) | `search-sources.ts`, `ues-operations` | **unknown — establish it** |
| `/2` University Building (1802 rows) | `basemaps.definition.ts` | probably `VTBase3/FeatureServer/0` — **establish the filter** |

**Ask the service for each, as batch 40 did.** The two unknowns are the work:

- **The 10 garages.** `VTBase3/FeatureServer/7` "Private Parking Lot" has 14 rows and is not obviously it. They may sit
  inside Campus Structures. **If there is no equivalent, say so and stop at that layer** — a missing garage layer is a
  data question for the GIS team, not something to approximate.
- **University Building, 1802 rows, against Campus Structures' 1,984.** Batch 40 found `number IS NOT NULL` gives 1,003,
  matching old `/1`. Find what gives 1,802, or say plainly that nothing does.

**For each layer moved, as in batch 40:** the field case at every reader, the row count compared old against new and
the reason written into the definition, and the symbology checked rather than assumed — the new service publishes
opaque fills where the old one published invisible ones, and a layer that is drawn by the basemap needs the same
near-invisible treatment `buildingsClickLayerNative` now documents.

**Measure the new layers' failure rate** the way batch 40 did. The old service's Surface Parking failed 1.7%; if its
replacement is clean, say so with numbers, because that is the argument for the move.

### Not in this batch

**The raster basemap and the GIS Day MapLibre tiles.** Those are the vector basemap switch, and they change what
production *draws*. Your #1229 finding — VTBase3's VectorTileServer on production in wkid 102100, 23 levels, and the
"State Plane, development only" record describing the old `Hosted/VTBase` — has gone to the maintainer as the one
decision that is genuinely his. **Do not start it.**

### The report

`home/reports/<date>-41.md`, and say **"report ready: <file>"**. Branch to the fork, `.pr-body.md` last, no pull
request.

## Batch 42 (9 November 2026, from `work (aggiemap)`) — #2788: gate the Transportation section (High)

**Take this when batch 41 is pushed.** It is small and it is in machinery you built.

**The maintainer's decision, 9 November:** the Transportation section of All Maps is development-only until he says
otherwise. It is not gated today, so a production build ships it.

### What is ungated

- **The tile.** `VisitMapsNavComponent` marks a development-only tile with `isDev: true` and the template renders it
  only when `isTesting`. The **Transportation** tile (`/all-maps/transportation`, [#2737](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2737)) has no `isDev`. `Code Maroon` is the
  only tile that carries one.
- **The route.** `/all-maps/transportation` in `discover.routes.ts` has no `DevelopmentOnlyMapGuard`, so the page
  answers on production even with the tile hidden.
- **The suite.** `DEVELOPMENT_ONLY_ALL_MAPS_TILES` is `['Code Maroon']`.

### Worth knowing before you write it

**On production the section would list nothing.** Both its maps are already `developmentOnly` — Micromobility
(#2712) and Sustainable Transportation (#2742). So today's fault is a reachable, empty category, which is worse than
the maps being visible. Say in the pull request that this is what was shipping, because it is the argument for the
change.

### The work

Gate the tile and the route together, at **run time**, as `CLAUDE.md` says structure is gated: `isDev: true` on the
tile, `DevelopmentOnlyMapGuard` on the route. Add `Transportation` to `DEVELOPMENT_ONLY_ALL_MAPS_TILES`, and make sure
`development-only-gates.spec.ts` — your own check from #2753 — agrees rather than newly disagreeing.

**Red first**, and the honest red here is the smoke check: on today's code the tile is present on production. Say how
you proved it.

**One thing to decide and write down:** whether the guard belongs on the route alone or whether `mapSegment`'s
`/transportation/<id>` addresses need the same treatment. The two maps already carry their own gates, so I believe the
section route is enough — **check that a production build cannot reach either map by its direct address**, and say so
either way.

Visible change, so before and after, a release-notes entry with its *What to test on dev* row, and the check's exit
code.

### The report

`home/reports/<date>-42.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request.

## Batch 43 (9 November 2026, from `work (aggiemap)`) — #2801: hide the trip planner's Options on production (High, do now)

**Batch 42 is open as [PR 2798](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2798) and the maintainer has merged it, along with 2790 and 2795.** The red you built for it —
development served as production, failing rather than skipping, `Expected 0 Received 1` — is exactly the shape I asked
for after the lab's `bus.spec.ts` finding, and it is why I could open it without checking the gate myself.

### The work

The maintainer's words, 12:21 PM Central:

> We need to disable the option to select ADA routing since it is not currently supported in the network. I recommend
> that we simply hide the options panel (both the leave now and options link) on the production release as the immediate
> solution. Both should remain available on dev, but not be visible on prod.

**Half of it is already true.** In
`libs/maps/feature/trip-planner/src/lib/components/trip-planner-mode-picker/containers/base/base.component.html`, the
time picker is already behind `@if ((isDev | async) === true)`, fed by `TestingService`'s `isTesting`. **The Options
link beside it is not**, and it opens a panel whose only control is *Accessible Friendly Directions*.

1. **Gate the Options link the same way.**
2. **Check the container does not leave an empty bar** on production with both children gone. Look at it; do not assume.
3. **Gate the route, not only the link.** `./options` is a router link, so hiding the link leaves the page reachable by
   address — the same fault #2788 was filed for one level up. You now have `DevelopmentOnlyMapGuard` reading
   `developmentOnly` from route data; say whether it fits here or whether this needs something else.
4. **Record it in `DEVELOPMENT_ONLY_CONTROLS`** in `test/smoke/aggiemap/development-only.ts`, with the address that
   brings it up — it is a control, not a sidebar tab. **The check must fail on today's code, not skip**, as yours did
   for #2788.

### The reason goes in the code

This hides a control; it does not fix the network. Put the reason beside the gate with the issue number — that
accessible routing is not supported by the routing network — so whoever can turn it back on knows what has to be true
first. A gate with no reason beside it is how PR 1526 removed a fill that existed for a reason, which cost us most of
this morning.

### The report

`home/reports/<date>-43.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request. Visible
change, so before and after on production and dev, a release-notes entry with its *What to test on dev* row, and the
check's exit code.

## Batch 44 (9 November 2026, from `work (aggiemap)`) — #2804: have routing on production ready before the service is public (High)

**Take this when batch 43 is pushed.** The maintainer: *"They are making it public now. Do all that you can without it
being public for now to get ready for when they click the button."*

### Where it stands

`RoutingProPublish` **is** published on the production GIS host and answers **499 Token Required** at the folder, the
MapServer, the NAServer and `NAServer/Route`, measured at about 1:10 PM Central. The `Routing` folder production's
`routingBaseUrl` points at still has **0 services**. The GIS team is making it public now.

**So everything except the final verification can be built and proven today.** Build it; do not merge it.

### What to prepare

1. **How production reaches the network.** `routingBaseUrl` is `https://<gis host>/arcgis/rest/services/Routing` and the
   planner discovers services under it. The network is **outside** that folder, which is exactly why development needed
   `developmentRoutingBaseUrl` pinned. Decide: production's connection pinned the same way, or discovery changed, or
   the GIS team asked to move it into `Routing`. **Say which and why**; this is the decision in the change.
2. **The wholesale gate comes off.** `sidebar-trip-planner.component.html` and mobile `trip-planner-top.component.html`
   wrap the planner in `@if (dev | async)` with the maintenance message. Removing it is the change, but **it must not
   merge before the service is public** - production would show a planner that cannot route.
3. **#2801 must be in first.** Accessible routing is unsupported by the network, so the Options gate has to be in place
   before the planner appears on production. **These two must not cross.** Your batch 43 branch is the one that does it.
4. **The smoke expectation inverts.** `developmentRoutingBaseUrl` is in the development-only lists so production never
   requests routing. That becomes the opposite: production must request it, and the check must fail if it does not
   answer.

### The test, and this is the part that matters

**Not that the panel renders. That a route comes back.** The failure mode is a service answering 499, or nothing, while
the interface looks perfectly healthy - which is what production would have done all along if the gate had been removed
blindly.

So: a check that asks for a route between two real points and asserts a path is returned, with a distance or a geometry
rather than a 200. **Prove it on development now**, where the network works, so it is a known-good check before it is
ever pointed at production. Then it is ready to run the moment the service is public.

Say in your report what it would take to run it against production, so that when the button is clicked the sequence is
a command rather than a design.

### Do not

- Merge anything that unhides the planner.
- Assume the service will be public in the form you expect - when it opens, the first thing to establish is whether it
  answers anonymously at the URL the application will actually use.

### The report

`home/reports/<date>-44.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request.

## Batch 45 (9 November 2026, from `work (aggiemap)`) — clear the suite's standing reds before the release (Medium)

**Take this after batch 44.** Queued now so you are not waiting on me. It is smaller than it looks and it is the last
thing making every run's output need a person to triage it.

**[#2797](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2797): two standing reds nobody acts on.**

1. `search-sources.spec.ts`'s "every source has a case" fails on `nature-rx` and `nature-rx-exact`, added by
   [#2633](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2633) without cases. Give them cases, or record why they cannot have one.
2. `busstop=4215` fails **on production** and passes on development. Find what is different about that stop, then fix it
   or record it as an allowed failure tied to #2797 with the reason.

**And the third, which has no issue yet and should get one from you:** `popup.spec.ts`'s `/map/d?bldg=0468` sequence
([#2701](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2701) item 3). It is red because it clicks a **fraction of the viewport** and lands in Evans Library. You
recommended rewriting it to take its two buildings from the layer's geometry as `building-clicks.spec.ts` does, and
that is right — file it, then do it here.

**Why this matters more than it looks.** Every pull request today carried "the known reds that predate this change" in
its verification section, and a reader has to take that on trust. A standing red everyone steps over is indistinguishable
from one nobody noticed — which is the same failure as a check that skips, and we have hit that three times today.

**If any of the three turns out to be a real fault rather than a stale check, stop and tell me** rather than recording
it as allowed. The point is to make the suite's output trustworthy, not quiet.

### The report

`home/reports/<date>-45.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request.

> ### Batch 44 rewritten (2:00 PM Central, 9 November, from `work (aggiemap)`) — the blocker was mine, and the answer is one expression
>
> **Everything I told you about 499 Token Required was measured against the wrong host.** Megan reported that
> production's routing layer is already public and that the application reads an outdated one. She is right.
>
> **Measured anonymously, no token, 1:55 to 2:00 PM Central:**
>
> | Host | `RoutingProPublish` |
> | --- | --- |
> | `gis.dev.tamu.edu` (`tsgisHost` on development) | **OK** — `Map` MapServer, `Map` NAServer |
> | `gis-dev.it.tamu.edu` (today's `developmentRoutingBaseUrl` pin) | OK — the same two |
> | `arc.ts.tamu.edu` (`tsgisHost` on production) | **OK** — the same two |
>
> Both NAServers expose a `Route` layer. **The maintainer confirms development and production hold the same data.**
>
> ### So the change is almost certainly one expression
>
> ```ts
> routingBaseUrl: `https://${tsgisHost}/arcgis/rest/services/RoutingProPublish`
> ```
>
> `tsgisHost` is already `gis.dev.tamu.edu` on development and `arc.ts.tamu.edu` on production, and it is what parking
> and event services already use. That would make **`developmentRoutingBaseUrl` unnecessary** — the pin exists only
> because the network sat on a host nothing else used.
>
> **Check that rather than take it.** The trip planner *discovers* services under `routingBaseUrl`; `RoutingProPublish`
> is a folder with one `Map` service rather than the `Routing` folder it was written for, so confirm the discovery
> works against this shape on both environments before deleting anything. If it does not, pin both and say why.
>
> ### What else changes with it
>
> - **Remove `developmentRoutingBaseUrl`** if the expression above holds — and with it the development-only entry that
>   exists so production never requests it. **That expectation inverts**: production must now request routing, and the
>   check must fail if it does not answer.
> - **The wholesale gate comes off** (`sidebar-trip-planner.component.html` and mobile `trip-planner-top`), but **not
>   before #2801 is in**. Accessible routing is unsupported by the network, so the Options gate has to land first.
> - **The test proves a route comes back**, between two real points, with a geometry or a distance — not that the panel
>   renders. Prove it on both environments now; both answer anonymously, so there is nothing to wait for.
>
> **Nothing is blocked on the GIS team.** Build it out for the production release.

## Batch 45 revised (9 November 2026, from `work (aggiemap)`) — #2778, taken over from the lab (Urgent)

**Take this when batch 44 (#2804) is pushed.** It replaces the batch 45 I queued earlier (#2797, the standing reds) —
that moves behind this one.

**The maintainer's decision:** you take #2778 over from the lab. It is Urgent, it is half-built, and it is changing
hands, which is the easiest way in the world to lose a branch.

### What exists

`test/2778-click-grid-every-map` on the fork, from the lab. **There is no batch report for it** — #2812 jumped its
queue and it never came back. I have asked the lab for a handover note in `work-lab-leila/reports/`: what is on the
branch, what it proved and how, which maps it had decided to cover and at what cost, and what it had not settled.
**Read that before you touch the branch**, and do not re-derive decisions it already made or re-run measurements it
already has.

### What #2778 is

The maintainer's requirement, in his words: *"Map clicking to select features on the map needs to work on all maps,
not just the main map."* A standing check that clicks a known set of points on every map and reports a **rate**, so
that whether clicking works everywhere is a number rather than a reviewer's impression.

**You already own most of the method.** `building-clicks.spec.ts` is yours: it takes buildings from the layer's own
geometry through `view.toScreen`, asserts the popup names the building clicked, asserts `view.hitTest` finds the layer,
and fails the run on any failed buildings query. **Extend that. Do not write a second click spec** — two click specs is
how we ended up with two copies of the map-address rule (#2775).

What #2778 adds beyond your three maps: which maps to cover and at what cost (the crawl finds 83; measure before
choosing), whether lots as well as buildings, a threshold rather than all-or-nothing, and a framing that is pinned or
read rather than assumed.

### Two traps that are now written down

- **A check that skips is worse than one that fails** — the lab's `bus.spec.ts` finding, and yours in #2788. If a map
  has no buildings in view, say so; do not quietly pass.
- **Do not sample the rows a filter removes** (#2794). `queryFeatures` with no `where` returns `objectid` order, and on
  the buildings layer the low ids are the 981 unnumbered rows. That cost us two hours this morning.

### The report

`home/reports/<date>-45.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request.

## Batch 46 (10 November 2026, from `work (aggiemap)`) — #2821 and #2776: the suite's own faults

**None of this goes in the release** — the maintainer has said these fixes come after it. The release-tier run on
development is done: 999 passed, 15 failed, and every failure traced. Everything new in the build passed, routing
included.

### 1. [#2821](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2821): specs resolve fixtures through production's host

Four of the fifteen failures. Since [#2667](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2667) a development build reads Transportation's **development** services, but several specs
resolve their fixtures through `Connections`, which under Node returns **production's** host. So the spec looks a
feature up on one server while the application draws it from another.

**In every one of the four, the application was right.** `?lot=100j` selected space 15548, which dev's service says is
`100j`, `M/C`; the spec asked production, where 15548 does not exist.

**The design question is the work**, and the issue states it: resolve the environment's own host, or stop naming object
ids and pick a feature by querying the environment first — which is what your own `building-clicks.spec.ts` does, and
why it does not have this problem. **I think the second is right**, because an object id is a fact about one server and
nothing stops it drifting again. Say which you took and why.

[#2777](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2777) is the AVP instance filed on its own; closing it with this is fine if your fix covers it — say so.

### 2. [#2776](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2776): the tailgating kiosk check calls a real layer a main-map leak

`kiosk.spec.ts`'s hand-kept `TAILGATING_KIOSK_LAYER_IDS` never gained `tailgating-restrooms`, added by #2661. The
kiosk draws the tailgating map's layers by design — its unit spec requires exactly that — so the failure message names
a fault that is not happening.

**It will start failing on production the moment that layer ships**, so it is not a development-only annoyance.

Worth considering rather than just adding the id: the list is a second copy of what the definition already declares.

### The report

`home/reports/<date>-46.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request. Two branches.

## Batch 47 (10 November 2026, 1:55 AM Central, from `work (aggiemap)`) — #2758: one sidebar, not two

**Batch 46 is open as pull requests.** [PR 2825](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2825) (#2821, closing #2777 with it) and [PR 2826](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2826) (#2776), both ready
rather than drafts, fields set, issues In Progress. I dropped the `.pr-body.md` commit with a follow-on commit rather
than a force-push, so the net diff is your spec files alone.

Two things in your report were worth more than the fixes. **Finding your own fault before pushing** - the probe
reporting `drawing === false` while the snapshot is still empty - is the kind of thing that normally reaches a reviewer.
And the **mutant run** on #2776, leaving the buildings out to prove the leak check still fires, is a check on your own
check; please keep doing that.

**Your production heads-up is doing work.** `directions.spec`'s popup cases being red on production until the release
deploys is now on the maintainer's list as a reason the promotion should not wait, not a mystery for whoever reads the
nightly. Nobody needs to chase it.

### [#2758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2758): the side panel offers different tabs on the main map and the event maps

**Visible change, so it comes first** - that is the maintainer's standing rule, and it outranks the Priority field.
Bus Routes and Experiments are missing from every event and parking map, on dev and production, because there are two
sidebar templates maintained separately and the tabs were only ever added to one.

The issue already names the fault as the one CLAUDE.md warns about: *two pieces of code that would both need changing
to fix one bug*. So **adding the two tabs to the second template is the wrong fix** - it is the third copy of the
decision. The event sidebar's `showTab()` union cannot even express a bus tab, which is the tell that the gate, not the
template, is the thing shared.

What I would want to see considered, in order of preference:

1. **One sidebar component both use**, with the tabs it offers driven by configuration. Biggest change, and it ends the
   class of bug.
2. **One shared tab declaration** - the list of tabs, their gates and their order in one place, with both templates
   rendering it. Smaller, and still leaves two templates to drift in layout.

**Say which you took and why**, and if you take the second, say what is still able to drift. Either way the gating rule
in CLAUDE.md applies: Bus Routes and Experiments are development-only today, so whatever you build keeps them gated
with `TestingService` and keeps `development-only-gates.spec.ts` and the smoke suite's lists in agreement -
`DEVELOPMENT_ONLY_SECTIONS` is the list that names sidebar tabs.

**Before/after screenshots of both a main map and an event map**, on dev, in the issue and the pull request: this one is
visible, so the `no-visible-change` escape hatch does not apply. Release-notes entry as its own file in
`docs/releases/unreleased/`, with a *What to test on dev* row.

This is a shared-library change, so it takes the **full** `scripts/check-in-volume.sh <branch>` before pushing, not a
project list.

### The report

`home/reports/<date>-47.md`, **"report ready"**, branch to the fork, `.pr-body.md` last, no pull request.

---

## Decided - 10 November 2026

The maintainer answered these; nobody needs to ask again. Each is also in the repository, in
`docs/releases/unreleased.md`, so a session that never reads this file still finds them.

- **The 30 October release was never promoted. Production runs `36b962a04`, from 22 October.** There is no
  `prod-2026-10-30` tag and none is missing: `scripts/tag-build.sh` worked as designed. So the 215 pull requests
  the [30 October notes](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/releases/2026-10-30.md)
  list **have not reached anybody**, and the next promotion carries nineteen days of work rather than one
  release. When you reason about what production contains, it is 22 October's build - not dev's, and not 30
  October's.
- **`3254b114e` is on dev and tagged `dev-2026-11-10`**, cleared by the release tier (999 passed, 15 failed, 70
  skipped; none of the 15 in the build). The promotion itself is the maintainer's, and this machine never
  touches production.
- **Priorities set:** [#2824](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2824)
  **High**, [#2828](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2828) **Medium**,
  [#2821](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2821) Medium,
  [#2822](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2822) High,
  [#2823](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2823) Medium.
- **Four pull requests are open and waiting on the maintainer**: 2825 (#2821, #2777), 2826 (#2776), 2827
  (#2823), 2829 (#2828). **Do not build on their branches**, and do not open or convert pull requests yourself.
  **PR 2827 must merge after the production promotion**, because it commits recorded builder links naming
  December 2026 that the smoke suite reads for both environments.

## Decided - 10 November 2026, 11:55 AM Central

- **The release notes are merged and the team has them.** [PR 2837](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2837)
  merged at 11:46 AM Central, so
  [docs/releases/2026-11-10.md](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/releases/2026-11-10.md)
  on `development` is AggieMap's alone and leads with the vector basemap, bus and routing. The maintainer has
  sent that link to the team **to confirm the release should go out**, so the promotion is waiting on the team,
  not on a check. GIS Day's 23 entries are in
  [gisday-unreleased.md](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/releases/gisday-unreleased.md).
- **Priorities set:** [#2836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2836)
  **High** (the notes correction, now merged),
  [#2835](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2835) **Medium** (batch 35).
- **An earlier shared link pointed at the pre-split notes.** PR 2834 merged before the split existed, so the
  commit it pinned shows GIS Day mixed in. If you ever hand anyone a release-notes link, pin it to a commit you
  have checked, or use `development` once the notes have merged.
- **PR 2834 was already merged when its corrections were written**, which is why they came as a second pull
  request. Check `state` before trying to push to a pull request you believe is open.
