---
issue: 2942
title: "GIS Day admin: Escape on a details page goes back to its list"
testOnDev: |
  | GIS Day admin: Escape on a details page goes back to its list ([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942)) | Not on dev: GIS Day has no dev site. After release, at [gisday.tamu.edu/admin/events](https://gisday.tamu.edu/admin/events) choose last year's season, search, open an event and press Escape; open it again, change its name and press Escape; open the speaker search on it and press Escape | Escape goes back to the list with the same season and search. With the name changed it first asks "Leave without saving?" in the page: Keep editing stays with the change, Leave without saving goes back with nothing saved. In the open speaker search, Escape only closes the search |
---

### GIS Day admin: Escape on a details page goes back to its list

On the admin pages, Escape on an event's, a speaker's, a sponsor's or any other details page, a submission's review
and the add pages now goes back to the list the page was opened from, as closing a dialog does. The list is as it was
left: the same season, the same search, and on the Research Competitions list the same filters.

A page with changes not yet saved asks first, in the page: **Leave without saving?** Keep editing (or Escape again)
stays with the changes. An Escape that something else on the page uses is left to it: it closes an open drop-down, the
speaker search, a date or time picker, or a dialog, and the page stays. Choosing a day, a time or a speaker on an
event, a day on a season or a link on an organization now counts as a change, as typing does.
([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942))

| Before | After |
| --- | --- |
| ![The Events list for 2025, searched for WORKSHOP](../screenshots/2942-admin-escape-back/before-1-list.png) | ![Back on the Events list after Escape, still 2025 and still searched for WORKSHOP](../screenshots/2942-admin-escape-back/after-2-escape-unchanged.png) |
| ![Escape on the event's edit page did nothing](../screenshots/2942-admin-escape-back/before-2-escape.png) | ![With the name changed, Escape asks "Leave without saving?" in the page](../screenshots/2942-admin-escape-back/after-3-asks.png) |
