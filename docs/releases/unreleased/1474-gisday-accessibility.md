---
issue: 1474
title: GIS Day's buttons and links can be reached and used from the keyboard
testOnDev: |
  | GIS Day: using the site from the keyboard ([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org](https://txgisday.org), [the FAQ](https://txgisday.org/faq) and, signed in as an admin, [Admin, then Events](https://txgisday.org/admin/events) | With Tab alone you can reach Login, each FAQ question, the Sessions filters and an admin list's Copy, Delete, Show and Hide, and Enter or Space works each one. Every page looks as it did |
---

### GIS Day: buttons and links can be reached and used from the keyboard

Many of GIS Day's controls could be clicked with a mouse but not reached with the Tab key or worked with Enter
or Space: Login and Logout in the header, the FAQ's questions, the Sessions filters, the admin lists' Copy,
Delete, Show and Hide, and others. They now can, and each says what it is to a screen reader. Photos that carry
meaning have descriptions; purely decorative images are marked as such. The checks that catch these problems,
turned off during the Angular 22 upgrade, are back on for every GIS Day project, so new ones fail the build.
Nothing else looks different: the only change on screen is the focus outline, where Tab can now land
([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)).

Before, Tab jumped past each of these to the next link; after, it stops on them:

| | Before | After |
| --- | --- | --- |
| Header: Login/Signup | ![Tab skips Login and lands on Sessions](../screenshots/1474-gisday-accessibility/before-header-login.png) | ![Login/Signup has focus](../screenshots/1474-gisday-accessibility/after-header-login.png) |
| FAQ: a question | ![Tab skips the questions](../screenshots/1474-gisday-accessibility/before-faq-question.png) | ![The first question has focus](../screenshots/1474-gisday-accessibility/after-faq-question.png) |
| FAQ: Enter opens it | | ![The question opened with Enter](../screenshots/1474-gisday-accessibility/after-faq-opened.png) |
| Admin, Events: the selected-rows actions | ![Tab skips Show on schedule](../screenshots/1474-gisday-accessibility/before-admin-events-actions.png) | ![Show on schedule has focus](../screenshots/1474-gisday-accessibility/after-admin-events-actions.png) |
| Admin, a season: add a day | ![Tab skips the add-day tile](../screenshots/1474-gisday-accessibility/before-season-day-tile.png) | ![The add-day tile has focus](../screenshots/1474-gisday-accessibility/after-season-day-tile.png) |
