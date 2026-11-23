---
issue: 3221
title: "GIS Day: Each day on the Sessions page collapses, and the days already passed start collapsed"
testOnDev: |
  | GIS Day: collapse each day on the Sessions page ([#3221](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3221)) | Not on dev: GIS Day has no dev site. On production, open Sessions during or after GIS Day week | A day before today (Central time) starts collapsed, its heading reading its date and "· N sessions"; today and later days start open; pressing a day's heading, or Enter or Space on it, opens and closes it; a search opens every day it finds something in; the Day 1, Day 2 links open the day they jump to; a past year's Sessions page (e.g. /2025/sessions) opens every day |
---

### GIS Day: Each day on the Sessions page collapses, and the days already passed start collapsed

During GIS Day week the Sessions page opened on the days already over, so a visitor scrolled past them to reach today.
Each day's heading now opens and closes it, and on the current year's page a day before today, in Central time, starts
collapsed, its heading giving its date and how many sessions it has. Today and the days to come start open. A search
opens every day it finds something in, and the Day 1, Day 2 links open the day they jump to. On a past year's page,
where every day has passed, every day starts open. Nothing is remembered between visits.

The day's heading uses the site's shared accordion, which now opens and closes when a page tells it to after it is
first drawn, and whose header is a button that works from the keyboard. AggieMap's bus stops list in the trip planner
binds that same setting to its toggle, so it should now follow it; that has not yet been checked in AggieMap itself.
([#3221](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3221))

| Before | After |
| --- | --- |
| ![The Sessions page on Thursday 19 November with a made-up season of four GIS Day days, the 17th to the 20th: every day open, each listing its three made-up sessions](../screenshots/3221-collapse-days/before-sessions.png) | ![The same page: Tuesday 17 and Wednesday 18, already passed, each collapsed to one line reading its date and "· 3 sessions" with a plus at the right; Thursday 19, today, and Friday 20 open, with a minus](../screenshots/3221-collapse-days/after-sessions.png) |
| | ![Tuesday 17 opened by pressing its heading: its three sessions listed, its count gone and its mark a minus; Wednesday 18 still collapsed](../screenshots/3221-collapse-days/after-opened.png) |
| | ![A search for "drone": every day open, the two past days included, each listing only its drone imagery session](../screenshots/3221-collapse-days/after-search.png) |
| | ![The 2025 Sessions page, a past year whose days have all passed: both days open](../screenshots/3221-collapse-days/after-past-year.png) |
| | ![The Sessions page on a phone, 390 pixels wide: each collapsed day's date on one line with "· 3 sessions" under it and the plus at the right, today and tomorrow open, nothing past the right edge](../screenshots/3221-collapse-days/after-sessions-phone.png) |
