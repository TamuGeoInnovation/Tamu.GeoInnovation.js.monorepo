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
| After: the same made-up judge, the graduate competition's tab open, its three entries closed, by first author (Adams, Moore, Young) | ![The Judging page: a tab for each competition, the graduate presentation competition's chosen and underlined in maroon, then 1 of 3 scored and three closed entries, each showing its title, authors and Not scored yet or Scored 93 of 100](../screenshots/3200-collapse-competitions/after-tabs.png) |
| After: one entry opened, its saved score in the boxes | ![The graduate competition's tab with its second entry open, its form indented as its heading is: its abstract, the seven criteria with their scores and levels, the comment, Scored 93 of 100 points and Save, between the two closed entries](../screenshots/3200-collapse-competitions/after-entry-open.png) |
| After: the undergraduate competition chosen | ![The Judging page with the undergraduate presentation competition's tab chosen and underlined, 0 of 2 scored, and its two closed entries, by first author (Ellis, Pupil)](../screenshots/3200-collapse-competitions/after-other-tab.png) |
| After: on a phone, 390 pixels wide | ![The Judging page on a phone: the graduate competition's tab chosen and underlined, the undergraduate tab beginning at the right edge of a row that scrolls sideways, then 1 of 3 scored and its three closed entries, nothing past the page's right edge](../screenshots/3200-collapse-competitions/after-tabs-phone.png) |
| After: on a smaller phone, 360 pixels wide | ![The Judging page at 360 pixels: the graduate competition's tab chosen and underlined, the start of the undergraduate tab at the edge of the tab row, then 1 of 3 scored and its three closed entries, nothing past the page's right edge](../screenshots/3200-collapse-competitions/after-tabs-phone-360.png) |
| After: on a phone, the tab row swiped and the undergraduate tab tapped | ![The Judging page on a phone with the tab row scrolled to its end: the undergraduate presentation competition's tab chosen and underlined in full, then 0 of 2 scored and its two closed entries](../screenshots/3200-collapse-competitions/after-tabs-phone-scrolled.png) |
