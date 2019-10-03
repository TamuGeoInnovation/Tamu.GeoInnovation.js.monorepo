import { groupBy, Group } from '@tamu-gisc/common/utils/collection';

export function count<T extends Array<T>>(collection: Array<T>, path: string) {
  const groups = groupBy(collection, path, path);

  return groups.reduce(
    (acc, curr: Group<T>) => {
      if (curr.items) {
        return {
          labels: [...acc.labels, curr.identity],
          values: [...acc.values, curr.items.length]
        };
      } else {
        return acc;
      }
    },
    { labels: [], values: [] }
  );
}
