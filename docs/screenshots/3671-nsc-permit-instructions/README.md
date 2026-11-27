# Test artifacts, not pages (#3671)

`spec-render-before.png` and `spec-render-after.png` are **not** pictures of the map. They are `MarkdownPopupComponent` as `libs/ts/events/ngx/src/lib/definitions/nsc-parking.definitions.spec.ts` renders it, given the NSC lots layer's own popup data resolved over a lot. The banner across the top of each image says so.

- **Before (`development`):** the popup has the lot's name only.
- **After (this branch):** it has the permit instructions as well.

No visitor can open this popup yet. The NSC parking service answers no geometry ([#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520)), so a click never reaches a lot. Once #2520 is fixed, a real capture of the map belongs here.

How they were made, 26 November 2026, home machine: a copy of the spec that also wrote the component's rendered HTML to a file, run at the test commit and at the fix, and the two files photographed in Playwright. The copy was not kept.
