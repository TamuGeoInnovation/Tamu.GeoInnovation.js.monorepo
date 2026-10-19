# Home machine: current tasks

Written by the work session **only while another machine directs** (see `DIRECTOR.md`). The home session does each new batch here,
as `DIRECTOR.md` says for a listener. Development work: branches, agents, pull requests.

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
