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
binds the same setting, so it now opens with its toggle as that code intended.
([#3221](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3221))
