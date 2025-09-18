import { ToArrayPipe } from './to-array.pipe';

describe('ToArrayPipe', () => {
  let pipe: ToArrayPipe;

  beforeEach(() => {
    pipe = new ToArrayPipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array for null', () => {
    expect(pipe.transform(null)).toEqual([]);
  });

  it('should return an empty array for undefined', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('should return the same array when input is already an array (identity)', () => {
    const arr = [1, 2, 3];
    const result = pipe.transform(arr);
    expect(result).toBe(arr);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should wrap a primitive value in an array', () => {
    expect(pipe.transform(5)).toEqual([5]);
    expect(pipe.transform('hello')).toEqual(['hello']);
    expect(pipe.transform(true)).toEqual([true]);
  });

  it('should wrap an object value in an array preserving reference', () => {
    const obj = { a: 1 };
    const result = pipe.transform(obj);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(obj);
  });

  it('should treat empty string as a value (not nullish)', () => {
    const result = pipe.transform('');
    expect(result).toEqual(['']);
  });
});
