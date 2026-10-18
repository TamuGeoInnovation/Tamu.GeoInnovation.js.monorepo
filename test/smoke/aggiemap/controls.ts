import type { Locator, Page } from '@playwright/test';

/**
 * The map's own buttons, found on either major version of ArcGIS (#1890).
 *
 * ArcGIS 5.0 (#1859) and the components before it (#1853) replaced the 4.x widgets, so the same button
 * has different markup depending on which build an environment serves. Until production carries 5.0, a
 * spec from `development` runs against both, and a selector for one version only waits out its test's
 * clock on the other and reads as a broken map. Every spec finds these controls here, so the next change
 * of markup is made once.
 *
 * Each is a selector list: the 5.0 component first, the 4.x widget second. Only one is on a page.
 */
export const MAP_CONTROLS = {
  zoom: 'arcgis-zoom, .esri-zoom',
  locate: 'arcgis-track, .esri-track',
  compass: 'tamu-gisc-map-compass, .esri-compass'
} as const;

/**
 * The zoom-in button, found by its plus icon on either version. In 5.0 it is a `calcite-button` inside
 * `<arcgis-zoom>`'s shadow DOM, which Playwright reaches into; in 4.x it is a `div` in the `.esri-zoom` widget.
 */
export function zoomInButton(page: Page): Locator {
  return page.locator('arcgis-zoom calcite-button[icon-start="plus"], .esri-zoom .esri-widget--button:has(.esri-icon-plus)');
}

/**
 * Whether the view will zoom in no further. 5.0 sets `disabled` on the button; 4.x adds `esri-disabled`
 * to its class. Neither is a native disabled button, so Playwright's `isDisabled()` sees neither.
 */
export async function isZoomInDisabled(button: Locator): Promise<boolean> {
  return button.evaluate((el) => el.hasAttribute('disabled') || el.classList.contains('esri-disabled'));
}
