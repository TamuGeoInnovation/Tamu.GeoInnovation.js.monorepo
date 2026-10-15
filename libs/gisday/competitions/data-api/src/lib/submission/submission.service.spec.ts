import { clampAccuracy } from './submission.service';

describe('clampAccuracy', () => {
  it('keeps the reported accuracy in metres, to the centimetre (#1784)', () => {
    expect(clampAccuracy(12)).toBe(12);
    expect(clampAccuracy(7.456)).toBe(7.46);
    expect(clampAccuracy('35.2')).toBe(35.2);
  });

  it('keeps it within what its column holds', () => {
    expect(clampAccuracy(2500)).toBe(999.99);
  });

  it('saves 0 when none was reported or it makes no sense', () => {
    expect(clampAccuracy(undefined)).toBe(0);
    expect(clampAccuracy(null)).toBe(0);
    expect(clampAccuracy('far')).toBe(0);
    expect(clampAccuracy(-4)).toBe(0);
  });
});
