---
issue: 3183
app: gisday
title: "GIS Day: judges score the research competitions in the site, against rubrics, from an emailed judging link"
testOnDev: |
  | GIS Day: judging the research competitions ([#3183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3183)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition/rubrics), open Research Competitions, Rubrics, and choose Start from the standard rubric for posters; then on a poster session's page choose Judged competition and tick its judges, Update, and open Email these speakers, Ask to judge, without sending | The rubric shows seven criteria totalling 100 points. After Update the Judging section keeps the competition and the judges ticked. Ask to judge is in the menu only while a competition is chosen, and its window lists only the judges, a copy each. Research Competitions, Judging results lists the competition's accepted entries and each judge's progress |
---

### GIS Day: judges score the research competitions in the site, against rubrics, from an emailed judging link

Judges of the poster and research presentation competitions can now score the entries in the site
([#3183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3183)). Each judge is sent their own
judging link, which opens a page listing every accepted entry of the competition they judge, with the rubric's criteria and
its four levels, and a score for each criterion. The admins see the results.

- **Rubrics**: Research Competitions in the admin menu now has **Rubrics** and **Judging results** under Submissions. A
  season with no rubric for a competition offers **Start from the standard rubric**: the competition organizer's rubric, seven
  criteria and 100 points, with each criterion's Excellent, Proficient, Developing and Needs Improvement levels. Graduate and
  undergraduate share a rubric.
- **The session's page** has a **Judging** section: the Judged competition, its Judges ticked from the session's speakers,
  and Judging closed. **Ask to judge** in Email these speakers sends each judge their own link, a copy each, read and edited
  first in the same window.
- **The judge's page** (`/judging/<link>`) needs no account. A judge can change their scores until the admins tick Judging
  closed; then the page shows their scores read only. Judges see only their own scores.
- **Judging results**, per competition and season: each judge's progress, and a row per accepted entry with each judge's
  total, the average total and each criterion's average, highest average first, and **Download CSV** with the same.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, at
1280 px unless it says otherwise.

| | |
| --- | --- |
| Before: Research Competitions has no entries under it | ![The admin menu with Research Competitions and nothing under it](../screenshots/3183-judging/before-admin-menu.png) |
| After, on a Research Competitions page: Submissions, Rubrics and Judging results | ![The admin menu with Submissions, Rubrics and Judging results under Research Competitions](../screenshots/3183-judging/after-admin-menu.png) |
| Before: a poster session's admin page, with no Judging section | ![A made-up poster session's admin page: Basic, Speakers, Slides, Tags and Attendance](../screenshots/3183-judging/before-session-form.png) |
| After: the poster rubric, started from the standard one (its first two of seven criteria) | ![The Geography Poster Presentation Rubric, with Geographic Understanding and Accuracy and Spatial Data and Visual Representation, 20 points each, each with four levels](../screenshots/3183-judging/after-rubrics.png) |
| After: the session's Judging section, saved with Graduate posters and two judges | ![Judged competition Graduate poster competition, two made-up judges ticked, Judging closed unticked](../screenshots/3183-judging/after-session-judging.png) |
| After: Email these speakers offers Ask to judge | ![The Email these speakers menu with Profile email, Session details, Ask for slides and Ask to judge](../screenshots/3183-judging/after-menu.png) |
| After: Ask to judge's window, as it opens (nothing was sent) | ![Send judging emails: the two made-up judges ticked, a copy each, and the prefilled subject and text](../screenshots/3183-judging/after-ask-to-judge-preview.png) |
| After: the same window at its end, the email as the first judge gets it | ![The email preview to the first made-up judge, with Cancel and Send 2 emails](../screenshots/3183-judging/after-ask-to-judge-preview-end.png) |
| After: the judge's page, an entry with its criteria and the first criterion's levels | ![The Judging page: the graduate poster competition, 0 of 3 scored, an entry with seven criteria, each a score box](../screenshots/3183-judging/after-judge-page.png) |
| After: the same at 390 px, a phone's width | ![The Judging page at phone width](../screenshots/3183-judging/after-judge-page-phone.png) |
| After: the same at 360 px, a narrower phone | ![The Judging page at 360 px, every score box and Save inside the width](../screenshots/3183-judging/after-judge-page-phone-360.png) |
| After: the entry scored and saved | ![The entry's seven scores and a comment, Saved, 86 of 100 points, 1 of 3 scored](../screenshots/3183-judging/after-judge-saved.png) |
| After: Judging results with two entries scored and one not | ![Judging results: one judge 2 scored, the other 1; the first entry with 2 judges, average 85.5, totals 86 and 85; the second with 1 judge, 75; the third, 0 judges, Not scored yet](../screenshots/3183-judging/after-results.png) |
| After: the same table scrolled sideways in its own box to its last criterion | ![Judging results scrolled to the right end: Creativity and Visual Impact, and Interpretation and Geographic Insight, the last criterion, 8.5 and 8.5 for the first entry, 7 and 8 for the second](../screenshots/3183-judging/after-results-scrolled.png) |
| After: Judging closed ticked, the judge's page again | ![Judging is closed for this competition. The scores shown greyed, with no Save](../screenshots/3183-judging/after-judging-closed.png) |
