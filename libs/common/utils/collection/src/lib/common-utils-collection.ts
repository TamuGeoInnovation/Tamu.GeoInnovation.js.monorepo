/**
 * Accepts a collection of items and returns a collection of overlapping pair groups.
 *
 * Input: ['a', 'b', 'c', 'd']
 *
 * Output: [['a', 'b'], ['b', 'c'], ['c', 'd']]
 */
export function pairwiseOverlap(elements: any[]): any[] {
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
