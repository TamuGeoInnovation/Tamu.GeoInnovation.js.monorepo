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

| Before | After |
| --- | --- |
| ![Admin, Events for 2026: the search and the list of 46 events, with no way to pick out the untagged ones](../screenshots/3034-untagged-sessions/before-events.png) | ![The same list, with an unticked "Only sessions with no tags" box under the search](../screenshots/3034-untagged-sessions/after-events.png) |
| | ![Ticked: 1 event, the one 2026 session with no tags](../screenshots/3034-untagged-sessions/after-events-no-tags.png) |
| | ![That session's edit page with the Career tag ticked, before Update](../screenshots/3034-untagged-sessions/after-edit-tag-ticked.png) |
| | ![Back on the list after saving: still ticked, 0 events, the tagged session gone](../screenshots/3034-untagged-sessions/after-events-no-tags-tagged.png) |
| | ![2025, ticked: 10 events, the sessions with no tags, under their days](../screenshots/3034-untagged-sessions/after-events-no-tags-2025.png) |
