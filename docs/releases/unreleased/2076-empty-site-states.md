---
issue: 2076
title: A new GIS Day site with no data says so, instead of spinning for ever
testOnDev: |
  | GIS Day: a site with no season or data ([#2076](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2076)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, before UCGIS's site has a season: [gisday.ucgis.org/sessions](https://gisday.ucgis.org/sessions), [presenters](https://gisday.ucgis.org/presenters), [about](https://gisday.ucgis.org/about) | Sessions says "No sessions have been announced yet", and its Tags and Organizations cards say there are none instead of spinning. Presenters says the lineup is coming. Home and About say there are no participating organizations yet; the footer's partners say "Coming soon!". No empty Organizations menu in the header. Signed in as an admin, Events and Speakers say there are none. txgisday.org and gisday.tamu.edu look as before |
---

### GIS Day: a new site with no data says so, instead of spinning for ever

UCGIS's site, gisday.ucgis.org, opened with an empty database. Its pages showed spinners that never
stopped and blank areas where lists belong, because the site treated the API's "no active season"
answer as a failure and kept waiting.

Now no season is an answer. With no season and no data:

- **Sessions** says no sessions have been announced yet, and its Tags and Organizations filters say there
  are none.
- **Presenters** says the lineup is coming.
- **The homepage and About** say there are no participating organizations yet, and the footer's partners
  say "Coming soon!".
- **The header** no longer shows an empty Organizations menu.
- **The admin lists** that pick a season, such as Events and Speakers, say there are none. They had been
  blank because of a separate fault: with no season they failed while loading.

Sites with data look as before
([#2076](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2076)).

| Before | After |
| --- | --- |
| ![Sessions on an empty site: two spinning filter cards and a blank list](../screenshots/2076-empty-site-states/before-sessions.png) | ![Sessions on an empty site: "No sessions have been announced yet", and filters that say there are none](../screenshots/2076-empty-site-states/after-sessions.png) |
| ![Presenters on an empty site: nothing between the heading and the call for presenters](../screenshots/2076-empty-site-states/before-presenters.png) | ![Presenters on an empty site: the lineup is coming](../screenshots/2076-empty-site-states/after-presenters.png) |
| ![About on an empty site: nothing under Participating Organizations](../screenshots/2076-empty-site-states/before-about.png) | ![About on an empty site: there are no participating organizations yet](../screenshots/2076-empty-site-states/after-about.png) |
| ![The homepage on an empty site](../screenshots/2076-empty-site-states/before-root.png) | ![The homepage on an empty site: there are no participating organizations yet](../screenshots/2076-empty-site-states/after-root.png) |
| ![Admin Events on an empty site: blank](../screenshots/2076-empty-site-states/before-admin-events.png) | ![Admin Events on an empty site: there are no events for the selected season](../screenshots/2076-empty-site-states/after-admin-events.png) |
| ![Sessions on a phone, empty site](../screenshots/2076-empty-site-states/before-sessions-phone.png) | ![Sessions on a phone, empty site, with its message](../screenshots/2076-empty-site-states/after-sessions-phone.png) |
