import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2';

/**
 * The angulartics2 provider GIS Day sends its events through: gtag, the GA4 tag `index.html` loads (#2275).
 *
 * It was the analytics.js provider, which calls `ga()`. The page has no `ga()`, so no event was ever sent.
 */
export const GisdayAnalytics = Angulartics2GoogleGlobalSiteTag;

/**
 * angulartics2's settings for GIS Day.
 *
 * **No page views of its own.** gtag sends the page view when the page loads, and GA4's enhanced measurement
 * sends one for each change of address after that, so a second one from here would count every page twice.
 * It also keeps the address out of anything angulartics2 sends: `index.html` takes a check-in code out of the
 * address before gtag loads (#2572), and this sends no address of its own to undo that.
 */
export const GISDAY_ANALYTICS_SETTINGS = { pageTracking: { autoTrackVirtualPages: false } };
