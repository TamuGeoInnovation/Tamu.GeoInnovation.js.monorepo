---
issue: 2948
title: "GIS Day: admins choose which research competitions a season runs, and the submission form offers only those"
testOnDev: |
  | GIS Day: the competitions a season runs ([#2948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2948)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | A **Competitions** section above the deadlines has four boxes, all ticked: Poster, Presentation, Paper and Cartography. Untick Paper and Cartography and save; the deadlines then list only Poster and Presentation, and, signed in, [a new submission](https://txgisday.org/account/submissions/add) offers only Poster and Presentation. A submission already made as Paper still opens, keeps its type, and is still listed for admins. Unticking every box is refused |
---

### GIS Day: admins choose which research competitions a season runs

The student submission form offered every research competition, Paper and Cartography included, every year, whatever
the season ran. Admins now choose the competitions a season runs on **Research Competitions**, above the deadlines,
and everything follows:

- the submission form offers only those;
- the deadlines list only those;
- the Competitions page shows the Poster and Presentation blocks only in a season that runs them;
- the site refuses a new submission to any other.

A season nobody has set runs every competition, so nothing changes until an admin chooses. A submission already made to
a competition later turned off stays as it is, can still be edited, and is still listed for admins. The VGI competition
is not among these: it is switched for each site as before.
([#2948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2948))

| Research competitions, 1280 pixels wide | Before | After |
| --- | --- | --- |
| Research Competitions | ![No way to choose the competitions; the deadlines list all four](../screenshots/2948-season-competition-types/before-research-competitions.png) | ![A Competitions section above the deadlines, all four ticked](../screenshots/2948-season-competition-types/after-competitions-section.png) |
| Paper turned off and saved | | ![Paper unticked, Competitions saved, and the deadlines no longer list Paper](../screenshots/2948-season-competition-types/after-paper-off-saved.png) |
| The new-submission form | ![Presentation, Paper, Poster and Cartography offered](../screenshots/2948-season-competition-types/before-submission-form.png) | ![Presentation, Poster and Cartography offered; Paper is not](../screenshots/2948-season-competition-types/after-submission-form-no-paper.png) |

**Before the API is deployed**, the production migration `migrate-prod-2948.ps1` adds the one empty table it needs, `season_competitions`.
