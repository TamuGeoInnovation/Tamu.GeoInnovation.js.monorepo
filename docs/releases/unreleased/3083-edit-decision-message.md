---
issue: 3083
app: gisday
title: "GIS Day admin: a speaker-edit decision that fails says why"
testOnDev: |
  | GIS Day admin: why a speaker-edit decision failed ([#3083](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3083)) | Not on dev: GIS Day has no dev site. After release, as an admin open Admin > Speakers > edits with a pending edit open in two tabs; approve it in one, then approve it in the other | The second says "Could not save the decision" with "That edit is not waiting for review.", not "Please try again." An account without update:speakers is told which permission it lacks |
---

### GIS Day admin: a speaker-edit decision that fails says why

When approving or rejecting a speaker's edit failed, Admin > Speakers > edits said only "Please try again.", whatever
the server answered. It now says the server's own reason (for example "That edit is not waiting for review." when
another admin got there first), names the permission an account lacks as the dashboards do, and keeps "Please try again."
for when the server itself failed.
([#3083](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3083))

| Admin, Speakers, edits, 1280 pixels | Before | After |
| --- | --- | --- |
| The edit was already decided (404) | ![Could not save the decision, Please try again](../screenshots/3083-edit-decision-message/before-404.png) | ![That edit is not waiting for review](../screenshots/3083-edit-decision-message/after-404.png) |
| The account lacks the permission (403) | ![Could not save the decision, Please try again](../screenshots/3083-edit-decision-message/before-403.png) | ![The missing permission named](../screenshots/3083-edit-decision-message/after-403.png) |
