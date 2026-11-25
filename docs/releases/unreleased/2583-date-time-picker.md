---
issue: 2583
app: aggiemap
title: Dates and times are chosen or typed exactly, on a calendar and a list of times
testOnDev: |
  | Date and time pickers: every key of a typed time counts ([#2583](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2583)) | AggieMap: [a trip on dev](https://dev.aggiemap.tamu.edu/map/d/trip?mode=1&stops=30.6150,-96.3500@30.6150,-96.3300), then Leave now, changed to Leave at. GIS Day is not on dev ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)); on production after release, as an admin: [VGI Competition, Form Designer](https://txgisday.org/admin/competitions/designer) | Open the picker: a date field with a calendar button and a time field with a clock button. Choose a date from the calendar: the picker stays open. Type a time such as 11:30 AM and press Enter: 11:30 is set, not 11:03. In the Designer, the Central-time line under "Submissions stop counting at" shows exactly the time chosen, and Save keeps it. GIS Day event times still open their list of times at once |
---

### Dates and times are chosen or typed exactly

The shared date and time picker, used by the GIS Day VGI Form Designer and event forms and by AggieMap's trip
planner, was the browser's own date-and-time box. Once that box holds a whole value it reports a change on every
key, and the picker closed on the first one. Typing "30" into the minutes kept only the 3 and saved 11:03, and the
maintainer needed four saves to set the 2026 VGI scoring window: the cutoff kept saving as 11:30 while 11:00 was
being chosen.

A date is now chosen from a calendar or typed, and a time chosen from the list of times or typed, both Angular
Material's own, with their keyboard and screen-reader support. Each takes effect once it is chosen, or a typed one is
left or entered, never on a single key. A picker of both stays open after the date until the time is set. A time
alone (the GIS Day event times) and a date alone (the GIS Day season days) open their list or calendar at once, as
before ([#2583](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2583)).

| | Before | After |
| --- | --- | --- |
| The Designer's "Submissions stop counting at", opened | ![The browser's date and time box](../screenshots/2583-date-time-picker/before-designer-open.png) | ![A date field and a time field](../screenshots/2583-date-time-picker/after-designer-open.png) |
| "30" typed into the minutes of 11:00 AM | ![11:03 AM was set](../screenshots/2583-date-time-picker/before-designer-typed-30.png) | ![11:30 AM is set](../screenshots/2583-date-time-picker/after-designer-typed-30.png) |
| The date, chosen | | ![The calendar, with 20 November chosen](../screenshots/2583-date-time-picker/after-designer-calendar.png) |
| The time, chosen | | ![The list of times](../screenshots/2583-date-time-picker/after-designer-times.png) |
| A GIS Day event's start time | ![The list of times](../screenshots/2583-date-time-picker/before-event-times.png) | ![The same list, with a clock button beside the field](../screenshots/2583-date-time-picker/after-event-times.png) |
