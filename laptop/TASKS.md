# Laptop: current tasks

## Batch 4 (aggiemap: Remote Campus Rebranding, #3161; 23 November 2026, 6:25 PM Central, from `work (aggiemap)`) (High) - **after 3**

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
