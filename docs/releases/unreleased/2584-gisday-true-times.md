---
issue: 2584
title: "GIS Day stores the true time of every change, so VGI scoring's window opens on time"
testOnDev: |
  | GIS Day stores true times ([#2584](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2584)) | Not on dev: GIS Day has no dev site, and the fault shows only on a database whose clock is not UTC, as production's is. After the migration and the new API, submit one VGI find on [gisday.tamu.edu](https://gisday.tamu.edu/competitions/vgi), or RSVP to a session, and note the clock time | In Admin, the submission's (or RSVP's) time is the time you made it, in Central time, not 6 hours earlier. Times saved before the release still read 6 hours early (5 before 1 November) |
---

### GIS Day stores the true time of every change, so VGI scoring's window opens on time

Every time GIS Day stored on production, when a row was created and when it was last changed, was the database
server's local Central time labelled as UTC, so it read 6 hours early (5 hours before 1 November). The VGI
competition scores a find only if it was made inside the season's window, 12:00 AM Saturday 14 November to 11:00 AM
Friday 20 November, Central, and with every find dated 6 hours early it would have scored from about 6 AM on the
Saturday to about 5 PM on the Friday instead.

New rows now take the database's own time with its offset, and every change is stamped with the true time by the API.
Nothing about how anything is scored or shown has changed, only the times stored. **Times saved before this release
are left as they were** and still read 5 to 6 hours early, as decided on 30 October: check-ins, RSVPs and submissions
made before the release, and the `submitted` time of points already on the VGI ArcGIS layer. Production needs the
migration `TrueInstantTimestamps` run on both GIS Day databases before the new API starts.
([#2584](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2584))

| Before | After |
| --- | --- |
| ![On a database whose clock is Central, each time typeorm writes reads back 360 minutes early, and a find made inside the scoring window does not score](../screenshots/2584-gisday-true-times/before-central-clock.jpg) | ![On the same database after the change, every time reads back as the true time and the find scores](../screenshots/2584-gisday-true-times/after-central-clock.jpg) |
