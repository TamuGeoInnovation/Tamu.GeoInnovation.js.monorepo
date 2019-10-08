import { groupBy, Group } from '@tamu-gisc/common/utils/collection';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';

/**
 * Categorizes a collection of objects by a provided key.
 *
 * AKA group by.
 *
 * Expects a flat, unordered collection.
 */
export function categorize<T extends Array<T>>(collection: Array<T>, key: string) {
  return groupBy(collection, key, key);
}

/**
 * Expects a collection of Groups, where each contains n-features and an identifying key, and then
 * counts the number of items in each group, returning the identity key as a label.
 */
export function count<T extends Array<T>>(collection: Array<Group<T>>, path: string) {
  return collection.reduce(
    (acc, curr: Group<T>) => {
      if (curr.items) {
        return {
          labels: [...acc.labels, curr.identity],
          data: [...acc.data, curr.items.length]
        };
      } else {
        return acc;
      }
    },
    { labels: [], data: [] }
  );
}

export function average<T extends Array<T>>(collection: Array<Group<T>>, path: string) {
  return collection.reduce(
    (acc, curr: Group<T>) => {
      if (curr.items && curr.items.length > 0) {
        // Evaluate the path for each of collection items.
        const pathValues = curr.items.map((item) => getPropertyValue(item, path));

        // Test if any of the evalued path values are undefined or not a number.
        // If this is the case, we need to throw an error because we cannot sum
        // against those values.
        const anyInvalid = pathValues.findIndex((v) => v === undefined || isNaN(v));

        if (anyInvalid > -1) {
          console.warn(curr.items[anyInvalid]);
          throw new Error(`Averaging property (${path}) does not exist or is invalid in at least one collection item.`);
        } else {
          const avg =
            pathValues.reduce((sum, val) => {
              return sum + val;
            }, 0) / curr.items.length;

          return {
            labels: [...acc.labels, curr.identity],
            data: [...acc.data, avg]
          };
        }
      } else {
        return acc;
      }
    },
    { labels: [], data: [] }
  );
}

export const op = {
  categorize,
  count,
  average
};
