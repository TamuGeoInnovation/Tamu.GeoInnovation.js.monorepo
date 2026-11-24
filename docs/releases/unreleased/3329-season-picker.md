---
issue: 3329
app: gisday
title: "GIS Day admin: the season an admin page shows is kept in its address, on every page"
testOnDev: |
  | GIS Day admin: one season picker ([#3329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3329)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, Research Competitions, Rubrics, choose last year's season, then reload the page | The address gains `?season=`, and after the reload the page still shows last year's rubric with last year in the Season box. Tags and Dashboards, User accounts behave as before: they kept the season already |
---

### GIS Day admin: the season an admin page shows is kept in its address, on every page

Admin lists, the judging pages and the dashboards each picked their season their own way, and only some kept the choice in
the page's address. On Rubrics, Judging results and Winners a reload, or a link sent to someone, went back to the current
season. They now share one season picker, which keeps the season in the address, so a reload or a shared link shows the
season that was chosen
([#3329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3329)).

| | Before | After |
| --- | --- | --- |
| Rubrics, 2025 chosen | ![Before: Rubrics with 2025 chosen](../screenshots/3329-season-picker/before-rubrics-2025.png) | ![After: Rubrics with 2025 chosen](../screenshots/3329-season-picker/after-rubrics-2025.png) |
| Rubrics, after a reload | ![Before: Rubrics after a reload](../screenshots/3329-season-picker/before-rubrics-reloaded.png) | ![After: Rubrics after a reload](../screenshots/3329-season-picker/after-rubrics-reloaded.png) |
| Tags, 2025 chosen | ![Before: Tags with 2025 chosen](../screenshots/3329-season-picker/before-tags-2025.png) | ![After: Tags with 2025 chosen](../screenshots/3329-season-picker/after-tags-2025.png) |
| Tags, after a reload | ![Before: Tags after a reload](../screenshots/3329-season-picker/before-tags-reloaded.png) | ![After: Tags after a reload](../screenshots/3329-season-picker/after-tags-reloaded.png) |
| User accounts dashboard, 2025 chosen | ![Before: User accounts dashboard with 2025 chosen](../screenshots/3329-season-picker/before-accounts-2025.png) | ![After: User accounts dashboard with 2025 chosen](../screenshots/3329-season-picker/after-accounts-2025.png) |
| User accounts dashboard, after a reload | ![Before: User accounts dashboard after a reload](../screenshots/3329-season-picker/before-accounts-reloaded.png) | ![After: User accounts dashboard after a reload](../screenshots/3329-season-picker/after-accounts-reloaded.png) |

Before, Rubrics went back to 2026 on a reload, and Tags and the dashboard already kept 2025. After, all three keep it. GIS
Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up tags and
rubrics in 2025 and 2026. No form was saved.
