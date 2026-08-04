import { ActivatedRouteSnapshot } from '@angular/router';

/**
 * Returns a string segment array representing the current path route from the app root.
 */
export function getPathFromRouteSnapshot(snapshot: ActivatedRouteSnapshot): string[] {
  const segments = snapshot.pathFromRoot
    .map((route) => {
      return route.routeConfig && route.routeConfig.path ? route.routeConfig.path : undefined;
    })
    .filter((segment): segment is string => typeof segment === 'string');

  return segments;
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
    .reduce((acc: string[], segs: string[]) => acc.concat(segs), []);
}

export function makeUrlParams(params: Record<string, unknown>, encode: boolean, prefix?: string): string {
  if (!params) {
    throw new Error('Could not make URL params because no params were provided.');
  }

  const segments = Object.keys(params)
    .map((k): string => {
      // Return a simple "key=value" string
      return `${k}=${(params as Record<string, any>)[k]}`;
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
