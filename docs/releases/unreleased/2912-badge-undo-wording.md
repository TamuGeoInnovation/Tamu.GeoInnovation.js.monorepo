---
issue: 2912
title: "GIS Day admin: a printed badge says Printed, with Undo, and its row no longer scrolls"
testOnDev: |
  | GIS Day admin: printed badge wording ([#2912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2912)) | Not on dev: GIS Day has no dev site. After release, open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) and Show All | Each printed badge reads "Printed" with its date and an Undo link, never "Not printed"; no row has its own scroll bar |
---

### GIS Day admin: a printed badge says Printed, with Undo, and its row no longer scrolls

On the **Speaker badges** page, a printed badge showed its date with **Not printed** under it. That was the link that
undoes the mark, but it read as the badge's status, so after marking every badge printed they all looked unmarked. It
now reads **Printed** with the date, followed by an **Undo** link. Each printed row also had a scroll bar of its own,
which is gone. ([#2912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2912))

| Before | After |
| --- | --- |
| ![Printed rows reading "Not printed", each with a scroll bar](../screenshots/badge-undo/printed-rows-before.png) | ![Printed rows reading "Printed" with their date and Undo](../screenshots/badge-undo/printed-rows-after.png) |
