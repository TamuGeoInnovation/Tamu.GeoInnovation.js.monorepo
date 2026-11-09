---
issue: 2754
title: Fall Commencement offers the December 2026 dates
testOnDev: |
  | Fall Commencement dates ([#2754](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2754)) | [Fall Commencement](https://dev.aggiemap.tamu.edu/events/graduation-fall) | The two choices read **Friday, December 11th** and **Saturday, December 12th**. Neither December 17th nor December 18th appears. Picking either one opens the map for that day |
---

### Fall Commencement offers this December's dates, and a check for maps left on a past season

The Fall Commencement map offered **Wednesday, December 17th** and **Thursday, December 18th** — the
2025 ceremonies. Every other graduation map had been rolled forward; this one had not, so a visitor
planning for this December was choosing between two dates that had already passed
([#2754](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2754)).

It offers **Friday, December 11th** and **Saturday, December 12th** now.

**Nothing was going to catch this.** The labels carry a weekday and no year, and 17 December really was
a Wednesday in 2025, so the page reads as correct. The map draws, so the smoke suite passes — the dates
are configuration, not a service. The existing `event-dates.spec.ts` checks a map's dates are
*consistent* with each other, not that any of them is still ahead.

So this also adds a check that fails when a map is stranded on a past season: an event within 60 days
still carrying last year's dates, or dates more than 396 days old on a map not marked retired. Around
forty event maps exist and nothing noticed when one was left behind.

| | Before | After |
| --- | --- | --- |
| Fall Commencement date choices | ![December 17th and 18th, the 2025 ceremonies](../screenshots/2754-fall-graduation-dates/before-dates.png) | ![December 11th and 12th](../screenshots/2754-fall-graduation-dates/after-dates.png) |

The dates come from [the University's published graduation
schedule](https://aggie.tamu.edu/graduation-and-beyond/commencement-details/graduation-schedule.html),
confirmed by the maintainer, rather than inferred from a calendar — which is the assumption that
produced the original fault.
