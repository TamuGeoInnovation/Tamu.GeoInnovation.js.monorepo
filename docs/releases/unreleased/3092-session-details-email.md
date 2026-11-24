---
issue: 3092
app: gisday
title: "GIS Day admin: a session's speakers get its details by email, and a page's email actions are one menu"
testOnDev: |
  | GIS Day admin: the session details email, and email actions in one menu ([#3092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3092)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a hybrid session that has speakers and a broadcast under [Events](https://txgisday.org/admin/events); then [Research Competitions](https://txgisday.org/admin/research-competition) with one submission selected | The session's Speakers section has one **Email these speakers** button; it opens a menu of **Profile email** and **Session details**, and Escape or a click elsewhere closes it. Session details opens the profile email's window with the subject and text filled in from the session: its day and time in Central, its room "and online", the broadcast's link, password, dial-in number and meeting ID, the check-in QR code note and the session's requirements, with a preview for the first speaker. Cancel sends nothing. Research Competitions' bar shows Approve, Reject, **Email** and Delete; Email opens **Profile email** and **Final reminder**, each opening its window as before |
---

### GIS Day admin: a session's speakers get its details by email, and a page's email actions are one menu

A session's admin page could email its speakers only their profile links. It can now send them the session's details
too, and both emails are in one **Email these speakers** menu, so email actions no longer stack across the page.

- **Session details** opens the window the profile and acceptance emails use: the subject and text editable, Markdown,
  and a preview of what the first speaker gets, with anyone who has no email address named before sending. The text
  starts from the session as it is saved: its name; its day and time in Central; its building and room, or "Online"
  for a virtual session; for a hybrid or virtual one, its broadcast's link, password, dial-in number and meeting ID, as
  the session's page shows them; that attendees check in by scanning the session's QR code, shown at the session; and
  what to bring, from the session's requirements.
- It is sent like the profile email: several at a time, only by an admin who can edit speakers, and never twice to the
  same speaker for the same session within 10 minutes, so a repeated request emails no one twice.
- **Research Competitions'** selection bar has one **Email** menu, **Profile email** and **Final reminder**, in place
  of the two actions side by side. Approve, Reject and Delete are unchanged.
- The menu is a shared one (`tamu-gisc-action-menu`) that works from the keyboard and with a screen reader: the arrow
  keys move through it, Enter chooses, and Escape closes it without leaving the page.

([#3092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3092))

| On the local site, as an admin, with made-up test speakers | Before | After |
| --- | --- | --- |
| A session's Speakers section | ![Send profile emails to these speakers, a link on its own](../screenshots/3092-session-details-email/before-session-speakers.png) | ![One Email these speakers button with a drop-down arrow](../screenshots/3092-session-details-email/after-session-speakers.png) |
| The menu open | | ![Profile email and Session details in a small menu under the button](../screenshots/3092-session-details-email/after-session-menu-open.png) |
| The session details email | | ![The window with the subject and text filled in from the session, and its preview](../screenshots/3092-session-details-email/after-session-details-window.png) |
| Its preview, closer | | ![When, where, the session page, the online link, password, dial-in and meeting ID, check-in by QR code and what to bring](../screenshots/3092-session-details-email/after-session-details-preview.png) |
| Research Competitions, one selected | ![Approve, Reject, Send profile email, Send final reminder and Delete side by side](../screenshots/3092-session-details-email/before-research-competition-bar.png) | ![Approve, Reject, Email and Delete](../screenshots/3092-session-details-email/after-research-competition-bar.png) |
| Its Email menu open | | ![Profile email and Final reminder in a menu above the bar](../screenshots/3092-session-details-email/after-research-competition-menu.png) |
