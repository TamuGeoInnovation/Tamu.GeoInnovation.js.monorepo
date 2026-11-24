---
issue: 2893
title: "GIS Day admin: the Check-ins dashboard shows walk-ins, the show-up rate, and check-ins outside a session's time"
testOnDev: |
  | GIS Day admin: Check-ins dashboard, the rest of #2893 ([#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893)) | Not on dev: GIS Day has no dev site. After release, as an admin open Admin > Dashboards > Check-ins for 2026 | Beside **RSVPs**, each event has **Walk-ins** (people who checked in without an RSVP to it) and **Showed up** (the share of its RSVPs who checked in, or "–" for an event nobody RSVP'd to), and the total row gives the season's rate. Open an event that had check-ins before its window: those people say "Outside the session's time" under their time, and the CSV has an **Outside session time** column with "yes" for them |
---

### GIS Day admin: the Check-ins dashboard shows walk-ins, the show-up rate, and check-ins outside a session's time

The Check-ins dashboard (#3006) put each event's check-ins beside its RSVPs. It now also counts, for each event, its
**walk-ins**, people who checked in without having RSVP'd to that event, and how many of the people who RSVP'd
**showed up**, as a share of its RSVPs. The total row gives the whole season's rate, not a sum of percents
([#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893)).

An event's list of who checked in now marks anyone who checked in **outside the session's time**, which an admin
check-in or a session that allows check-in at any time can record
([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)). Its CSV has a column for
the same.

With the two new columns, the table no longer fits beside the admin menu at 1280 pixels: it scrolls sideways in its
own box, with its scrollbar in view, as it already does on a narrower screen.

Images to follow: the page needs a signed-in admin.
