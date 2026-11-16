---
issue: 3144
title: "GIS Day: a submission's Presentation files come first on its page, where finalists will see them"
testOnDev: |
  | GIS Day: Presentation files first on a submission ([#3144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3144)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu/account/submissions) with an account that has a submission, and open it under Student Competitions | **Presentation files**, with its box, its deadline line and its Attach A File picker, is the first thing on the page, above Modify Student Competition Submission, without scrolling. New submission shows no Presentation files |
---

### GIS Day: a submission's Presentation files come first on its page, where finalists will see them

On a competition submission's page (Account, Student Competitions, open one), **Presentation files**, where a finalist
attaches the slides or poster they will present from, was the last thing on the page, below the whole submission form.
Finalists sent there by the review emails to upload stopped at the form and did not find it. It is now at the top,
above the form, so it is the first thing they see
([#3144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3144)). Its box, its deadline line
and its picker are as they were, and it still shows only on a submission that has been saved, not on a new one.

| A submission's page, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up submission and a made-up file | Before | After |
| --- | --- | --- |
| As the page first loads | ![The submission form, with Presentation files out of sight below it](../screenshots/3144-presentation-files-first/before-first-view.png) | ![Presentation files, with the made-up file and Attach A File, first on the page, above the form](../screenshots/3144-presentation-files-first/after-first-view.png) |
| Scrolled to the end of the form | ![Presentation files below the form's last field, just above Withdraw Submission and Update](../screenshots/3144-presentation-files-first/before-bottom.png) | |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email were blanked in the images.
