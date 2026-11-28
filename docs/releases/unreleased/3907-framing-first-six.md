---
issue: 3907
app: aggiemap
title: Fire School, Cross Country Parking and High School Graduation open with their layers in view
testOnDev: |
  | Three maps' framing ([#3907](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3907)) | [Fire School](https://dev.aggiemap.tamu.edu/events/fire-school), [Cross Country Parking](https://dev.aggiemap.tamu.edu/parking/cross-country-parking) and [High School Graduation](https://dev.aggiemap.tamu.edu/events/hs-graduation-2026), on a phone and a desktop | Fire School opens with all its parking lots in view on a desktop and its road closures on a phone; Cross Country with both lots, 126 and 129, on either; Graduation with its traffic advisories and its parking together on a desktop. Until this release reaches production and the framing baseline is refreshed from it, the framing smoke check reports these maps at their new centres, which is expected (#1501) |
---

### Fire School, Cross Country Parking and High School Graduation open with their layers in view

Three maps opened at a centre that cut off one of their own layers, though the zoom they open at would fit it: Fire
School's parking lots ran off the bottom of a desktop's map and its road closures off the side of a phone's, Cross
Country's Lot 129 off the top, and Graduation's traffic advisories off the bottom of a desktop's. Each now opens centred
on what it shows, at the same zoom. The first of several such handfuls; the rest are listed in the issue.
([#3907](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3907))

|                        | Before                                                                                                                                                        | After                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fire School, desktop   | ![Fire School on a desktop, its lots running off the bottom](../screenshots/3907-framing-first-six/before-fire-school-desktop.png)                            | ![Fire School on a desktop with all its lots in view](../screenshots/3907-framing-first-six/after-fire-school-desktop.png)                                |
| Fire School, phone     | ![Fire School on a phone, its road closures off the left edge](../screenshots/3907-framing-first-six/before-fire-school-phone.png)                            | ![Fire School on a phone with its road closures in view](../screenshots/3907-framing-first-six/after-fire-school-phone.png)                               |
| Cross Country, desktop | ![Cross Country Parking on a desktop, Lot 129 cut off at the top](../screenshots/3907-framing-first-six/before-cross-country-desktop.png)                     | ![Cross Country Parking on a desktop with both lots in view](../screenshots/3907-framing-first-six/after-cross-country-desktop.png)                       |
| Cross Country, phone   | ![Cross Country Parking on a phone, a lot off the edge](../screenshots/3907-framing-first-six/before-cross-country-phone.png)                                 | ![Cross Country Parking on a phone with both lots in view](../screenshots/3907-framing-first-six/after-cross-country-phone.png)                           |
| Graduation, desktop    | ![High School Graduation on a desktop, the traffic advisories running off the bottom](../screenshots/3907-framing-first-six/before-hs-graduation-desktop.png) | ![High School Graduation on a desktop with the advisories and the parking in view](../screenshots/3907-framing-first-six/after-hs-graduation-desktop.png) |
| Graduation, phone      | ![High School Graduation on a phone](../screenshots/3907-framing-first-six/before-hs-graduation-phone.png)                                                    | ![High School Graduation on a phone at its new centre](../screenshots/3907-framing-first-six/after-hs-graduation-phone.png)                               |

"Before" is production; "after" is a development build of this change run locally, reading production's GIS services.
