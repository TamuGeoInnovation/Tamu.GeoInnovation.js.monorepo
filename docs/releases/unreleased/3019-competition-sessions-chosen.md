---
issue: 3019
app: gisday
title: "GIS Day: admins choose each competition's sessions and when its finalists hear"
testOnDev: |
  | GIS Day: competition sessions and finalists date ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)) | Not on dev: GIS Day has no dev site. After release, as an admin open Research Competitions, Competition settings, and under **Sessions and finalists** choose the poster competition's session and set its Finalists notified date; Save. Then open the [Poster Competition](https://txgisday.org/competitions/posters) page | The page names the chosen session, its day under the heading, and "Finalists will be notified on ..." with the date set. With nothing set, the page names the COMPETITION: session as before, and leaves the finalists line out |
---

### GIS Day: admins choose each competition's sessions and when its finalists hear

The presentation and poster pages, and the finalists' acceptance emails, found their sessions by a naming convention an
admin could not see: a `COMPETITION:` session naming the poster competition or a presentation level, and an `AWARDS:`
session ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)). An admin now
chooses them for the season, in Research Competitions' **Competition settings**, under **Sessions and finalists**: the
poster session, the undergraduate and graduate presentation sessions, and each competition's awards session. A
competition with none chosen finds its sessions by their names, as before, so nothing changes until an admin chooses.

The same panel sets when each competition's finalists hear. The poster and presentation pages show it in Central time,
and leave the line out when it is not set. **Until an admin sets it, those pages no longer say when finalists hear**:
the date was typed in for 2026, and would have been wrong the next year.

On a local build with a made-up 2027 season, whose poster competition chose a session not named `COMPETITION:` (Poster
Gallery Walk, on the Wednesday) and set when both competitions' finalists hear:

| | Before | After |
| --- | --- | --- |
| Posters, 1280 pixels | ![Before: the COMPETITION: session on Tuesday, and finalists notified on Saturday November 14th, 2026](../screenshots/3019-competition-sessions-chosen/before-posters-1280.png) | ![After: Poster Gallery Walk on Wednesday, November 17, 2027, in the heading and the session, and finalists notified on Sat, Nov 13, 2027](../screenshots/3019-competition-sessions-chosen/after-posters-1280.png) |
| Posters, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-sessions-chosen/before-posters-390.png) | ![After, on a phone](../screenshots/3019-competition-sessions-chosen/after-posters-390.png) |
| Presentation, 1280 pixels | ![Before: finalists notified on Saturday November 14th, 2026](../screenshots/3019-competition-sessions-chosen/before-presentation-1280.png) | ![After: finalists notified on Sat, Nov 13, 2027, with its sessions found by their names, none being chosen](../screenshots/3019-competition-sessions-chosen/after-presentation-1280.png) |
| Presentation, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-sessions-chosen/before-presentation-390.png) | ![After, on a phone](../screenshots/3019-competition-sessions-chosen/after-presentation-390.png) |

The admin panel's images are taken separately: it needs a signed-in admin.
