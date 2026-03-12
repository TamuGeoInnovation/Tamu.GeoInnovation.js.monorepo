import { TrimPipe } from './trim.pipe';

describe('TrimPipe', () => {
  it('create an instance', () => {
    const pipe = new TrimPipe();
    expect(pipe).toBeTruthy();
  });

  it('should trim whitespace from the beginning and end of a string', () => {
    const pipe = new TrimPipe();
    const input = '   Hello, World!   ';
    const expectedOutput = 'Hello, World!';
    expect(pipe.transform(input)).toBe(expectedOutput);
  });

  it('should return the same string if there is no leading or trailing whitespace', () => {
    const pipe = new TrimPipe();
    const input = 'Hello, World!';
    const expectedOutput = 'Hello, World!';
    expect(pipe.transform(input)).toBe(expectedOutput);
  });

  it('should handle an empty string', () => {
    const pipe = new TrimPipe();
    const input = '';
    const expectedOutput = '';
    expect(pipe.transform(input)).toBe(expectedOutput);
  });
});
