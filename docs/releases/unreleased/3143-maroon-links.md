---
issue: 3143
title: "GIS Day: gisday.tamu.edu's inline links and slide toggles are maroon, not txgisday's blue"
testOnDev: |
  | GIS Day: maroon inline links and slide toggles on gisday.tamu.edu ([#3143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3143)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events) and open a session that has slides, then Account, Student Competitions, New submission | On gisday.tamu.edu, a session's **Slides** file names are maroon beside **Remove**, not light blue, the selected option of the **Undergraduate / Graduate** and **Individual / Group** toggles is maroon with a dark maroon edge, and the chosen competition type's radio tick is maroon. On txgisday.org all of them are blue as before |
---

### GIS Day: gisday.tamu.edu's inline links and slide toggles are maroon, not txgisday's blue

On gisday.tamu.edu, a few things were still txgisday.org's blue: the file names in a session's **Slides** list (Admin,
Events, a session), which showed light blue beside the **Remove** link, and the slide toggles, such as a competition
submission's **Undergraduate / Graduate** and **Individual / Group** choices, with a blue edge, and the tick of the
chosen competition type. They now take the Texas A&M site's maroon, like its other links
([#3143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3143)). txgisday.org and the UCGIS
site keep their blues.

| 1280 pixels, on the local site, signed in as an admin, with a made-up session and a made-up slide file | Before | After |
| --- | --- | --- |
| A session's Slides, on gisday.tamu.edu | ![The made-up slide file's name in light blue, beside a red Remove](../screenshots/3143-maroon-links/before-slides-tamu.png) | ![The same file name in maroon](../screenshots/3143-maroon-links/after-slides-tamu.png) |
| A session's Slides, on txgisday.org | | ![The file name still light blue on txgisday.org, unchanged](../screenshots/3143-maroon-links/after-slides-txgisday.png) |
| New submission's competition type and slide toggles, on gisday.tamu.edu | | ![The Presentation radio tick and the Undergraduate toggle's selected option and its edge in maroon, nothing blue](../screenshots/3143-maroon-links/after-toggle-tamu.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email were blanked in the images.
