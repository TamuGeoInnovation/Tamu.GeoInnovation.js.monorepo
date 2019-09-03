import { ActivatedRouteSnapshot } from '@angular/router';

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

export function makeUrlParams(params: object, encode: boolean, prefix?: string) {
  if (!params) {
    throw new Error('Could not make URL params because no params were provided.');
  }

  const segments = Object.keys(params)
    .map(
      (k, i, a): string => {
        // Return a simple "key=value" string
        return `${k}=${params[k]}`;
      }
    )
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
