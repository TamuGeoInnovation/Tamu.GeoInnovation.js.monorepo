---
issue: 2721
title: Every UCGIS member institution is in GIS Day's institution list
testOnDev: |
  | GIS Day: every UCGIS member institution is in the institution list ([#2721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2721)) | Not on dev: GIS Day has no dev site, and this is a change to each database, made with `nx run gisday-nest:add-ucgis-members --apply`. After it has run, sign in on [gisday.ucgis.org](https://gisday.ucgis.org) and on [txgisday.org](https://txgisday.org) and open Account > My details | As a student and as Staff/Faculty, the institution list finds Yale, KU Leuven and Hunter College; an institution that was already there, such as Penn State, appears once |
---

### GIS Day: every UCGIS member institution is in the institution list

When visitors complete their profile, they choose the institution they attend or work at from a list, and choose
**Other** when theirs is missing. The list had 23 institutions on the UCGIS site and 92 on txgisday.org, and many UCGIS
members were not among them. All 67 members on UCGIS's
[members page](https://www.ucgis.org/site/members) are now in each site's list for this season. A new script adds
those that are missing, and leaves alone those that were already there under another spelling ("Pennsylvania State
University" for Penn State, "Clemson" for Clemson University), so none is listed twice. Esri and the US Geological
Survey, UCGIS's government and commercial affiliates, are not in the list, because it is a list of schools.
([#2721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2721))
