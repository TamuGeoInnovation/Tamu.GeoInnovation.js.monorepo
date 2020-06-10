import * as url from 'url';
import { isFalsy } from '@tamu-gisc/common/utils/string';

/**
 * Tests if a URL path contains a query property AND/OR if the existing query property is equal to a given value.
 *
 * Note that the input value is coerced into a string before doing an equivalence check.
 */
export function urlHas<T>(unparsedUrl: string, property: string, value?: T): boolean {
  if (isFalsy(unparsedUrl) || isFalsy(property)) {
    console.log('Input URL not provided.');
    return false;
  }

  const parsedUrl = url.parse(unparsedUrl, true);

  if (!parsedUrl.query[property] === undefined) {
    return false;
  }

  if ((value !== undefined && parsedUrl.query[property] === value.toString()) || value === undefined) {
    return true;
  }
}

export function urlFragment(unparsedUrl: string, fragment: keyof url.UrlWithParsedQuery) {
  const parsed = url.parse(unparsedUrl, true);

  if (!parsed[fragment]) {
    return undefined;
  }

  return parsed[fragment];
}
