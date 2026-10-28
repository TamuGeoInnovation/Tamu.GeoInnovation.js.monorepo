---
issue: 2548
title: Each FAQ question can be linked to on its own
testOnDev: |
  | GIS Day: a link to one FAQ question ([#2548](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2548)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org/faq#zoom-link](https://txgisday.org/faq#zoom-link) | The page opens with "Where do I find the Zoom link for the events?" open and in view. Each question has a link icon at its right; clicking it copies that question's address and shows a tick, without opening or closing the question |
---

### GIS Day: each FAQ question can be linked to on its own

A link to one question on the [FAQ](https://txgisday.org/faq) page now opens that question and brings it into view,
for example [txgisday.org/faq#zoom-link](https://txgisday.org/faq#zoom-link). Before, a link landed at the top of the
page with every question closed, and three questions shared one address, so two of them could not be linked at all.

Each question has a link icon at its right that copies its address, ready to paste into an email or a post.

| Before: `/faq#zoom-link` | After: `/faq#zoom-link` |
| --- | --- |
| ![The FAQ page at the top, every question closed](../screenshots/2548-faq-links/before-linked-question.png) | ![The Zoom question open and in view, each question with a link icon](../screenshots/2548-faq-links/after-linked-question.png) |

After the link icon is clicked, it shows a tick and the question stays closed:

![A question with the tick after its link was copied](../screenshots/2548-faq-links/after-copy-link.png)
