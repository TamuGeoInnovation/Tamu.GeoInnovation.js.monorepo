---
issue: 2872
title: "GIS Day admin: Create Class adds several sections at once"
testOnDev: |
  | GIS Day admin: Create Class adds several sections at once ([#2872](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2872)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/admin/classes/add](https://gisday.tamu.edu/admin/classes/add), fill in a class and type sections such as `501, 502` | The form says how to list sections; Create adds one class per section, each in the class list. A section that already exists is named and left in the field |
---

### GIS Day admin: Create Class adds several sections at once

A class with several sections used to be entered once for each. Create Class's section field now takes a list,
separated by commas (`501, 502, 503`), and adds one class for each section, with the same code, number, name and
professor. The form says how under the field. If a section cannot be added, for example because it already exists,
the page names it, leaves it in the field to correct, and stays open; the others are kept. A single section works as
before, and Edit Class still edits one. ([#2872](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2872))

| Before | After |
| --- | --- |
| ![Create Class with one Course Section field](../screenshots/class-sections/before.png) | ![Course Section(s), with three sections and how to enter them](../screenshots/class-sections/after.png) |
