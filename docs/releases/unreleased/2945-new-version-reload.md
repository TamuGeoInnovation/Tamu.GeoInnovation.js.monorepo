---
issue: 2945
title: "GIS Day: a tab left open across a deploy moves to the new version"
testOnDev: |
  | GIS Day: a tab open across a deploy ([#2945](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2945)) | Not on dev: GIS Day has no dev site, and the change only shows across two deploys. After the release reaches txgisday.org, keep a tab open on [txgisday.org](https://txgisday.org/) through the next deploy, then click to another page | The page reloads into the new version at the page clicked, instead of going blank or staying on the old one. A page with a changed, unsaved form instead says *A newer version of this site is ready* and reloads only on **Reload now** |
---

### GIS Day: a tab left open across a deploy moves to the new version

A tab opened before a deploy kept running the build it had loaded. Its next click could go nowhere, or go blank,
because the old build asked for a piece of code the new one no longer has; or, worse, it went on quietly showing
old pages, as an open **Speaker edits to review** tab did after the 14 November deploy. Now:

- **A missing piece of code reloads the page once**, at the page the visitor clicked. If the new build really lacks
  it, the page does not reload again, so it cannot loop.
- **A newer version is noticed** when the visitor clicks to another page or comes back to the tab: the site's
  service worker, which it already had, compares its version with the server's.
- **The page then reloads into the newer version**, unless a form on it has unsaved changes. Then it says a newer
  version is ready and reloads only if the visitor chooses **Reload now**; with **Keep working**, the next page
  they open comes from the newer version.

The piece doing this is shared (`provideNewVersionReload()` in `@tamu-gisc/common/ngx/router`), so another app
with a service worker can use it.
([#2945](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2945))

| Before: the click to Sessions goes nowhere after a deploy | After: it reloads into the new version, at Sessions |
| --- | --- |
| ![The About page still showing after clicking Sessions](../screenshots/2945-new-version-reload/before-missing-chunk.png) | ![The Sessions page, loaded from the new version](../screenshots/2945-new-version-reload/after-missing-chunk-reloaded.png) |

![A newer version of this site is ready, with Keep working and Reload now, over the contact form](../screenshots/2945-new-version-reload/after-unsaved-changes-prompt.png)
