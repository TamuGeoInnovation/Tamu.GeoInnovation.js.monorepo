---
issue: 9999
title: Geoservices' code samples are highlighted again, with line numbers
testOnDev: |
  | Geoservices' code samples, highlighted and numbered ([#9999](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/9999)) | Geoservices' dev site: a services page such as `/services/geocoding`, and the docs' `/docs/getting-started`. (The dev environment's settings name `geoservices-dev.geoservices.tamu.edu` only as the legacy host; if the Angular site is not deployed there, check it locally with `geoservices-angular`) | The **JS** and **cURL** samples in the code runner, and the samples in the getting-started docs, are in colour on the dark background, with line numbers down the left. The **Result** tab still shows the sample response. No console errors |
---

### Geoservices' code samples are highlighted again, with line numbers

The code samples on geoservices' four services pages (geocoding, reverse geocoding, address processing and census
intersection) and in its documentation showed as plain grey text: no colours and no line numbers. Moving the
highlighting library to its current version (`ngx-highlightjs` 6 to 14, part of
[#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218)) brings both back: each
sample is coloured by language, in the same dark theme, and numbered line by line.
([#9999](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/9999))

| Before | After |
| --- | --- |
| ![The geocoding page's JS sample in plain grey text](../screenshots/ngx-highlightjs-14/services-geocoding-before.png) | ![The same sample coloured, with line numbers 1 to 14](../screenshots/ngx-highlightjs-14/services-geocoding-after.png) |
| ![The getting-started docs' samples in plain text](../screenshots/ngx-highlightjs-14/docs-getting-started-before.png) | ![The same samples highlighted and numbered](../screenshots/ngx-highlightjs-14/docs-getting-started-after.png) |
