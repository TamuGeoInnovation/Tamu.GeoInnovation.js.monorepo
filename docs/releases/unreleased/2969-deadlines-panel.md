---
issue: 2969
title: "GIS Day: Submission deadlines on Research Competitions is a compact panel, collapsed to one line once deadlines are set"
testOnDev: |
  | GIS Day: Submission deadlines panel ([#2969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2969)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | With this season's deadlines set, Submission deadlines is one line: each competition's dates in Central time, and the submissions list right below it. Click the line (or Tab to it and press Enter) and it opens to a table, one row per competition, each date with its Central time under it and a small Clear, and Save deadlines at the end on the right. Both date columns and every Clear fit without scrolling sideways, on a 1280 or 1024 px wide window. Click the line again and it closes. A season with no deadlines opens with the panel open |
---

### GIS Day: Submission deadlines on Research Competitions is a compact panel, collapsed to one line once deadlines are set

The **Submission deadlines** section (#2934) took half the screen above the submissions list. It is now a panel. Once a
season has deadlines it opens collapsed to one line, for example "Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov
16, 12:00 PM · Presentation open (Central time)", and the submissions are what the page shows first. Clicking that line
opens it to edit: a table with one row per competition, each date picker with its Central time under it and a smaller
Clear, and **Save deadlines** at the end of the panel instead of across the page. A season with no deadlines opens with
the panel open, ready to set them.
([#2969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2969))

| Before: the section as it was, every date open above the submissions | After: collapsed to one line, the submissions right below |
| --- | --- |
| ![Submission deadlines before, a field per competition and date, with Save deadlines across the page](../screenshots/2969-deadlines-panel/before-page.png) | ![Submission deadlines after, collapsed to one line summarizing each competition's dates in Central time, at 1280 px](../screenshots/2969-deadlines-panel/after-collapsed-1280.png) |
| ![The whole Submission deadlines section before](../screenshots/2969-deadlines-panel/before-section.png) | ![Submission deadlines after, opened at 1280 px to a table with one row per competition, each Central time under its date, and Save deadlines on the right](../screenshots/2969-deadlines-panel/after-expanded-1280.png) |
| | ![Submission deadlines after, opened at 1024 px, both date columns and every Clear inside the page](../screenshots/2969-deadlines-panel/after-expanded-1024.png) |
