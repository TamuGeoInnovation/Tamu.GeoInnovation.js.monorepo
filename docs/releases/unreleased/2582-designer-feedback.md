---
issue: 2582
title: The VGI Form Designer says what Fetch Schema and Save did
testOnDev: |
  | GIS Day admin: VGI Competition, Form Designer ([#2582](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2582)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: Admin, VGI Competition, Form Designer | Fetch Schema with `/assets/competitions/2026-monument-trail.json` says "Fetching the schema…", then "Found N fields: ..." and lists the questions. With `https://txgisday.org/assets/competitions/2026-monument-trail.json` it says it couldn't load that address and to use a file on this site. Save says "The form is saved." |
---

### GIS Day admin: the VGI Form Designer says what Fetch Schema and Save did

Fetch Schema said nothing while it worked, and nothing when it failed: a form file on another GIS Day site, which the
browser does not let the page read, simply did nothing. It now says it is fetching (and can't be pressed twice), then
what it found, or why it couldn't: another site's file, an address that refused, a private ArcGIS layer, or an address
with no fields. Save says whether the form was saved, and why not. The instructions now say what can be read: a form
file on this site or a public ArcGIS layer
([#2582](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2582)).

| Before | After |
| --- | --- |
| ![Fetch Schema with this site's form file: no message, under the old ESRI-only instructions](../screenshots/2582-designer-feedback/before-fetch-ok.png) | ![This site's form file: "Found 2 fields: What did you find?, Name on the plaque or marker, or the monument's name."](../screenshots/2582-designer-feedback/after-fetch-ok.png) |
| Nothing said while it waited | ![While it waits: "Fetching…" on the disabled button and "Fetching the schema…"](../screenshots/2582-designer-feedback/after-fetching.png) |
| ![Fetch Schema with another site's file: nothing happens](../screenshots/2582-designer-feedback/before-fetch-other.png) | ![Another site's file: "Couldn't load that address. Use a form file on this site (/assets/competitions/...) or a public ArcGIS layer."](../screenshots/2582-designer-feedback/after-fetch-other.png) |
