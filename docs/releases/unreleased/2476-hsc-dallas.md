---
issue: 2476
title: HSC Dallas joins the campus maps as two maps, one for each of its sites
testOnDev: |
  | HSC Dallas ([#2476](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2476)) | On dev: [all campus maps](https://dev.aggiemap.tamu.edu/all-maps/campus), then each of the two HSC Dallas maps | **Eleven campuses are listed.** The two new ones each show a picture of their own map. HSC Dallas Medicine opens on the five buildings round the College of Dentistry (3600, 3601, 3605, 3607 and the imaging centre) and nothing else; HSC Dallas Dentistry opens on Dr. M.C. Cooper Dental Clinic (3608) alone. In each, click a building for its popup; search `den` in the map's own search and check it finds only that site's buildings (the other site's never appear); open `?bldg=3608` on the Dentistry map and `?bldg=3600` on the Medicine map and check each selects its building |
---

### HSC Dallas joins the campus maps as two maps

The GIS team published HSC Dallas as one service with six buildings in two places about 4 km apart: five in
downtown Dallas round the College of Dentistry, and Dr. M.C. Cooper Dental Clinic to the south-east. Each place is
its own campus map, built from the same service and told apart by postcode (75246 and 75210), so a building added to
either site lands on the right map:

- **HSC Dallas Medicine** - the northwest site ([#2476](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2476))
- **HSC Dallas Dentistry** - the southeast site

**The two names are provisional.** Every northwest building is named for the College of Dentistry and the southeast
one is a dental clinic, so the names may swap; each is written in one place in the code.

Both are listed on production as well as development, like every other campus.

A search source can now carry a `fixedWhere` condition that every search for it must also satisfy; the two Dallas maps
use it to search only their own site.

![HSC Dallas Medicine](../screenshots/2476-hsc-dallas/hsc-dallas-northwest.png)
![HSC Dallas Dentistry](../screenshots/2476-hsc-dallas/hsc-dallas-southeast.png)
