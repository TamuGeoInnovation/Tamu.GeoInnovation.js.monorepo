---
issue: 2886
title: "GIS Day admin: the RSVP chart redrawn, readable at any width, with each day's numbers on hover"
testOnDev: |
  | GIS Day admin: the RSVP chart redrawn ([#2886](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2886)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps) on a wide screen | The chart about 320 px tall, with text the page's size; the scale ending just above the total; hovering a day shows its total and its new RSVPs; each day's new RSVPs as columns beneath; GIS Day week shaded; dragging across zooms in, and double-click shows it all; opening an event adds its line and a legend |
---

### GIS Day admin: the RSVP chart redrawn, readable at any width, with each day's numbers on hover

The **RSVPs over time** chart on the RSVP dashboard is drawn again, with amCharts. The first version scaled with the
page, so on a wide screen it stood about 600 px tall, with text and dots several times the page's size, a scale running
to 1,500 for a total of 1,071, and no numbers anywhere.

Now the chart is a fixed 320 px tall, at the page's own text size, and its scale ends just above the total.
- **Hovering** any day shows that day's total and how many RSVPs it gained.
- **Columns under the line** show each day's new RSVPs, so the days that drove sign-ups stand out.
- **The GIS Day week is shaded.**
- **Dragging across the chart** zooms into a stretch of time, and a double-click shows it all again.
- **Opening an event** adds its own line and a legend, as before.

([#2886](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2886))

| Before | After |
| --- | --- |
| ![The old chart at 1920 px wide: tall, with large text and a dot on every day](../screenshots/rsvp-chart/chart-1920-before.png) | ![The new chart at 1920 px wide: 320 px tall, columns of new RSVPs beneath, GIS Day week shaded](../screenshots/rsvp-chart/chart-1920-after.png) |

![Hovering a day: its total and its new RSVPs](../screenshots/rsvp-chart/chart-hover-after.png)

![An event opened: its own line and a legend](../screenshots/rsvp-chart/chart-event-after.png)

![Zoomed into October by dragging across the chart](../screenshots/rsvp-chart/chart-zoomed-after.png)
