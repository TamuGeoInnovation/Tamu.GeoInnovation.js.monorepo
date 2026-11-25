---
issue: 2768
title: April Ring Day is listed on Campus Events again
testOnDev: |
  | April Ring Day is listed ([#2768](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2768)) | [dev.aggiemap.tamu.edu/all-maps/campus-events](https://dev.aggiemap.tamu.edu/all-maps/campus-events) | **April Ring Day** appears in the **Spring** column, between Aggieland Saturday and Big Event. Its two siblings, October and November Ring Day, are still under Fall. The same page with `?as=production` shows it too, because it is no longer hidden from production's listings |
---

### April Ring Day is listed on Campus Events again

The April Ring Day map was hidden from the Campus Events listing, where its two siblings - October Ring Day
and November Ring Day - were not. No reason was ever recorded for hiding it; the smoke suite's note said only
that #899's All Maps overhaul hid it on 5 August 2026 and to ask before listing it again.

The maintainer confirmed on 8 November 2026 that it should be listed, so it is.

|               | Before                                                                                                   | After                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Campus Events | ![The Spring column without April Ring Day](../screenshots/2768-april-ring-day/before-campus-events.png) | ![April Ring Day in the Spring column](../screenshots/2768-april-ring-day/after-campus-events.png) |

The map itself was always reachable at `/events/april-ring-day`; only the listing was missing, so a shared
link to it kept working throughout.
