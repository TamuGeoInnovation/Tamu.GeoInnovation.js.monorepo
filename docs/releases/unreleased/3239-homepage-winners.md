---
issue: 3239
app: gisday
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

The trail challenge's winners are picked on the same page ([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)).
txgisday.org and the UCGIS site don't show winners, since the competitions ran on gisday.tamu.edu.

This adds a table, `season_winners`, whose migration runs before the release reaches production.

| Before | After |
| --- | --- |
| ![gisday.tamu.edu's homepage at 1280 pixels: the title, the dates, then The GIS Day Experience, with no winners](../screenshots/3239-homepage-winners/before-homepage.png) | ![The same homepage after GIS Day week, with made-up winners: a 2026 Competition Winners section under the dates, 1st, 2nd and 3rd of each of the four research competitions, each with its people's names and its title](../screenshots/3239-homepage-winners/after-homepage.png) |
| ![The same homepage on a phone, 390 pixels wide, with no winners](../screenshots/3239-homepage-winners/before-homepage-phone.png) | ![The same on a phone, the four competitions' winners one under another, nothing past the right edge](../screenshots/3239-homepage-winners/after-homepage-phone.png) |
| ![The admin menu's Research Competitions: Submissions, Rubrics and Judging results](../screenshots/3239-homepage-winners/before-admin-menu.png) | ![The same menu with Winners after Judging results](../screenshots/3239-homepage-winners/after-admin-menu.png) |
| | ![The new Winners page for 2026: a 1st, 2nd and 3rd place box for each research competition, picked from its accepted made-up entries, the Trail challenge not picked here yet, and Saved.](../screenshots/3239-homepage-winners/after-admin-winners.png) |
| | ![txgisday.org's homepage after the same winners were saved: no winners section](../screenshots/3239-homepage-winners/after-txgisday-homepage.png) |
