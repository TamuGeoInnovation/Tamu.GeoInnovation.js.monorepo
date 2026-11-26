---
issue: 3551
title: Construction project dates no longer show a day early
testOnDev: |
  | Construction dates ([#3551](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3551)) | The Construction map on the dev event maps, `/construction-map`: click ARFF Station, by Easterwood Airport. Then any construction project on the Tailgating map | ARFF Station reads **Start Date: January 1, 2025** and **End Date: December 31, 2026**, not December 31, 2024 and December 30, 2026. Every project's dates match the dates Transportation published for it |
---

### Construction project dates no longer show a day early

Every date in a construction project's popup showed a day early for anyone in Central time
([#3551](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3551)). A project starting on
1 January 2025 read "December 31, 2024". The service stores a date with no time as midnight UTC, which is 6 PM the
evening before in College Station, and the popup showed it as that moment rather than as the date it is.

Popups now show the date itself, on the Construction map and on the Tailgating map, which shows the same projects. It is
the third fault of this kind in a week, after an event's notice that vanished at 7 PM on the day of the event and noon
printed as 12:00 AM. The popups now use the same shared date code that fixed the first of those.

| Before                                                                                                                                     | After                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| ![ARFF Station's popup reading December 31, 2024 to December 30, 2026](../screenshots/3551-construction-popup-dates/before-arff-popup.png) | ![The same popup reading January 1, 2025 to December 31, 2026](../screenshots/3551-construction-popup-dates/after-arff-popup.png) |
