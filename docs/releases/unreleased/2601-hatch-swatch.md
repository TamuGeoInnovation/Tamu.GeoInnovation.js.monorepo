---
issue: 2601
app: aggiemap
title: "Games of Texas's Road Closures swatch matches the other red-hatch swatches"
testOnDev: |
  | Games of Texas's Road Closures swatch matches Beef Cattle's and Fire School's ([#2601](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2601)) | `https://dev.aggiemap.tamu.edu/events/games-of-texas`, the legend | Road Closures shows a red-hatched square with diagonals as fine as the No Parking Zones swatch on `/events/beef-cattle-vendor`; the map's own hatch is unchanged |
---

### Games of Texas's Road Closures swatch matches the other red-hatch swatches

Three maps show a red hatch in their legend: Beef Cattle's No Parking Zones and the Road Closures of Fire School and
Games of Texas. ArcGIS draws no legend swatch for a hatch, so each map drew its own, and Games of Texas's had drifted
to heavier diagonals than the other two. All three now use one swatch, the finer one. The hatch drawn on the map is
unchanged.
([#2601](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2601))

| The legend swatch, at its size and 6 times larger | Before | After |
| --- | --- | --- |
| Games of Texas, Road Closures | ![Diagonals 1.5 wide](../screenshots/2601-hatch-swatch/before.png) | ![Diagonals 1.2 wide, as Beef Cattle and Fire School](../screenshots/2601-hatch-swatch/after.png) |
