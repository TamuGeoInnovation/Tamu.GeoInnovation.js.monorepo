---
issue: 3552
app: gisday
title: GIS Day's dates are Central time wherever the visitor is
testOnDev: |
  | Dates in Central time ([#3552](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3552)) | GIS Day dev site: the home page and About, with the browser's time zone set to Pacific (Chrome DevTools, More tools, Sensors, Location: a Pacific location, or the computer's time zone) | The season's days read the same as in Central time: the home page's heading and About's "five event-packed days, November …" name the same days as the Sessions page, not each one a day earlier. Admin, Seasons lists the same days too |
---

### GIS Day's dates are Central time wherever the visitor is

GIS Day's pages showed dates in the visitor's own time zone. A season day is stored as midnight Central, which is the
evening before anywhere west of Central, so a visitor in Pacific time read the home page and About as "November
15-19" for a GIS Day held on the 16th to the 20th. Every date on the site, in 26 templates, now goes through one
shared `centralDate` pipe and reads as it does in Central time, wherever the visitor is.
([#3552](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3552))

In Pacific time:

| Before                                                                                                                                   | After                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ![The home page in Pacific time, reading November 15-19, 2026](../screenshots/3552-central-dates/home-before-pacific-1280.png)           | ![The home page in Pacific time, reading November 16-20, 2026](../screenshots/3552-central-dates/home-after-pacific-1280.png)           |
| ![About in Pacific time: five event-packed days, November 15-19, 2026](../screenshots/3552-central-dates/about-before-pacific-1280.png)  | ![About in Pacific time: five event-packed days, November 16-20, 2026](../screenshots/3552-central-dates/about-after-pacific-1280.png)  |
| ![The home page on a phone in Pacific time, reading November 15-19, 2026](../screenshots/3552-central-dates/home-before-pacific-390.png) | ![The home page on a phone in Pacific time, reading November 16-20, 2026](../screenshots/3552-central-dates/home-after-pacific-390.png) |

In Central time nothing changes: both builds read November 16-20.

| Before                                                                                                                         | After                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| ![About in Central time before, reading November 16-20, 2026](../screenshots/3552-central-dates/about-before-central-1280.png) | ![About in Central time after, reading November 16-20, 2026](../screenshots/3552-central-dates/about-after-central-1280.png) |
