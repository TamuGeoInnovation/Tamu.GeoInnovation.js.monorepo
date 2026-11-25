---
issue: 3412
app: gisday
title: "GIS Day: the Paper competition's page no longer ends a sentence in a colon and nothing"
testOnDev: |
  | GIS Day: the Papers page's awards sentence ([#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: Competitions, Papers, First Place Award Announcement | With an awards session on the schedule, "Winners will be announced at the awards session:" leads into its name, day, time and room. Without one, only "The day, time and room are on the schedule." shows, with no sentence ending in a colon |
---

### GIS Day: the Paper competition's page no longer ends a sentence in a colon and nothing

When the site could not find the season's awards session, the Paper competition's page still said "Winners will be
announced at the awards session:" and went straight on to "The day, time and room are on the schedule." The sentence now
shows only when there is a session to name, as #3415 did on the Posters and Presentation pages
([#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412)).

| | Before | After |
| --- | --- | --- |
| No awards session found, at 1280 | ![Before: the sentence ends in a colon, then the schedule line](../screenshots/3412-awards-sentence/papers-awards-1280-before.png) | ![After: only the schedule line](../screenshots/3412-awards-sentence/papers-awards-1280-after.png) |
| No awards session found, at 390 | ![Before on a phone](../screenshots/3412-awards-sentence/papers-awards-390-before.png) | ![After on a phone](../screenshots/3412-awards-sentence/papers-awards-390-after.png) |
| An awards session found, at 1280 | | ![After: the sentence leads into the session](../screenshots/3412-awards-sentence/papers-awards-1280-after-found.png) |
| An awards session found, at 390 | | ![After on a phone](../screenshots/3412-awards-sentence/papers-awards-390-after-found.png) |

GIS Day has no dev site, so this was checked on the local site, signed out, with a made-up awards session named so that it
is not found, then so that it is.
