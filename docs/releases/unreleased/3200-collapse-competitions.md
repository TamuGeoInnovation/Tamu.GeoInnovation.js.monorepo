---
issue: 3200
title: "GIS Day: a judge's page has a tab per competition, and each entry collapsed, by first author"
testOnDev: |
  | GIS Day: a judge's competitions as tabs, entries collapsed ([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open a judge's judging link (`/judging/<link>`) on [gisday.tamu.edu](https://gisday.tamu.edu), for a judge in both the undergraduate and the graduate competition | A tab for each competition, the first one open; clicking the other switches to it. In each, every entry shows only its title, authors and the judge's score (or Not scored yet), in order by the first author's last name; tapping one opens its rubric. A score typed in one tab is still there after switching away and back |
---

### GIS Day: a judge's page has a tab per competition, and each entry collapsed, by first author

A judge's page listed every competition they judge, undergraduate and graduate, with every entry and rubric open, so a
judge scoring one had to scroll past everything else
([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)).

- **A tab per competition.** The first is open, and a click on another switches to it.
- **Each entry starts closed**, showing its title, its authors and the judge's score, or **Not scored yet**. Tapping one
  opens its abstract, rubric, comment and Save.
- **In order by the first author's last name**, ignoring case and accents; an entry with no authors comes last.
- Switching tabs, or closing an entry, keeps anything typed.

| | |
| --- | --- |
| Before: a made-up judge's page, both competitions open, every entry and criterion one after another | ![The Judging page: the graduate presentation competition, 1 of 2 scored, its two entries with seven criteria each, then the undergraduate competition and its two entries](../screenshots/3200-collapse-competitions/before-judge-page.png) |
