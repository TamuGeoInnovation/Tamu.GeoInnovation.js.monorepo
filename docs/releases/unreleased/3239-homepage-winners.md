---
issue: 3239
title: The research competitions' winners on gisday.tamu.edu's homepage
testOnDev: |
  | GIS Day: competition winners ([#3239](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3239)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release and the `season_winners` migration, as an admin on gisday.tamu.edu: Research Competitions, Winners; pick 1st, 2nd and 3rd of each competition and Save winners; then open the homepage | The Winners page lists each competition's accepted entries this season, by title with their people's names, and keeps what was saved when reopened. The homepage shows a "2026 Competition Winners" section with each competition's places in order, each with names and title. txgisday.org and UCGIS's homepages show no such section |
---

### GIS Day: The research competitions' winners on gisday.tamu.edu's homepage

Once a season's GIS Day is over, gisday.tamu.edu's homepage shows the winners of its research competitions
([#3239](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3239)). These are the graduate and
undergraduate poster and presentation competitions, each with its 1st, 2nd and 3rd place, the winners' names and their
entry's title, in plain text. The section appears from the day after the season's last day and stays until the next
season becomes active.

Admins pick the winners on a new **Winners** page under Research Competitions, from that season's accepted entries.
Nothing is typed: each name and title is read from the entry itself whenever the homepage is shown, so a correction to
an entry shows on the homepage too. Next year's winners are picked the same way, with no change to the site.

The page has a place for the trail challenge's winners, who are people rather than entries; they can't be picked yet.
txgisday.org and the UCGIS site don't show winners, since the competitions ran on gisday.tamu.edu.

This adds a table, `season_winners`, whose migration runs before the release reaches production.
