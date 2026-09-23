/**
 * The public route table for the GIS Day site, taken from
 * `libs/gisday/platform/ngx/core/src/lib/pages/wrapper/wrapper.module.ts`.
 *
 * Kept in one place so a route added to the app but not to the suite is a visible omission rather
 * than a silent gap. If a route is removed from the app, the corresponding test here fails.
 */
export const PUBLIC_ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/sessions', name: 'sessions' },
  { path: '/presenters', name: 'presenters' },
  { path: '/sponsors', name: 'sponsors' },
  { path: '/competitions', name: 'competitions' },
  { path: '/about', name: 'about' },
  { path: '/faq', name: 'faq' },
  { path: '/contact', name: 'contact' },
  { path: '/highschool', name: 'highschool' },
  { path: '/wayback', name: 'wayback' },
] as const;

/** Routes that require authentication. Unauthenticated visitors are redirected. */
export const GUARDED_ROUTES = [{ path: '/admin', redirectsTo: '/forbidden', name: 'admin' }] as const;
