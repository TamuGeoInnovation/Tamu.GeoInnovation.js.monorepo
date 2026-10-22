---
issue: 2078
title: GIS Day admins can copy a season from one GIS Day site to another
testOnDev: |
  | GIS Day: Admin, then Copy to another site ([#2078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2078)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as a GIS Day admin: [txgisday.org/admin/copy](https://txgisday.org/admin/copy), then [gisday.ucgis.org/admin/copy](https://gisday.ucgis.org/admin/copy) | On txgisday.org, choose 2026 and Export: a file downloads. On gisday.ucgis.org, choose that file: a table of what it would add, with nothing written until Apply. After Apply, UCGIS's Sessions shows the 2026 events and Presenters their speakers. Importing the same file again changes nothing |
---

### GIS Day: copy a season from one GIS Day site to another

A new admin page, **Copy to another site**, exports a season from one GIS Day site as a file, and imports
that file on another. It is how UCGIS's new site is pre-loaded with Texas A&M's 2026 events, and how events
can later be handed to each university's own site.

- **What moves:** the season and its days, tags and organizations, its events, and what the events bring:
  their speakers, the speakers' affiliations and universities, the venues and broadcasts they use, and the
  logos and photos of all of those.
- **What never moves:** people's contact details (speakers' email addresses, organizations' contact
  people), a broadcast's host link and password, and anything belonging to someone's account: accounts,
  registrations, check-ins, classes, submissions and survey answers.
- **An import shows what it would do first:** how many of each kind it would add, update or find already
  the same. Nothing is written until **Apply**, and nothing is ever deleted. Records keep their identity,
  so importing again updates what is there instead of duplicating it, and fetches any logos or photos that
  are still missing.
- **It refuses** a file whose season's year this site already has as a different season, so a site never
  ends up with two of the same year.

Only GIS Day admins can export or import
([#2078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2078)).

| Export | Import: what it would do | Import: applied |
| --- | --- | --- |
| ![The export section: choose a season and Export](../screenshots/2078-copy-between-sites/export.png) | ![A table of what the import would add, with Apply](../screenshots/2078-copy-between-sites/import-dry-run.png) | ![The same table after Apply, with 26 logos and photos copied](../screenshots/2078-copy-between-sites/import-applied.png) |

| After importing: Sessions | After importing: Presenters |
| --- | --- |
| ![UCGIS's Sessions page showing the imported events](../screenshots/2078-copy-between-sites/after-import-sessions.png) | ![UCGIS's Presenters page showing the imported speakers](../screenshots/2078-copy-between-sites/after-import-presenters.png) |
