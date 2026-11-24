---
issue: 2894
app: gisday
title: A VGI submissions dashboard
testOnDev: |
  | GIS Day admin: Dashboards, VGI submissions ([#2894](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2894)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on txgisday.org or gisday.tamu.edu: Admin, Dashboards, VGI submissions, the 2026 season | A row per feature type on the season's form, with its submissions, new finds and repeats (adding up to the leaderboard's points: 2 a new find, 1 a repeat), people, and review statuses, and a total row that counts each person once. Clicking a type lists who submitted it, with their counts, and Export as CSV downloads them. The chart shows submissions by day. Not in the menu on gisday.ucgis.org, which has no competition |
---

### GIS Day admin: a VGI submissions dashboard

Admin, Dashboards has a **VGI submissions** dashboard, beside RSVPs and Check-ins and on the same page
([#2894](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2894)):

- **A row per feature type** on the season's form: its submissions; how many are new finds and how many repeats, scored
  exactly as the leaderboard scores them; the people who submitted it; and how many are unverified, verified and
  discarded. A total row counts each person once, whatever types they submitted.
- **A type opens to its submitters**, each with their submissions, new finds and repeats and when they first submitted
  it, with an export as CSV.
- **A chart of submissions over time**, as the RSVP chart has, with a second line for the type opened.

It needs the permission organizers already have to read every submission, so no account needs anything new.

| Before | After |
| --- | --- |
| ![The admin Dashboards menu on txgisday.org: RSVPs, Check-ins, User accounts, Speaker badges](../screenshots/2894-vgi-dashboard/before-dashboards-menu.png) | ![The same menu with VGI submissions after Check-ins](../screenshots/2894-vgi-dashboard/after-dashboards-menu-txgisday.png) |
| | ![On gisday.ucgis.org, which has no competition, the menu has no VGI submissions](../screenshots/2894-vgi-dashboard/after-dashboards-menu-ucgis.png) |
| | ![The VGI submissions dashboard for 2025 in a local copy: 1223 submissions of 3 feature types, the chart of submissions by day, and a row per type with a total row](../screenshots/2894-vgi-dashboard/after-dashboard.png) |
| | ![Unknown Art Piece opened to its 705 submitters, names and emails hidden](../screenshots/2894-vgi-dashboard/after-feature-type-open.png) |
| | ![The 2026 season, which has no VGI competition in the local copy: 0 submissions, nothing to chart](../screenshots/2894-vgi-dashboard/after-dashboard-2026.png) |
