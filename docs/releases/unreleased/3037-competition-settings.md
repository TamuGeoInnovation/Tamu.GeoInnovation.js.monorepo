---
issue: 3037
title: "GIS Day: one Competition settings panel on Research Competitions, for which competitions run and their deadlines, with one Save"
testOnDev: |
  | GIS Day: one Competition settings panel, one Save ([#3037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3037)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | Above the submissions there is one box, Competition settings for this year, with "Edit" and a line naming the competitions the season runs and their deadlines. Click it: the competitions' boxes, then a row of deadlines for each one ticked (untick one and its row goes), and one Save. Save says "Competitions and deadlines saved." and the panel stays open. With every box unticked, Save says nothing was saved and why. There is no longer a separate Competitions section or Save competitions / Save deadlines button |
---

### GIS Day: one Competition settings panel on Research Competitions, for which competitions run and their deadlines, with one Save

Research Competitions had two sections above its submissions: **Competitions in 2026**, which competitions the season
runs (#2948), with its own **Save competitions**, and the **Submission deadlines** panel (#2969, #3012), with **Save
deadlines**. They are one collapsible panel, **Competition settings**, the box #3012 made: closed, its line names the
competitions the season runs and their deadlines; open, it has the competitions' boxes, a row of deadlines for each
competition ticked, and **one Save** that sends both. If either is refused, it says which and why, and keeps what was
typed. ([#3037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3037))

| Before | After |
| --- | --- |
| ![Research Competitions before, at 1280 px: a Competitions in 2026 section with four boxes and a full-width Save competitions button, then the closed Submission deadlines box](../screenshots/3037-competition-settings/before-closed-1280.png) | ![Research Competitions after, at 1280 px: one closed Competition settings box, with Edit and a line naming the four competitions and their deadlines](../screenshots/3037-competition-settings/after-closed-1280.png) |
| ![Before, Submission deadlines opened: two sections, with Save competitions and Save deadlines](../screenshots/3037-competition-settings/before-open-1280.png) | ![After, Competition settings opened: the competitions' boxes, the deadlines table and one Save](../screenshots/3037-competition-settings/after-open-1280.png) |
| | ![After one Save: "Competitions and deadlines saved." beside Save, and the panel still open](../screenshots/3037-competition-settings/after-saved-1280.png) |
| | ![After, every competition unticked and Save: "Nothing was saved. A season must run at least one competition."](../screenshots/3037-competition-settings/after-refused-1280.png) |
