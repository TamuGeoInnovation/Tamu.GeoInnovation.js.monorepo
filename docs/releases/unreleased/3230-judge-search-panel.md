---
issue: 3230
title: "GIS Day: The judge's page searches entries, and scores each in its own details panel that Escape closes"
testOnDev: |
  | GIS Day: search and a details panel on the judge's page ([#3230](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3230)) | Not on dev: GIS Day has no dev site. On production, a judge's page from a judging link (`/judging/<link>`), on a computer and on a phone | A search box above the list finds an entry by its title or an author, in every competition, naming the competition; choosing one opens it in a panel over the list, the whole screen on a phone, with the search box at its top; Previous and Next go to the entries beside it; Escape, Close or a click beside it closes the panel; changing a score and then leaving without Save asks first, Stay keeping the scores and Leave without saving putting back the saved ones |
---

### GIS Day: The judge's page searches entries, and scores each in its own details panel that Escape closes

A judge's page listed every entry in a competition, and opened each one in place, inside the list, so the rubric of one
entry pushed the rest of the list a long way down, and a judge looking for one poster in the room had to scroll for it.
The page now has a search box above the list that finds an entry by its title or one of its authors, in every competition
the judge has, and says which competition each match is in. Each entry opens in its own panel over the list: on a
computer, on the right with the list dimmed beside it, and on a phone, the whole screen. The panel has the search box at
its top, to go straight to another entry, and Previous and Next to the entries beside it. Escape, Close, or a click beside
the panel closes it. If its scores have been changed and not saved, it asks first: Stay keeps them, and Leave without
saving puts back what was saved. The panel is a new shared component (`tamu-gisc-details-panel`), for any page that opens
one record over a list.
([#3230](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3230))

| Before | After |
| --- | --- |
| ![A judge's page for two made-up poster competitions: five entries in the graduate competition, each a box giving its title, authors and score, opened in place](../screenshots/3230-judge-search-panel/before-list.png) | ![The same page with a search box above the tabs, and each entry a row giving its title, authors and score](../screenshots/3230-judge-search-panel/after-list.png) |
| ![The same page with one entry opened in the list, its rubric between the entries above and below it](../screenshots/3230-judge-search-panel/before-entry-open.png) | ![An entry open in a panel on the right, the list dimmed beside it: the search box, Previous, "2 of 5", Next and Close, then the competition, title, authors, abstract and rubric](../screenshots/3230-judge-search-panel/after-panel.png) |
| ![On a phone, 390 pixels wide, an opened entry's rubric runs down the page between the other entries](../screenshots/3230-judge-search-panel/before-entry-open-phone.png) | ![On a phone, the entry's panel fills the screen, with the search box, Previous, Next and Close at its top](../screenshots/3230-judge-search-panel/after-panel-phone.png) |
| | ![The search box listing the entries an author's name finds in both competitions, each naming its competition](../screenshots/3230-judge-search-panel/after-search.png) |
| | ![On a phone, the search box at the top of the panel listing what "drone" finds, to open it straight from this entry](../screenshots/3230-judge-search-panel/after-panel-search-phone.png) |
| | ![The panel asking "Your scores for this entry have changed and are not saved. Leave without saving them?" with Leave without saving and Stay](../screenshots/3230-judge-search-panel/after-leave-ask.png) |
