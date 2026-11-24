---
issue: 3023
app: gisday
title: "GIS Day admin: the presenter profile email is read and edited before it is sent, from all three places that send it"
testOnDev: |
  | GIS Day admin: the profile email, read and edited first ([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023)) | Not on dev: GIS Day has no dev site. After release, as an admin: [Speakers](https://txgisday.org/admin/speakers), select one, **Send profile email**; an event's page, **Send profile emails to these speakers**; [Research Competitions](https://txgisday.org/admin/research-competition), select, **Send profile email** | Each opens the same window: the subject and the text, editable, with a preview for the first person in which the link reads "(their own edit link, added when it is sent)", never a real one. Edit a word and send: the email arrives as edited, with its own link. Remove {edit link} from the text and send: it is refused and nothing goes. Cancel sends nothing |
---

### GIS Day admin: the presenter profile email is read and edited before it is sent

The email that brings a speaker their own link to update their presenter profile went out unseen from the Speakers
list and an event's page, and after a yes/no question from Research Competitions. All three now open the same window
the acceptance emails use: the subject and the text, both editable, today's as the default, with a preview of what the
first person gets. Its placeholders are {first name}, {site}, {site address}, {edit link} and {link expires}.

Each person's own link is made and filled in only when their email is sent, so the preview never shows a real link
and an edit cannot break one. A text without {edit link} is refused, and nothing is sent.
([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023))

| Before (`development`, the local site): sent with no window from Speakers, and after a yes/no question from Research Competitions | After (the local site): the same window from all three, its subject and text editable, the preview's link a stand-in |
| --- | --- |
| ![Speakers before, a test speaker selected and Send profile email among the actions, which sent at once with nothing shown](../screenshots/3023-profile-email-preview/before-speakers-selected.png) | ![The profile email's window from Speakers: the subject and the text editable, and a preview for the first speaker in which the link reads (their own edit link, added when it is sent)](../screenshots/3023-profile-email-preview/after-speakers-window.png) |
| ![Research Competitions before, Send profile email asking only Send profile emails to the 1 person of 1 submission?, with Cancel and Send](../screenshots/3023-profile-email-preview/before-research-competition-confirmation.png) | ![The same window from Research Competitions, saying first how many people of how many submissions it is for](../screenshots/3023-profile-email-preview/after-research-competition-window.png) |
| | ![The same window from an event's Send profile emails to these speakers](../screenshots/3023-profile-email-preview/after-event-window.png) |
