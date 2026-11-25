---
issue: 2643
title: Times around midnight and noon are right on a 12-hour clock
testOnDev: |
  | Times at noon and after midnight ([#2643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2643), [#3464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3464)) | [dev.aggiemap.tamu.edu/map/d/bus](https://dev.aggiemap.tamu.edu/map/d/bus) and the trip planner | A bus timetable entry for just after midnight reads **12:0x AM**, not 12:0x PM, and sits at the start of the night's times rather than in the middle of the day. A trip step arriving at midday reads **12:xx PM**. Times at any other hour are unchanged |
---

### Times around midnight and noon are right on a 12-hour clock

Two faults in one small pair of functions, each the other's mirror, and both at the only two hours
where a 12-hour clock is awkward.

- **Showing a time:** the hour was reduced only when it was **above** 12, so **noon printed as `12:00 AM`**
  and a minute past midnight as `00:01 AM`
  ([#2643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2643)). Trip steps
  are where this showed.
- **Reading a time:** `12` was treated as noon whatever followed it, so **`12:05 AM` was read as five past
  noon** - twelve hours wrong, in the middle of the day
  ([#3464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3464)). Bus
  timetables are where this showed.

Both now follow the ordinary rule: **12 PM is noon, 12 AM is the hour after midnight**, and every other
hour is unchanged. A time written with neither AM nor PM keeps its hour, so a bare `12:00` is still noon.

**No before/after capture.** Showing either needs a real time at one of those two hours - a bus departure
between midnight and 1 AM, or a trip step landing in the midday minute. Contriving one with a frozen clock
would photograph the contrivance rather than the fault. The evidence is a unit test for each boundary that
fails on the old code and passes on the new.

| Issue                                                                                    | What                                                                                                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [#2643](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2643) | A time at noon reads 12 PM, and just after midnight 12 AM, instead of both reading AM with the wrong hour |
| [#3464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3464) | A time written `12:0x AM` is read as the hour after midnight, not as noon                                 |
