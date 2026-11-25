/**
 * The HTTP methods the site may use on the API from another address. The site (gisday.tamu.edu, txgisday.org) and the API
 * it calls are different origins, so the browser asks first and sends only a method on this list. Every method a controller
 * uses must be here: judging's two PUT routes were missing, so a judge's Save and a rubric's save were blocked in the
 * browser on production and never reached the API (17 November 2026). `cors-methods.spec.ts` fails when a route uses a
 * method not listed.
 */
export const CORS_METHODS: ReadonlyArray<string> = Object.freeze(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
