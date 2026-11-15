---
issue: 3034
title: "GIS Day admin: Events can list only the sessions with no tags"
testOnDev: |
  | GIS Day admin: the sessions with no tags ([#3034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3034)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Events](https://txgisday.org/admin/events) and tick **Only sessions with no tags** | Only sessions with no tags are listed. Open one, give it a tag, save, and come back: it is gone from the list, and the box is still ticked. Untick it and every session is listed again. On gisday.tamu.edu, still only Texas A&M's unless "Show every organization's sessions" is ticked |
---

### GIS Day admin: Events can list only the sessions with no tags

Finding the sessions with no tags meant opening every one. Admin, Events now has **Only sessions with no tags**, beside
the list's other filters: ticked, it lists only those, each opening in the editor as before. The list shrinks as they are
tagged, and the choice is kept when an admin comes back from a session.
([#3034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3034))
