---
issue: 2936
app: gisday
title: "GIS Day: speakers update their own presenter profile through an emailed link, approved by an admin"
testOnDev: |
  | GIS Day: speakers edit their own profile ([#2936](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2936)) | Not on dev: GIS Day has no dev site. After release, on [Speakers](https://txgisday.org/admin/speakers) select yourself and choose **Email edit links**; open the link from the email, change your bio and send it; then open **Edits to review** | The link opens your profile with no sign-in; a `javascript:` link is refused; the edit waits under **Edits to review**, Now beside Proposed, and appears on your public presenter page only after **Approve** |
---

### GIS Day: speakers update their own presenter profile through an emailed link, approved by an admin

Speakers can now update their own bio, photo, affiliation and link, without an account and without an organizer typing
it in. An admin emails them a personal link, from **Speakers** (select speakers, then **Email edit links**) or from an
event's page (**Email edit links to these speakers**, everyone on the session at once); a speaker can also ask for one at
`/presenters/edit` with the address on their record. The link opens their profile only, works for seven days, and can be
used as often as they like.

Nothing they send is public until an admin approves it under **Speakers, Edits to review**, which shows each change as
it is now beside what was proposed. A link reaches one speaker and nothing else: the server finds the speaker from the
link itself, keeps only a fingerprint of it, and accepts only the bio, photo, affiliation and link. Scripts in a bio are
stripped as they already were, a link must be a web address, and photos are JPEG or PNG, checked and resized as an
admin's uploads are.
([#2936](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2936))

| The speaker's page | The admin's review |
| --- | --- |
| ![A speaker's own edit page, opened from their link](../screenshots/speaker-self-edit/speaker-page.png) | ![Edits to review: the profile now beside the proposed changes, with Approve and Reject](../screenshots/speaker-self-edit/review.png) |
