---
issue: 3104
title: "GIS Day admin: choose which speakers get an email, together or a copy each"
testOnDev: |
  | GIS Day admin: which speakers get an email, together or a copy each ([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a hybrid session with two or more speakers under [Events](https://txgisday.org/admin/events), then Email these speakers, Session details; then Email these speakers, Profile email | Session details: **Who gets it** lists every speaker with an address, all ticked, with **One email to all of them together** chosen; the preview's **To:** has every address and the greeting names them all ("Howdy Ana and Ben,"), and the button says **Send 1 email**. **A copy each** shows the first ticked speaker and one email each; unticking a speaker leaves them out. A broadcast with no dial-in number has no "Dial-in number" line. Profile email: the same tick boxes, no together choice, and a line saying each speaker gets their own copy because it carries their own edit link. Cancel sends nothing |
---

### GIS Day admin: choose which speakers get an email, together or a copy each

The session details email went to every speaker on the session, a copy each, and the profile email to every speaker the
page named. The email window now lists the speakers, so the admin chooses who gets it.

- **Who gets it**: each speaker with an address has a tick box, all ticked to start. Anyone without an address is still
  named above, as before. Nothing can be sent with no one ticked.
- **One email to all of them together, or a copy each.** With more than one speaker ticked, the session details email
  goes to all of them together by default: one email with every one on the To line, so they see each other and can
  reply to all, and a greeting that names them all ("Howdy Ana and Ben,", "Howdy Ana, Ben and Cara,"). The preview shows
  that email exactly. **A copy each** sends each their own, as before.
- **The repeat guard counts a together email once**, for its whole group: sent again within 10 minutes, it is skipped
  once, naming the group, and each of the group counts as emailed.
- **The profile email is always a copy each.** It carries each speaker's own link to edit their profile, so one email to
  several would hand each of them the others' links. The window says so, and the API refuses a profile email asked to go
  together. Its tick boxes work the same way, from the Speakers list, an event and Research Competitions.
- **A broadcast line with no value is left out** of the session details email: "Dial-in number: None" is no longer
  written when a broadcast has no phone number.

Any speaker email the window sends can offer the same choice, which the coming slides request
([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113)) will use.

([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104))

| On the local site, as an admin, with a made-up hybrid session and three made-up speakers | Before | After |
| --- | --- | --- |
| Session details: the window's top | ![No list of speakers: each person gets their own copy](../screenshots/3104-speaker-choice/before-session-details-composer.png) | ![Who gets it: three speakers ticked, and One email to all of them together chosen](../screenshots/3104-speaker-choice/after-session-details-composer.png) |
| Session details: the preview | ![As the first speaker gets it, To one address, with Dial-in number: None](../screenshots/3104-speaker-choice/before-session-details-preview.png) | ![The one email to all of them: every address on To, Howdy Ana, Ben and Cara, and no dial-in line](../screenshots/3104-speaker-choice/after-session-details-preview.png) |
| A copy each, one speaker unticked | | ![Two ticked, A copy each chosen, two emails](../screenshots/3104-speaker-choice/after-session-details-copy-each.png) |
| Profile email | ![No list of speakers](../screenshots/3104-speaker-choice/before-profile-composer.png) | ![The same tick boxes, no together choice, and why: each copy carries the speaker's own edit link](../screenshots/3104-speaker-choice/after-profile-composer.png) |

The local test account's address is not a tamu.edu one and the local site has no `MAILROOM_FROM`, so the windows say the
email will be sent from the site's address (the Send as box of
[#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100), on which this is built).
