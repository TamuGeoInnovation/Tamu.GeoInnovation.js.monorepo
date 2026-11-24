---
issue: 3012
app: gisday
title: "GIS Day: the closed Submission deadlines panel on Research Competitions reads as a box to open"
testOnDev: |
  | GIS Day: closed Submission deadlines panel is a box to open ([#3012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3012)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | With this season's deadlines set, Submission deadlines is a tinted box with a border, apart from the submissions list below it: the chevron, the title and "Set dates" in the link colour, then each competition's dates in grey. Click it and it opens exactly as before (the table of dates, Clear and Save deadlines); click the title again and it closes back to the box |
---

### GIS Day: the closed Submission deadlines panel on Research Competitions reads as a box to open

Closed, the **Submission deadlines** panel (#2969) read as one line of plain text: a small chevron, the title and a run
of grey dates, with nothing to say it opens. It is now the same tinted, bordered box the admin lists use for their
selection bars, with the chevron and title in the link colour and a **Set dates** hint beside them, so it stands apart
from the submissions list below. Opened, it looks as it did.
([#3012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3012))

| Before: closed, one line of plain text | After: closed, a box to open, with "Set dates" |
| --- | --- |
| ![Submission deadlines before, closed: a small chevron, the title and grey dates on one line, at 1280 px](../screenshots/3012-deadlines-panel-visible/before-collapsed-1280.png) | ![Submission deadlines after, closed: a tinted bordered box with the chevron, title and Set dates in the link colour, at 1280 px](../screenshots/3012-deadlines-panel-visible/after-collapsed-1280.png) |
| | ![Submission deadlines after, opened at 1280 px: unchanged, a table with one row per competition and Save deadlines on the right](../screenshots/3012-deadlines-panel-visible/after-expanded-1280.png) |
