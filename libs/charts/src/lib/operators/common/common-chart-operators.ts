import { groupBy, Group } from '@tamu-gisc/common/utils/collection';

/**
 * Categorizes a collection of objects by a provided key.
 *
 * AKA group by.
 *
 * Expects a flat, unordered collection.
 */
export function cateogorize<T extends Array<T>>(collection: Array<T>, key: string) {
  return groupBy(collection, key, key);
}

/**
 * Expects a collection of objects/collections and returns a summary object
 * containig the lengths and name of each respective collection.
 * ```
 */
export function count<T extends Array<T>>(collection: Array<T>, path: string) {
  const groups = groupBy(collection, path, path);

  return groups.reduce(
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

export const op = {
  cateogorize,
  count
};
