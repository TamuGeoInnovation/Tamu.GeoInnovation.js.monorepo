---
issue: 3125
title: "GIS Day: a dashboard's people table keeps its column headings in view as it scrolls"
testOnDev: |
  | GIS Day: people table headings stay in view ([#3125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3125)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/vgi-submissions), open Admin, Dashboards, VGI submissions, choose season 2025, open **Unknown Art Piece**, and scroll down inside the box of people under it | The column headings (Name, Email, Position and the rest) stay at the top of the box as the people scroll under them, on a white band the rows do not show through. The same on RSVPs, Check-ins and Accounts with a row opened |
---

### GIS Day: a dashboard's people table keeps its column headings in view as it scrolls

On Admin, Dashboards, the people under an opened row are kept in a box no taller than the window, which scrolls up and
down inside itself ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)). Its
column headings scrolled away with the rows, so halfway down a long list, such as the 705 people under one VGI feature
type, nothing said which column was which. The headings now stay at the top of the box while the rows scroll under
them, on the page's own background
([#3125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3125)).

| VGI submissions, season 2025, Unknown Art Piece opened, at 1280 × 900 on the local site as gisday.tamu.edu, the people's box scrolled halfway down | Before | After |
| --- | --- | --- |
| Scrolled inside the box | ![The box of people scrolled halfway down, with no column headings in it](../screenshots/3125-people-headings/before-scrolled.png) | ![The same box with its column headings at its top](../screenshots/3125-people-headings/after-scrolled.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. People's names and emails
are blanked in the images.
