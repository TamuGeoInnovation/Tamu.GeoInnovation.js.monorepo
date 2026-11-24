---
issue: 3019
app: gisday
title: "GIS Day: the Presentation and Poster competition pages take their day and deadline from the season"
testOnDev: |
  | GIS Day: competition pages' dates ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)) | Not on dev: GIS Day has no dev site. After release, open [Presentation Competition](https://txgisday.org/competitions/presentation) and [Poster Competition](https://txgisday.org/competitions/posters) | The day under each heading is the competition session's own day (Tuesday, November 17, 2026), and **Due** gives the season's submission deadline (Fri, Nov 13, 2026, 5:00 PM Central). In Admin, Seasons, change the poster deadline, and the Posters page's **Due** follows |
---

### GIS Day: the Presentation and Poster competition pages take their day and deadline from the season

The Presentation and Poster competition pages typed 2026's dates into their text: the day under the heading, the
submission deadline and its time, and the day of the poster session in the finalists' instructions. Next year they
would have been wrong unless someone remembered to change them
([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)).

Each page now gives the competition sessions' own day, found as the pages already find their sessions, and the
season's submission deadline as set in Admin, Seasons
([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934)), the one the site enforces.
Without one set, it says the deadline is to be announced. The day finalists are told still reads 2026's: there is no
setting for it yet.

On a local build with a made-up 2027 season, the pages before and after:

| | Before | After |
| --- | --- | --- |
| Presentation, 1280 pixels | ![Before: "Tuesday, November 17th, 2026" and "Friday November 13th, 2026" above 2027's sessions](../screenshots/3019-competition-dates/before-presentation-1280.png) | ![After: "Tuesday, November 16, 2027" and "Due: Fri, Nov 12, 2027, 5:00 PM Central"](../screenshots/3019-competition-dates/after-presentation-1280.png) |
| Presentation, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-dates/before-presentation-390.png) | ![After, on a phone](../screenshots/3019-competition-dates/after-presentation-390.png) |
| Posters, 1280 pixels | ![Before: 2026's day and deadline, and "(Tuesday November 17th)" for the poster session](../screenshots/3019-competition-dates/before-posters-1280.png) | ![After: 2027's day and deadline, and the poster session's own day](../screenshots/3019-competition-dates/after-posters-1280.png) |
| Posters, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-dates/before-posters-390.png) | ![After, on a phone](../screenshots/3019-competition-dates/after-posters-390.png) |
