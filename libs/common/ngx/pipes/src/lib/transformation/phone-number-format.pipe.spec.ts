import { PhoneNumberFormatPipe } from './phone-number-format.pipe';

describe('PhoneNumberFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new PhoneNumberFormatPipe();
    expect(pipe).toBeTruthy();
  });
});
