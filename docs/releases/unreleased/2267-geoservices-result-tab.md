---
issue: 2267
title: Geoservices' sample requests show their error when they get no answer
testOnDev: |
  | Geoservices' Result tab when a sample request fails ([#2267](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2267)) | Not reliably on dev: it shows only when the page's sample request gets no answer at all. Checked locally, where the sample API is unreachable: `geoservices-angular`'s `/services/geocoding` | The code runner's **Result** tab shows `{ "statusCode": 0, "type": "Unknown error", ... }` instead of an empty panel, and the console has no `toRenderableJSON is not a function` error |
---

### Geoservices' sample requests show their error when they get no answer

The services pages (geocoding, reverse geocoding, address processing, census intersection) run a sample request
for the code runner's **Result** tab. When that request got no answer at all, the library's error class failed
while describing it, so the tab stayed empty and the console logged `err.toRenderableJSON is not a function`
three times. The tab now shows the error. A request the server answered with an error was always shown, and
still is.
([#2267](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2267))

| Before | After |
| --- | --- |
| ![The Result tab, empty](../screenshots/2267-geoservices-result-tab/result-tab-before.png) | ![The Result tab showing the error](../screenshots/2267-geoservices-result-tab/result-tab-after.png) |
