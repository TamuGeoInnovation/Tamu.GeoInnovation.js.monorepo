---
issue: 3337
app: gisday
title: The GEOSAT logo shows on the Light Pole Challenge page
testOnDev: |
  | The GEOSAT logo on the Light Pole Challenge ([#3337](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3337)) | GIS Day dev site: `/competitions/lightpole` (linked from the VGI page's 2021 entry), the prizes section | The white GEOSAT logo on a maroon block. Before, the space looked empty, because the logo was white on a white page |
---

### The GEOSAT logo shows on the Light Pole Challenge page

The GEOSAT logo is white on a transparent background, and its maroon backing was written as a quoted string, which
browsers ignore, so on the white page the logo could not be seen at all. It now sits on Texas A&M maroon.
([#3337](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3337))

| Before                                                                                                                           | After                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ![The prizes section with an empty-looking space where the logo is](../screenshots/3337-quoted-background/before-light-pole.png) | ![The white GEOSAT logo on a maroon block](../screenshots/3337-quoted-background/after-light-pole.png) |
