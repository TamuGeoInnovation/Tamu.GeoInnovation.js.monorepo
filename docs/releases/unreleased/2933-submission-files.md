---
issue: 2933
title: "GIS Day: students attach their presentation files to their submission, and admins download them"
testOnDev: |
  | GIS Day: presentation files on submissions ([#2933](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2933)) | Not on dev: GIS Day has no dev site. After release, sign in on [txgisday.org](https://txgisday.org/account/submissions), open one of your poster or presentation submissions, and attach a PDF under **Presentation files**; then, as an admin, open [Research Competitions](https://txgisday.org/admin/research-competition) | The file is listed with its size and can be downloaded and removed; a Word file is refused with a message. The admin list's **Files** column counts it, the submission's review page lists it with a download, and **Download all files** saves a zip with a folder per submission |
---

### GIS Day: students attach their presentation files to their submission, and admins download them

A student with a poster or presentation submission can now attach the files they will present from - their slides,
or their poster as a PDF - to the submission itself, under **Presentation files** on its page in their account:
PowerPoint or PDF, up to 100 MB each, three per submission. This works after the submission has been reviewed too,
since finalists send their files once they are accepted. Until now the files came as a link to a cloud drive, or by
hand.

Admins see how many files each submission has in a new **Files** column on Research Competitions, download any one of
them from the submission's review page, and download every file of the season at once with **Download all files**: a
zip with a folder per submission, named for its type and title.
([#2933](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2933))

| Before | After |
| --- | --- |
| ![A student's submission, with only a link field for materials](../screenshots/submission-files/student-before.png) | ![The same submission with Presentation files: a slide deck and a poster attached](../screenshots/submission-files/student-after.png) |
| ![The review page with no files](../screenshots/submission-files/review-before.png) | ![The review page listing the two files, each a download](../screenshots/submission-files/review-after.png) |
| ![Research Competitions without a Files column](../screenshots/submission-files/list-before.png) | ![Research Competitions with Download all files and a Files column](../screenshots/submission-files/list-after.png) |
