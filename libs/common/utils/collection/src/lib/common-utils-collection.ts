import { getPropertyValue } from '@tamu-gisc/common/utils/object';

/**
 * Accepts a collection of items and returns a collection of overlapping pair groups.
 *
 * Input: ['a', 'b', 'c', 'd']
 *
 * Output: [['a', 'b'], ['b', 'c'], ['c', 'd']]
 */
export function pairwiseOverlap<T>(elements: T[]): T[][] {
  return elements.reduce((pairs, current, index, arr) => {
    if (arr.length <= 1) {
      throw new Error(`Insufficient elements to pair.`);
    }

    // Last item will have already been covered by the previous iteration.
    if (index === arr.length - 1) {
      return pairs;
    }

    // Return the current array item and the next one.
    return [...pairs, [arr[index], arr[index + 1]]];
  }, []);
}

/**
 * Groups a collection of objects by a provided key path.
 *
 * @param {Array<T>} collection Object collection
 * @param {string} path Object key path which groups will be made against. Supports dot notation.
 * @param {string} [groupIdentityPath] If provided, will append the resolved key path from any ONE of the collection objects
 * into the resulting grouped object. Supports dot notation.
 */
export function groupBy<T extends object>(collection: Array<T>, path: string, groupIdentityPath?: string): Array<Group<T>> {
  // Return early if no collection
  if (!collection || collection.length === 0) {
    return collection;
  }

  const groupedObj = collection.reduce((acc, curr) => {
    const propValue: string = getPropertyValue(curr, path);
    // TODO: This might need a test. Values that return a false boolean will not pass this expression even though the
    // property and value exist.
    //
    // Example: acc[propValue], where the value is `false`, will always follow falsy if case.
    if (acc[propValue]) {
      acc[propValue] = [...acc[propValue], curr];
    } else {
      acc[propValue] = [curr];
    }

    return acc;
  }, {});

  return Object.keys(groupedObj).map((g) => {
    if (groupIdentityPath) {
      const identity: string = getPropertyValue(groupedObj[g][0], groupIdentityPath);

      if (identity) {
        return {
          identity,
          items: groupedObj[g]
        };
      }
    }

    // Default return
    return {
      items: groupedObj[g]
    };
  });
}

export interface Group<T> {
  items?: T[];
  identity?: string | object;
}
