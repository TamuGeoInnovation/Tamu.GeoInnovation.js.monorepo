---
issue: 3114
title: Texas A&M GIS Day's emails use the GIS Day email design
testOnDev: |
  | GIS Day: emails from gisday.tamu.edu ([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: open Send profile email, Send session details or a review decision, and send one to yourself | The window's preview shows the whole email in the Texas A&M GIS Day design: the maroon bar, GIS DAY(S) with this season's dates and days, the text, the session's details where there is one, and a sign-off from the address chosen in Send as. It arrives looking the same, with a plain-text version for mail apps that show no HTML, and no unsubscribe line. On txgisday.org the same emails stay plain |
---

### GIS Day: Texas A&M GIS Day's emails use the GIS Day email design

Every email gisday.tamu.edu sends to a person now arrives in the Texas A&M GIS Day email design the department uses for
its campaign emails, rather than as plain text
([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)):

- a maroon top bar, a title block with this season's dates, and a strip of the season's days, all filled in from the
  season rather than typed;
- the email's own text, as edited in the window, with its Markdown formatting;
- for the session details email, the session's name, when, where and online link in a details box;
- a sign-off with the name and address chosen in Send as, and a footer saying why the person is getting it, with no
  unsubscribe line, since each is a one-to-one email about the person's own profile, session or submission.

That covers the presenter profile email and edit links, the session details email, and the competition's decision,
finalist and reminder emails. Each still carries a plain-text version. The email window's preview shows the whole email
as it will arrive. txgisday.org and the UCGIS site keep their plain emails until each has a design of its own.

| The email window's preview, 1280 pixels | Before | After |
| --- | --- | --- |
| gisday.tamu.edu, profile email: title block | ![The profile email as plain text](../screenshots/3114-tamu-email-design/before-profile.png) | ![The maroon bar, YOUR PRESENTER PROFILE, GIS DAY(S), November 16–20, 2026 and the day strip](../screenshots/3114-tamu-email-design/after-profile-title.png) |
| gisday.tamu.edu, profile email: sign-off | | ![The text's closing line, the divider and the footer, with no unsubscribe line](../screenshots/3114-tamu-email-design/after-profile-signoff.png) |
| gisday.tamu.edu, session details: title block | ![The session details email as plain text](../screenshots/3114-tamu-email-design/before-session-details.png) | ![YOUR SESSION over GIS DAY(S), the season's dates and days](../screenshots/3114-tamu-email-design/after-session-details-title.png) |
| gisday.tamu.edu, session details: text | | ![The email's own text, with its Markdown formatting](../screenshots/3114-tamu-email-design/after-session-details-text.png) |
| gisday.tamu.edu, session details: details box and sign-off | | ![The session's name, when, where and online link in the details box, then the footer](../screenshots/3114-tamu-email-design/after-session-details-box.png) |
| gisday.tamu.edu, review decision (Approve): title block | ![The acceptance email as plain text](../screenshots/3114-tamu-email-design/before-review.png) | ![YOUR SUBMISSION over GIS DAY(S), the season's dates and days](../screenshots/3114-tamu-email-design/after-review-title.png) |
| gisday.tamu.edu, review decision (Approve): sign-off | | ![The closing lines and the footer about the person's submission](../screenshots/3114-tamu-email-design/after-review-signoff.png) |
| txgisday.org, session details | | ![The same email, still plain](../screenshots/3114-tamu-email-design/after-txgisday-plain.png) |
