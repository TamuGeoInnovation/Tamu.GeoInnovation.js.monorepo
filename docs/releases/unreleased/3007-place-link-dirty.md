---
issue: 3007
app: gisday
title: "GIS Day: editing only an organization's link counts as a change, so Escape asks before leaving"
testOnDev: |
  | GIS Day: editing only an organization's link counts as a change ([#3007](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3007)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, open Admin > Organizations and an organization with a link | Change only the link's URL or label, then press Escape: "Leave without saving?" appears. Choose Keep editing or Leave without saving; nothing is saved. Open an organization and press Escape without editing: it leaves without asking |
---

### GIS Day: editing only an organization's link counts as a change, so Escape asks before leaving

On an organization's admin page, changing only one of its links (the label or the URL) did not count as a change, so
pressing Escape (#2942) went straight back to the list without asking, and the edit was lost. The link's fields now
report the edit to the page's form, so Escape asks "Leave without saving?" as it does for any other field. Opening an
organization without editing it still leaves without asking.
([#3007](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3007))

| Before | After |
| --- | --- |
| ![An organization's admin page before, at 1280 px, with only its link's URL edited](../screenshots/3007-place-link-dirty/before-1-link-edited.png) | ![The same edit after the fix](../screenshots/3007-place-link-dirty/after-1-link-edited.png) |
| ![Before: Escape left for the Organizations list without asking; the edit is lost](../screenshots/3007-place-link-dirty/before-2-after-escape.png) | ![After: Escape asks "Leave without saving?", with Keep editing and Leave without saving](../screenshots/3007-place-link-dirty/after-2-after-escape.png) |
