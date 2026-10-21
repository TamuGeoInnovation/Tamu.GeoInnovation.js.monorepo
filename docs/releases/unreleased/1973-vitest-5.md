---
issue: 1973
title: "Not visible: Vitest 4 to 5"
---

### Not visible: Vitest 4 to 5

The unit tests of the 69 projects on Vitest move from Vitest 4.1.12 to 5.0.5
([#1973](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1973)), with
`@vitest/coverage-v8` 5.0.5 and Analog's Angular plugins (`@analogjs/vite-plugin-angular`,
`@analogjs/vitest-angular`) 2.8.1 to 2.9.1. Only the tests change: no application is built with
Vitest, so nothing a user sees is different, and there is nothing to check on dev. Every project runs
the same number of tests as before, 922 in all, and they take as long.
