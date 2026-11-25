import type { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

// Angular's PRIMARY_OUTLET. Named here rather than imported, so this library stays types-only towards @angular/router and
// loads without the Angular compiler, as its own specs do.
const PRIMARY_OUTLET = 'primary';

/**
 * Returns a string segment array representing the current path route from the app root.
 */
export function getPathFromRouteSnapshot(snapshot: ActivatedRouteSnapshot): string[] {
  return snapshot.pathFromRoot
    .map((route) => {
      return route.routeConfig && route.routeConfig.path ? route.routeConfig.path : undefined;
    })
    .filter((segment) => segment);
}

/**
 * Returns a string segment array representing the actual URL segments from the app root.
 * This resolves parameter values (e.g., ':eventId' becomes 'my-event-id').
 */
export function getUrlSegmentsFromRouteSnapshot(snapshot: ActivatedRouteSnapshot): string[] {
  return snapshot.pathFromRoot
    .map((route) => {
      // Use the actual URL segments instead of route configuration paths
      return route.url.length > 0 ? route.url.map((segment) => segment.path) : [];
    })
    .filter((segments) => segments.length > 0)
    .flat();
}

export function makeUrlParams(params: object, encode: boolean, prefix?: string): string {
  if (!params) {
    throw new Error('Could not make URL params because no params were provided.');
  }

  const segments = Object.keys(params)
    .map((k): string => {
      // Return a simple "key=value" string
      return `${k}=${params[k]}`;
    })
    .join('&');

  // Encode URL params if set to true
  if (encode) {
    if (prefix) {
      return encodeURI(`${prefix}?${segments}`);
    } else {
      return encodeURI(`?${segments}`);
    }
  }

  // If a prefix is supplied, pre-pend it
  if (prefix) {
    return `${prefix}?${segments}`;
  } else {
    return `?${segments}`;
  }
}

/**
 * Returns a new array with a substituted matched path segment, if it exists, from a path string segment array..
 *
 * Example:
 *
 * `/map/d/trip` => `/map/m/trip`
 *
 * @param {Array < string >} list Path segment array
 * @param {string} match Matching path segment
 * @param {string} substitution Substitute path segment if match is found
 */
export function routeSubstitute(list: Array<string>, match: string, substitution: string): Array<string> {
  const l = [...list];
  const matchIndex = list.findIndex((listItem) => listItem === match);

  if (matchIndex > -1) {
    l[matchIndex] = substitution;
    return l;
  } else {
    return l;
  }
}

/**
 * The nearest route, from this one up, in the primary outlet (#2641, #3150).
 *
 * On a phone, AggieMap draws its panels in the secondary `outlet-2`. A navigation relative to a component there is
 * looked for inside that outlet, matches nothing, and fails without a word: "Directions To Here" closed the popup and
 * stayed put (#2641), and tapping a bus route did nothing (#3150). Relative to this route, the same navigation finds the
 * primary outlet's children. On a desktop, where the panels are in the primary outlet, it is the route itself.
 */
export function primaryOutletRoute(route: ActivatedRoute): ActivatedRoute {
  let current = route;

  while (current.outlet !== PRIMARY_OUTLET && current.parent) {
    current = current.parent;
  }

  return current;
}
