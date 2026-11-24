---
issue: 3090
title: The admins preview a submission's PDFs on its review page
testOnDev: |
  | GIS Day: preview a submission's PDFs ([#3090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3090)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Research Competition, a submission with files | Each PDF has a Preview beside its name; it opens under the list, with Previous, Next and Close, and pages through the submission's PDFs. A PowerPoint has no Preview and still downloads. A student's own submission page shows no Preview |
---

### GIS Day: The admins preview a submission's PDFs on its review page

The admins reviewing a research competition submission can now look through its PDFs on the page, without downloading
each one. A Preview beside each PDF opens it under the list, in the browser's own viewer, with Previous and Next between
the submission's PDFs. A PowerPoint is still downloaded: no browser draws one, and converting them on the server is
waiting on a decision about the size it would add. Only the admins see the preview; a student still downloads their own
files.
([#3090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3090))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| A submission's files | ![The files, each only a download](../screenshots/3090-submission-file-preview/before-files.png) | ![A Preview beside each PDF, none beside the PowerPoint](../screenshots/3090-submission-file-preview/after-files.png) |
| A PDF previewed | | ![The made-up poster shown under the list, with Previous, Next and Close](../screenshots/3090-submission-file-preview/after-preview-pdf.png) |

The submission and its files are made up.
