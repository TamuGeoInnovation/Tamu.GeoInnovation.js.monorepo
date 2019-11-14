import { groupBy, pairwiseOverlap } from '@tamu-gisc/common/utils/collection';

describe('pairwiseOverlap', function() {
  it('should handle the base case', () => {
    expect(pairwiseOverlap([])).toEqual([]);
  });

  it('should error on insufficient items', () => {
    expect(() => pairwiseOverlap(['1 element'])).toThrowError(new Error(`Insufficient elements to pair.`));
  });

  it('should handle correct input', () => {
    expect(pairwiseOverlap(['a', 'b', 'c', 'd'])).toEqual([['a', 'b'], ['b', 'c'], ['c', 'd']]);
  });
});

describe('groupBy', function() {
  it('should return the original collection on invalid input', function() {
    expect(groupBy(undefined, 'n/a')).toBeUndefined();
    expect(groupBy(null, 'n/a')).toBeNull();
    expect(groupBy([], 'n/a')).toEqual([]);
  });

  it('should use default return if there is no identity', function() {
    expect(groupBy([{ test: '1' }], 'test')).toEqual([{ items: [{ test: '1' }] }]);
  });
});
