---
issue: 2205
title: Deleting a GIS Day sponsor that has a logo works
testOnDev: |
  | GIS Day: deleting a sponsor with a logo ([#2205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2205)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in as an admin: [Admin, then Sponsors](https://txgisday.org/admin/sponsors) | Create a test sponsor with a logo, open it and choose Delete Sponsor: it is removed, with no error. Other sponsors' logos still show |
---

### GIS Day: deleting a sponsor that has a logo works

In Admin, Sponsors, Delete Sponsor on a sponsor with a logo usually failed with an error, because its logo's record was left
behind and the database refused to delete the sponsor. It worked only by chance, about one time in ten, depending on the
logo's upload time. The sponsor, its logo's record and the logo file are now all removed; a logo file another record also
uses (such as the shared placeholder image) is kept
([#2205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2205)).
