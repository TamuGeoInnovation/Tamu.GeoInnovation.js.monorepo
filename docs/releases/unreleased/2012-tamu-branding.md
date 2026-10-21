---
issue: 2012
title: GIS Day has a Texas A&M site, in the university's brand, at gisday.tamu.edu
testOnDev: |
  | GIS Day: Texas A&M's own site ([#2012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2012)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.tamu.edu](https://gisday.tamu.edu) and [txgisday.org](https://txgisday.org) | gisday.tamu.edu: "Texas A&M GIS Day", the Texas A&M logo with "Texas A&M University" above "GIS Day 2026" in the header, maroon links and buttons, the Organizing Committee and Resume Bank on About. txgisday.org: unchanged, in blue, with every section it had, the Organizing Committee and Resume Bank included ([#2071](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2071)). On both, hovering an outlined button shows white text, and the header logo has no underline |
---

### GIS Day: Texas A&M's own site, in the university's brand

The same GIS Day site now shows two faces, chosen by the address it is reached at. One deployment serves
both, with one database.

- **[gisday.tamu.edu](https://gisday.tamu.edu)** (and tamu.txgisday.org) is **Texas A&M GIS Day**, in the
  university's brand as AggieMap is: the Texas A&M lockup in the header, the university's maroon for links,
  buttons and accents, and the Texas A&M logo on the homepage. It keeps everything that is Texas A&M's own:
  the Organizing Committee, Student Opportunities and Resume Bank on the About page, the High School Portal,
  and the mentoring and TX GIS Hero links.
- **[txgisday.org](https://txgisday.org)** is unchanged, Texas A&M's content included. It keeps everything
  until there is a plan to make it a landing page for each organization's GIS Day site
  ([#2072](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2072)). The first
  version of this change took the Texas A&M content off it, and was corrected before release
  ([#2071](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2071)).

Sessions, presenters and sponsors are the same on both for now; showing only Texas A&M's events on its
site is a later change under the same issue.

Two things that were wrong on both sites are fixed along the way. Hovering an outlined button, such as
"Sponsor Through Texas A&M", kept its text the colour of the new background: faint in blue, invisible in
maroon. It is now white. And the header logo no longer underlines on hover
([#2012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2012)).

| Before: txgisday.org | After: txgisday.org | After: gisday.tamu.edu |
| --- | --- | --- |
| ![txgisday.org's About page on production, with the Organizing Committee and Resume Bank](../screenshots/2012-tamu-branding/before-txgisday-about.png) | ![txgisday.org's About page after the change: the same, Organizing Committee and Resume Bank included](../screenshots/2071-txgisday-keeps-tamu-content/after-txgisday-about.png) | ![Texas A&M GIS Day's About page: the lockup in the header, maroon, with the Texas A&M sections](../screenshots/2012-tamu-branding/after-tamu-about.png) |
| ![txgisday.org's homepage on production](../screenshots/2012-tamu-branding/before-txgisday-home.png) | | ![Texas A&M GIS Day's homepage: the Texas A&M logo and maroon buttons](../screenshots/2012-tamu-branding/after-tamu-home.png) |
| | | ![Texas A&M GIS Day on a phone: the lockup in the header](../screenshots/2012-tamu-branding/after-tamu-phone.png) |
| | | ![A hovered outlined button: white text on dark maroon](../screenshots/2012-tamu-branding/after-tamu-button-hover.png) |
