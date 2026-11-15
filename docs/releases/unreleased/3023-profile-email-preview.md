---
issue: 3023
title: "GIS Day admin: the presenter profile email is read and edited before it is sent, from all three places that send it"
testOnDev: |
  | GIS Day admin: the profile email, read and edited first ([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023)) | Not on dev: GIS Day has no dev site. After release, as an admin: [Speakers](https://txgisday.org/admin/speakers), select one, **Email edit links**; an event's page, **Email speakers their edit links**; [Research Competitions](https://txgisday.org/admin/research-competition), select, **Send profile email** | Each opens the same window: the subject and the text, editable, with a preview for the first person in which the link reads "(their own edit link, added when it is sent)", never a real one. Edit a word and send: the email arrives as edited, with its own link. Remove {edit link} from the text and send: it is refused and nothing goes. Cancel sends nothing |
---

### GIS Day admin: the presenter profile email is read and edited before it is sent

The email that brings a speaker their own link to update their presenter profile went out unseen from the Speakers
list and an event's page, and after a yes/no question from Research Competitions. All three now open the same window
the acceptance emails use: the subject and the text, both editable, today's as the default, with a preview of what the
first person gets. Its placeholders are {first name}, {site}, {site address}, {edit link} and {link expires}.

Each person's own link is made and filled in only when their email is sent, so the preview never shows a real link
and an edit cannot break one. A text without {edit link} is refused, and nothing is sent.
([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023))
