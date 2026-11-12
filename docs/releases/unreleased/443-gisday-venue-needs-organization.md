---
issue: 443
title: A GIS Day venue cannot be saved without its hosting organization
testOnDev: |
  | A venue needs its hosting organization ([#443](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/443)) | GIS Day dev site, as an admin: Admin > Venues > Add | The hosting organization is the first field; Create without one says "Select the venue's hosting organization" and saves nothing |
---

### A GIS Day venue cannot be saved without its hosting organization

Venues were being created with no hosting organization, and every session held at one was then missing from the
public Sessions page, with nothing to say why. The organization is now the first field on the venue form, and saving
without one is refused with a message saying why it matters. Venues already saved without one ask for it the next
time they are edited.
([#443](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/443))

| Before | After |
| --- | --- |
| ![The Create Venue form, with the hosting organization optional and halfway down](../screenshots/443-gisday-venue-needs-organization/before.png) | ![The Create Venue form, with the hosting organization first and required](../screenshots/443-gisday-venue-needs-organization/after.png) |
