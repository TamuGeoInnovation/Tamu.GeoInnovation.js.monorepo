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
