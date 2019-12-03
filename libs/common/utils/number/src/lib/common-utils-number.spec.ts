import { getRandomNumber, getSmallestIndex, isEven } from '@tamu-gisc/common/utils/number';

describe('isEven', () => {
  it('should handle even numbers', () => {
    expect(isEven(2)).toEqual(true);
  });

  it('should handle odd numbers', () => {
    expect(isEven(1)).toEqual(false);
  });
});

describe('getRandomNumber', () => {
  it('should be predictably random', () => {
    Math.random = () => 0.1234;
    expect(getRandomNumber(0, 5)).toEqual(0);
    expect(getRandomNumber(5, 10)).toEqual(5);
    expect(getRandomNumber(0, 1)).toEqual(0);
    expect(getRandomNumber(-5, -1)).toEqual(-5);
  });
});

describe('getSmallestIndex', () => {
  it('should work for basic input', () => {
    expect(getSmallestIndex([10, 9, 8, 7, 6])).toEqual(4);
  });
});
