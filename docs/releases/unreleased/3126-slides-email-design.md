---
issue: 3126
title: "GIS Day admin: Ask for slides uses Texas A&M's GIS Day email design on gisday.tamu.edu"
testOnDev: |
  | GIS Day: Ask for slides from gisday.tamu.edu ([#3126](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3126)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with speakers, then Email these speakers, Ask for slides | The window's preview shows the whole email in the Texas A&M GIS Day design: the maroon bar, YOUR SESSION over GIS DAY(S) with this season's dates and days, the text, and the session's name, When and Where in a details box. When and Where are said once, in the box, not also in the text. On txgisday.org and the UCGIS site the same email stays plain, with When and Where in the text |
---

### GIS Day admin: Ask for slides uses Texas A&M's GIS Day email design on gisday.tamu.edu

The **Ask for slides** email ([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113))
now goes from gisday.tamu.edu in the Texas A&M GIS Day email design, as the session details email already does
([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)), rather than as plain text
([#3126](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3126)):

- the maroon top bar, YOUR SESSION over GIS DAY(S) with this season's dates, and the strip of the season's days;
- the email's own text, as edited in the window, with its Markdown formatting;
- the session's name, when and where in the design's details box. The text the window starts from then leaves out its
  own When and Where lines, so they are said once.

The email window's preview shows the whole email as it will arrive, and it still carries a plain-text version.
txgisday.org and the UCGIS site keep the plain email, with When and Where in its text.

| The Ask for slides preview, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up session and two made-up speakers | Before | After |
| --- | --- | --- |
| gisday.tamu.edu, Ask for slides | ![The email as plain text, with When and Where in its text](../screenshots/3126-slides-email-design/before-preview.png) | ![The whole email in the Texas A&M GIS Day design, with the session's name, When and Where once, in the details box](../screenshots/3126-slides-email-design/after-preview.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. In the after image the
preview's frame, which shows 32rem and scrolls, was made as tall as the email so the whole of it shows at once.
