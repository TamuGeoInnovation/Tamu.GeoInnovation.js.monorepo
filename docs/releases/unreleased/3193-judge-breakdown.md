---
issue: 3193
title: "GIS Day: Judging results break an entry down by judge, and give every score as a CSV"
testOnDev: |
  | GIS Day: each judge's scores on an entry ([#3193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3193)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition/judging), open Research Competitions, Judging results, choose a competition with scores, click an entry's row, then click another, then choose Every score | Clicking a row opens a line per judge under it: their total, their comment and their score on each criterion, or Not scored yet for a judge who has not scored it; clicking another row closes the first, and clicking the open one closes it. Every score downloads a CSV with a row per judge per entry, the criteria, the total (or Not scored yet) and the comment, a comment with a comma or quotes kept whole in one cell when opened in Excel |
---

### GIS Day: Judging results break an entry down by judge, and give every score as a CSV

Judging results showed each judge's total for an entry and each criterion's average, but not what each judge gave on each
criterion, or their comments
([#3193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3193)).

- **An entry's breakdown**: clicking an entry's row (or Enter or Space on it) opens a line per judge of the competition
  under it, with their total and their comment first, then their score on each criterion in the rubric's order. It is as
  wide as the page shows, and scrolls on its own when the criteria need more room. A judge who has not
  scored the entry shows **Not scored yet**. One entry is open at a time; clicking it again closes it.
- **Every score**: a second download beside **Download CSV**, with a row per judge per entry, scored or not: the entry's
  title and presenters, the judge, each criterion's score, the total (or Not scored yet) and the comment. Its file is
  `judging-<competition>-every-score-<year>.csv`.
- The comments are only on the admins' results. A judge's own page still shows only their own scores.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, at
1280 px.

| | |
| --- | --- |
| Before: Judging results, with Download CSV the only download | ![Judging results for the graduate presentation competition: two made-up judges' progress and three entries, with Download CSV in the toolbar](../screenshots/3193-judge-breakdown/before-results.png) |
| After: the toolbar, with Every score beside Download CSV | ![The Judging results toolbar: Download CSV, Every score, the Competition and the Season](../screenshots/3193-judge-breakdown/after-toolbar.png) |
| After: an entry both judges scored, opened: a line per judge with their total, comment and scores | ![The first entry opened: a line for each made-up judge, with their total, their comment and their score on the first criteria, under the entry's row](../screenshots/3193-judge-breakdown/after-breakdown.png) |
| After: an entry only one judge scored: the other is Not scored yet | ![The second entry opened: the first made-up judge's scores, and Not scored yet for the second](../screenshots/3193-judge-breakdown/after-breakdown-unscored.png) |
