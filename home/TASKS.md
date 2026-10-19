# Home machine: current tasks

Written by the work session **only while another machine directs** (see `DIRECTOR.md`). The home session does each new batch here,
as `DIRECTOR.md` says for a listener. Development work: branches, agents, pull requests.

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
