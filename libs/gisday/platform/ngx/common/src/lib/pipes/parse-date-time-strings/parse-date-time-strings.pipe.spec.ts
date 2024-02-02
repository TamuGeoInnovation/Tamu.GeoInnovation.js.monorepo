import { ParseDateTimeStringsPipe } from './parse-date-time-strings.pipe';

describe('ParseDateTimeStringsPipe', () => {
  it('create an instance', () => {
    const pipe = new ParseDateTimeStringsPipe();
    expect(pipe).toBeTruthy();
  });
});
