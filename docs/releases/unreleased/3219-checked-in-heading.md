---
issue: 3219
title: Dashboard headings break only between words
testOnDev: |
  | GIS Day: dashboard headings ([#3219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3219)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin at 1280 px and at 390 px: Admin, Dashboards, Check-ins, then the VGI dashboard | "Checked in" reads as two whole words, not "Checkec / in". No heading is cut inside a word; a long one breaks with a hyphen ("Un-verified", "classi-fication") |
---

### GIS Day: Dashboard headings break only between words

On the Check-ins dashboard the **Checked in** heading was cut to "Checkec / in" at 1280 px
([#3219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3219)). Its column, at its
narrowest, was a tenth of a pixel wider than the word. That column is now a little wider, with the width taken from the
name column, so the table is no wider than before. Three other headings that could be cut in a narrow window
("classification", "Unverified" and "Discarded") now break with a hyphen instead. A check now measures every dashboard
heading against its column, so a heading added or renamed later cannot be cut without the check failing.
