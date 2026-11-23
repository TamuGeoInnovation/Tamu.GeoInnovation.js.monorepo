---
issue: 3243
title: The trail challenge's winners on gisday.tamu.edu's homepage
testOnDev: |
  | GIS Day: trail challenge winners ([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: Research Competitions, Winners; in Trail challenge, pick 1st, 2nd and 3rd and Save winners; then open the homepage | Trail challenge offers the season's submitters in the leaderboard's order, each with their name and points, and keeps what was saved. The homepage's winners section shows a Trail challenge block with each place and the winner's name |
---

### GIS Day: The trail challenge's winners on gisday.tamu.edu's homepage

The Winners page now picks the trail challenge's 1st, 2nd and 3rd place too
([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)), and the homepage shows each
place with the winner's name beside the research competitions' winners. The choices are the season's trail
submitters in the leaderboard's order, each with their name and points as the leaderboard scores them, so no name is
typed. A winner is kept by their account, and their name is read from their profile when the homepage is shown. No
other detail about them leaves the site.

These images were taken locally on made-up data. The made-up trail submitters have no sign-in profile, so the Winners
page lists them as "No name given (N points)", and the homepage's Trail challenge block cannot be shown locally: the
site leaves a place whose winner has no name off the homepage, by design.

| Before | After |
| --- | --- |
| ![The Winners page before: each research competition's places picked, and the Trail challenge saying its winners are people rather than entries and are not picked here yet](../screenshots/3243-trail-winners/before-admin-winners.png) | ![The Winners page's Trail challenge after: 1st, 2nd and 3rd picked and saved from the made-up submitters in the leaderboard's order, each listed as "No name given (N points)" (5, 3 and 2 points) because they have no sign-in profile](../screenshots/3243-trail-winners/after-admin-trail.png) |
| ![gisday.tamu.edu's homepage at 1280 pixels before: the 2026 Competition Winners section with the four research competitions' made-up winners](../screenshots/3243-trail-winners/before-homepage.png) | ![The same homepage after the trail places were saved: the research competitions' winners and no Trail challenge block, because the made-up winners have no names and unnamed places are left off by design](../screenshots/3243-trail-winners/after-homepage.png) |
| ![The same homepage on a phone, 390 pixels wide, before](../screenshots/3243-trail-winners/before-homepage-phone.png) | ![The same on a phone after: the research winners only, no Trail challenge block for the same reason, nothing past the right edge](../screenshots/3243-trail-winners/after-homepage-phone.png) |
