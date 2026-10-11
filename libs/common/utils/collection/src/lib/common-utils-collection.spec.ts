import { groupBy, minBy, pairwiseOverlap } from './common-utils-collection';

describe('pairwiseOverlap', function () {
  it('should handle the base case', () => {
    expect(pairwiseOverlap([])).toEqual([]);
  });

  it('should error on insufficient items', () => {
    expect(() => pairwiseOverlap(['1 element'])).toThrow(new Error(`Insufficient elements to pair.`));
  });

  it('should handle correct input', () => {
    expect(pairwiseOverlap(['a', 'b', 'c', 'd'])).toEqual([
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd']
    ]);
  });
});

describe('minBy', function () {
  const doors = [
    { fid: 1, distance: 30 },
    { fid: 2, distance: 4 },
    { fid: 3, distance: 12 }
  ];

  it('returns the item with the smallest value', () => {
    expect(minBy(doors, (door) => door.distance)).toEqual({ fid: 2, distance: 4 });
  });

  it('returns the first of equal smallest values', () => {
    expect(minBy([...doors, { fid: 4, distance: 4 }], (door) => door.distance)?.fid).toBe(2);
  });

  it('returns undefined for an empty collection', () => {
    expect(minBy([], () => 0)).toBeUndefined();
  });
});

describe('groupBy', function () {
  it('should return the original collection on invalid input', function () {
    expect(groupBy(undefined, 'n/a')).toBeUndefined();
    expect(groupBy(null, 'n/a')).toBeNull();
    expect(groupBy([], 'n/a')).toEqual([]);
  });

  it('should use default return if there is no identity', function () {
    expect(groupBy([{ test: '1' }], 'test')).toEqual([{ items: [{ test: '1' }] }]);
  });
});
