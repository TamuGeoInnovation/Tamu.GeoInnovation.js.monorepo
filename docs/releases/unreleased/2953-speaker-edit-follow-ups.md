---
issue: 2953
title: "GIS Day: the speaker edit page, after its first live use - the site's own name, full width, university and class year"
testOnDev: |
  | GIS Day: speaker edit follow-ups ([#2951](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2951), [#2952](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2952), [#2953](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2953)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Speakers page](https://gisday.tamu.edu/admin/speakers) select yourself and choose **Send profile email** | The email comes from Texas A&M GIS Day, says so in its subject and text, and links to gisday.tamu.edu; the page is full width, with University and Graduation year, and shows your organization rather than an Affiliation box |
---

### GIS Day: the speaker edit page, after its first live use - the site's own name, full width, university and class year

The first profile email, sent from Texas A&M's site, arrived as from **TxGIS Day** with a txgisday.org link: every site
calls the API at txgisday.org's address, so the API now reads which site the page is on from the browser, and sends as
that site's own name (Texas A&M GIS Day) in the sender, subject, text and link.
([#2951](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2951))

The speaker's page was a narrow column, borrowed from the Contact page; it now uses the presenter page's full width.
([#2952](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2952))

It also takes the speaker's **University** (from the season's list) and **Graduation year**, both reviewed like the rest;
a speaker whose record has an organization sees it named, to be changed by the team, instead of an Affiliation box that
would change nothing the public page shows; and the admin action is now **Send profile email**.
([#2953](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2953))

| Before | After |
| --- | --- |
| ![The narrow page without university or class year](../screenshots/speaker-self-edit-2/before.png) | ![The full-width page with University, Graduation year and the organization](../screenshots/speaker-self-edit-2/after.png) |
