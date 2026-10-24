---
issue: 2262
title: The building directory shows each building's abbreviation
testOnDev: |
  | The building directory's Abbreviation column ([#2262](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2262)) | [dev.aggiemap.tamu.edu/directory](https://dev.aggiemap.tamu.edu/directory) | Type "Zachry": the row reads Zachry Engineering Education Complex, 0518, ZACH. Most rows now have an abbreviation; buildings whose abbreviation is only a number still show none, as before |
---

### The building directory shows each building's abbreviation

The directory's Abbreviation column was always empty. It read a field called `BldgAbbrev`, which belongs to the
map's buildings service, while the directory's own list calls it `BldgAbbr`. It now reads the right one, so 1,288
of the 1,777 buildings show their abbreviation (the rest have none, or only a number, which the directory has
always left blank)
([#2262](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2262)).

| Before | After |
| --- | --- |
| ![Zachry's row with an empty Abbreviation](../screenshots/2262-directory-abbreviation/directory-zachry-before.png) | ![Zachry's row showing ZACH](../screenshots/2262-directory-abbreviation/directory-zachry-after.png) |
