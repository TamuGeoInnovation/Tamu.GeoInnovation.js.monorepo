---
issue: 2058
app: geoservices
title: Geoservices' clickable controls work from the keyboard
testOnDev: |
  | Geoservices: keyboard controls ([#2058](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2058)) | Wherever Geoservices' front end is served (or locally, `nx serve geoservices-angular`): the banner, an interactive service page's summary and fields, the pricing page | Tab reaches the banner's dismiss, the summary's close and "here", Reset, "See all fields", "Deselect All" and the pricing call to action; each shows focus, and Enter (or Space) does what a click does |
---

### Geoservices' clickable controls work from the keyboard

Eight of Geoservices' controls were a span, a div, a paragraph or a link with no address that only a mouse could use: the revival
modal's and banner's dismiss, the summary blurb's close and "here", Reset, "See all fields", "Deselect All" and the pricing call to action.
Tab now reaches each of them, and Enter or Space does what a click does, the way the shared menu tiles' back button already works. The
seven template accessibility rules that would have caught them are switched back on for Geoservices, so a new one fails the lint.

| Before | After |
| --- | --- |
| ![Before: the banner's dismiss cannot be reached by Tab](../screenshots/2058-template-a11y-rules/banner-before.png) | ![After: the banner's dismiss has keyboard focus](../screenshots/2058-template-a11y-rules/banner-after.png) |
