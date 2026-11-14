---
issue: 2926
title: "GIS Day: recorded times are right, rather than five or six hours early"
testOnDev: |
  | GIS Day: recorded times ([#2926](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2926)) | Not on dev: GIS Day has no dev site. After the migration and release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin | The submissions made at the 5:00 PM deadline on 13 November show as about 5:00 PM, not 11:00 AM; the RSVP dashboard's times of day move the same way; something submitted or RSVPed now shows the time it was done |
---

### GIS Day: recorded times are right, rather than five or six hours early

Every time the GIS Day site recorded (when a competition entry was submitted, an RSVP made, a check-in scanned, and the
rest) was stored as the database server's clock time labelled as UTC. The server runs on Central time, so a submission
made at the 5:00 PM deadline on 13 November showed as **11:00 AM**: six hours early in winter, five in summer. New
times are now stored with their real offset, and every time already stored was corrected by a migration, with daylight
saving applied to each.
([#2926](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2926))
