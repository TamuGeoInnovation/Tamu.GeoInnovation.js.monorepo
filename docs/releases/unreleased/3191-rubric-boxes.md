---
issue: 3191
title: "GIS Day: the judging page shows a criterion's four levels as boxes side by side, like the rubric"
testOnDev: |
  | GIS Day: the judging page's levels as boxes ([#3191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3191)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu), open a judge's judging link (`/judging/<link>`, from an Ask to judge email to a judge) on a computer, then on a phone | Under each criterion's score box, its four levels (Excellent, Proficient, Developing, Needs Improvement) are shown as boxes, with no Levels toggle to open: four across on a computer, one per row on a phone, and nothing runs off the right edge of the phone's screen |
---

### GIS Day: the judging page shows a criterion's four levels as boxes side by side, like the rubric

On a judge's page, each criterion's levels were behind a **Levels** toggle, one under another. They are now always shown,
as boxes side by side, as the rubric's own table lays them out
([#3191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3191)): four across on a wide screen,
fewer as the screen narrows, and one per row on a phone. No box is lit for the score, because the rubric does not say which
scores belong to which level.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, with the
standard research presentation rubric, at 1280 px unless it says otherwise.

| | |
| --- | --- |
| Before: a criterion with its Levels opened, one under another | ![A made-up presentation entry's first criterion, Geographic Understanding and Content Accuracy, 0 to 20, with Levels opened: Excellent, Proficient, Developing and Needs Improvement, each with its description, one under another](../screenshots/3191-rubric-boxes/before-levels.png) |
| After: the same criterion, its four levels as boxes side by side | ![The same criterion with its four levels as four boxes in a row under the score box, each with its label and description](../screenshots/3191-rubric-boxes/after-levels.png) |
| After: at 768 px, a tablet's width | ![The same criterion at 768 px: two level boxes in each of two rows, Excellent and Proficient above Developing and Needs Improvement](../screenshots/3191-rubric-boxes/after-levels-tablet.png) |
| After: at 390 px, a phone's width, one box per row | ![The same criterion at 390 px: the four level boxes one under another, each the card's full width](../screenshots/3191-rubric-boxes/after-levels-phone.png) |
