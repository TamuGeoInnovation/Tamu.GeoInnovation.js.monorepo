/**
 * The file name a route's screenshot is saved under, shared by capture.mjs (which writes it) and
 * index.mjs (which turns it back into the route for a set's gallery, #2345).
 */

/** A file name that is stable, readable and safe, derived from the route it captures. */
export const slugFor = (route) =>
  route
    .replace(/^\//, '')
    .replace(/[?&=]/g, '__')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120) || 'root';
