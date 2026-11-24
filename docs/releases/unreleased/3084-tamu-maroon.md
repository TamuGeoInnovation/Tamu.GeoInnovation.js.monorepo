---
issue: 3084
app: gisday
title: "GIS Day: On gisday.tamu.edu, a search box's focus outline and its Copy link are maroon"
testOnDev: |
  | GIS Day: maroon search boxes on gisday.tamu.edu ([#3084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3084)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/sessions?search=intel](https://gisday.tamu.edu/sessions?search=intel) and click in the search box, then the same on [txgisday.org/sessions?search=intel](https://txgisday.org/sessions?search=intel) | On gisday.tamu.edu the box's outline and the words Copy link are maroon, as the header's links are; on txgisday.org both stay blue. The Presenters page's search box reads the same way |
---

### GIS Day: On gisday.tamu.edu, a search box's focus outline and its Copy link are maroon

Texas A&M's GIS Day site wears the university's maroon, but its search boxes still lit up light blue when clicked into,
and the Copy link inside them was blue. Both now take the site's own maroon (`#500000`), from the same setting that
makes its header and links maroon, so txgisday.org and UCGIS keep their blue. Every text box on gisday.tamu.edu gets
the maroon outline, not only the search boxes.
([#3084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3084))

| Before (the local site as gisday.tamu.edu, search box focused) | After |
| --- | --- |
| ![The Sessions page on gisday.tamu.edu searching for intel, the focused box outlined in light blue and Copy link in blue beside the maroon header](../screenshots/3084-tamu-maroon/before-tamu-1280.png) | ![The same page after, the focused box outlined in maroon and Copy link in maroon](../screenshots/3084-tamu-maroon/after-tamu-1280.png) |
| ![The same page at phone width before, blue outline and Copy link](../screenshots/3084-tamu-maroon/before-tamu-390.png) | ![The same page at phone width after, maroon outline and Copy link](../screenshots/3084-tamu-maroon/after-tamu-390.png) |
| ![txgisday.org's Sessions page before, a light blue outline and a blue Copy link](../screenshots/3084-tamu-maroon/before-txgisday-1280.png) | ![txgisday.org's Sessions page after, unchanged](../screenshots/3084-tamu-maroon/after-txgisday-1280.png) |
