---
issue: 1765
app: gisday
title: "An address the site does not know says the page was not found"
testOnDev: |
  | An unknown address says the page was not found ([#1765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1765)) | Not on dev: GIS Day has no dev site. After release, open `https://gisday.tamu.edu/no-such-page` | The site's header and footer, "Sorry: We couldn't find that page.", links to the home page and Sessions, and the address left as typed; `/forbidden` still says to sign in or lacks the rights |
---

### An address the site does not know says the page was not found

Opening an address the GIS Day sites do not know, a mistyped link or an old one, drew a blank white page at the home
address, with no header and no message. It now shows the site as usual, with "Sorry: We couldn't find that page." and
links to the home page and the sessions, and leaves the address as it was typed.
([#1765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1765))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| `/no-such-page` | ![A blank white page at the home address](../screenshots/1765-page-not-found/before.png) | ![We couldn't find that page, with links](../screenshots/1765-page-not-found/after.png) |
