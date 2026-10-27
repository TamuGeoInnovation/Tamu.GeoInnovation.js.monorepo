---
issue: 2476
title: The HSC College of Dentistry joins the campus maps
testOnDev: |
  | HSC College of Dentistry ([#2476](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2476)) | On dev: [all campus maps](https://dev.aggiemap.tamu.edu/all-maps/campus), then the new HSC College of Dentistry map | **Ten campuses are listed**, the new one showing a picture of its own map. It opens on the five buildings round the College of Dentistry - 3600, 3601, 3605, 3607 and the imaging centre - and shows no others. Click a building for its popup. Search `den` in the map's own search and check it finds only those five: **Dr. M.C. Cooper Dental Clinic (3608) must not appear**, because it belongs to the site that is not mapped yet. Open `?bldg=3600` and check it selects that building |
---

### The HSC College of Dentistry joins the campus maps

The GIS team published HSC Dallas as one service holding six buildings in two places about 4 km apart: five
in downtown Dallas round the College of Dentistry, and Dr. M.C. Cooper Dental Clinic to the south-east.

**The College of Dentistry is a map now; the clinic is not yet.** That is what the GIS team asked for on
27 October - the clinic gets its own map from this same service when they are ready. That is also why the
map is told apart from the rest of the service by postcode (`75246`) rather than by listing its five
buildings: a building added to this site appears on it without a code change, and one added to the other
site does not appear by mistake.

The basemap draws the whole published area, including the ground around the clinic. That is expected: one
published basemap serves both sites.

A search source can now carry a `fixedWhere` condition that every search for it must also satisfy, which is
how this map searches only its own site.

Ten campus maps are listed now, all of them on production.

![The HSC College of Dentistry map](../screenshots/2476-hsc-dallas/hsc-college-of-dentistry.png)
![Ten campus maps listed](../screenshots/2476-hsc-dallas/all-maps-campus.png)
