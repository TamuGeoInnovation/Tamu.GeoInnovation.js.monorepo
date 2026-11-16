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

/**
 * Whether `--only`'s parts pick this route: a part found anywhere in the route, or a part that is the
 * route's file name exactly. The file name is what a page's "pick" gives (#2841), because a builder
 * destination's route carries `?`, `&` and `=`, which start-capture.ps1's -Only does not accept.
 */
export const matchesOnly = (route, parts) => parts.some((part) => route.includes(part) || slugFor(route) === part);
