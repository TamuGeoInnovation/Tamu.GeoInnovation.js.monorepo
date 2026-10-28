---
issue: 2459
title: Construction draws as an orange grid on every campus basemap, and the map no longer goes blank over it
testOnDev: |
  | Buildings under construction on the vector campus basemap ([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)) | [Aplin Center](https://dev.aggiemap.tamu.edu/map/d?bldg=1524) and [the Semiconductor Institute](https://dev.aggiemap.tamu.edu/map/d?bldg=8711); close the popup | Each building is an orange grid with the grass showing through it and a black outline: no pink, no solid block. Reload `/map/d` a few times: the map draws every time |
  | Construction on the Fort Worth Law School and Houston Space Institute maps ([#2532](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2532)) | [Fort Worth Law School](https://dev.aggiemap.tamu.edu/campus/fort-worth-law/map/d) and [Houston Space Institute](https://dev.aggiemap.tamu.edu/campus/houston-space-institute/map/d); reload each a few times | The construction is the same orange grid with a black outline as College Station's, over the campus map, with no pink and no orange wash. Fort Worth has four areas in view, Houston one large site around building B500. The building labels are there on every load, and clicking a building still opens its popup |
---

### Construction draws as an orange grid on every campus basemap, and the map no longer goes blank over it

On the development campus basemap, buildings under construction drew as solid pink blocks, because the published
pattern was packaged on an opaque tile. The first fix replaced that pattern inside the basemap's sprite sheet, and
on some loads it left the whole map blank. Now the basemap's own fill is switched off. The eight buildings are
drawn from the campus buildings service as an orange grid, with the ground showing through it, and the basemap's
black outline stays. Nothing touches the sprite sheet any more. The grid is the same density at every zoom.
([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)).

The Fort Worth Law School and Houston Space Institute maps had the same pink fill in their own basemaps, on
production as well. They now draw their construction the same way, with the same symbol, from each campus's own
service ([#2506](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2506),
[#2532](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2532)). For a short while
development drew them as a translucent orange wash instead; that is gone, so the same thing is not drawn two ways.
These are construction sites, not single buildings, so the grid covers more ground than in College Station: at
Houston Space Institute it covers the whole site, building B500 and its parking included, and crosses that
building's label.

| | Before | After |
| --- | --- | --- |
| Aplin Center (1524) | ![A solid pink block](../screenshots/2459-construction-hatch/control-1524.png) | ![An orange grid over grass, with a black outline](../screenshots/2459-construction-hatch/after-1524.png) |
| At zoom 16, around West Campus | | ![Three buildings under construction, each an orange grid](../screenshots/2459-construction-hatch/prototype-1524-zoom16.png) |
| Fort Worth Law School, as the map opens (before: development's orange wash; production shows pink) | ![Four construction areas washed in translucent orange](../screenshots/2532-campus-hatch/fort-worth-law-before-opening.png) | ![The same four areas as an orange grid with a black outline](../screenshots/2532-campus-hatch/fort-worth-law-after-opening.png) |
| Houston Space Institute, as the map opens (before: development's orange wash; production shows pink) | ![The construction site washed in translucent orange](../screenshots/2532-campus-hatch/houston-space-institute-before-opening.png) | ![The whole site as an orange grid with a black outline](../screenshots/2532-campus-hatch/houston-space-institute-after-opening.png) |
