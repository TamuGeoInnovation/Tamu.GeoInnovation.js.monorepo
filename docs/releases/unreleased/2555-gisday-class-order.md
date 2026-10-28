---
issue: 2555
title: Class tables are listed by code, section and professor
testOnDev: |
  | GIS Day: class order ([#2555](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2555)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in: [Admin, Classes](https://gisday.tamu.edu/admin/classes) and [My Classes](https://gisday.tamu.edu/account/my-classes) | Both list GEOG 201 (sections 500, 501, 502), then GEOG 203 (503, 599), then GEOG 205 (500, 599): by code, then section, then professor |
---

### GIS Day: class tables are listed by code, section and professor

Admin, Classes and the student's My Classes listed a season's classes by name, so GEOG 205 ("Environmental Change")
came before GEOG 201, and a class's sections were out of order. Both now list classes by code (subject, then course
number), then section, then professor, with course numbers compared as numbers.
