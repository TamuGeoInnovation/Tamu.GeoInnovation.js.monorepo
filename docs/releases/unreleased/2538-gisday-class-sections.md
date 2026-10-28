---
issue: 2538
title: A second section of a professor's class can be added, and a duplicate says so
testOnDev: |
  | GIS Day: a second section of a class ([#2538](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2538)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as an admin: [Admin, Classes](https://txgisday.org/admin/classes) | Add a class that matches an existing one in every field but the section: it is added, and the list shows both sections. Add an exact copy of an existing class: the toast says the class is already in this season, not "successfully created", and nothing is added |
---

### GIS Day: a second section of a professor's class can be added

In Admin, Classes, adding a class with the same code, number and professor as an existing one but a different
section did nothing, while the page said "Class was successfully created." The site treated it as the class it
already had. It also ignored the season, so a class from an earlier year could stop the same class being added
this year.

A class is now the same class only when its code, number, section, professor and season all match. A different
section, or the same class in a new season, is added. Adding an exact copy is refused, and the toast says the class
is already in this season instead of reporting a save that did not happen.
