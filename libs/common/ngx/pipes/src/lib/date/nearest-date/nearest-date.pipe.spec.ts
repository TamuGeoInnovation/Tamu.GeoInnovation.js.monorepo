import { NearestDatePipe } from './nearest-date.pipe';

describe('NearestDatePipe', () => {
  let pipe: NearestDatePipe;
  let mockNow: Date;

  beforeEach(() => {
    pipe = new NearestDatePipe();
    mockNow = new Date(2025, 8, 6, 12, 0, 0);
    jest.spyOn(global as { Date }, 'Date').mockImplementation(() => mockNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null for null input', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(pipe.transform([])).toBeNull();
  });

  it('should return the single date when array has one element', () => {
    const testDate = new Date(2025, 8, 7); // Sep 7, 2025
    expect(pipe.transform([testDate])).toBe(testDate);
  });

  it('should return the nearest date when multiple dates are provided', () => {
    const pastDate = new Date(2025, 7, 30); // Aug 30, 2025
    const futureDate = new Date(2025, 8, 10); // Sep 10, 2025
    const fartherFuture = new Date(2025, 9, 1); // Oct 1, 2025

    const result = pipe.transform([pastDate, futureDate, fartherFuture]);
    expect(result).toBe(futureDate); // Sep 10 is closer to Sep 6 than Aug 30 or Oct 1
  });

  it('should return the most recent past date when all dates are in the past', () => {
    const olderDate = new Date(2025, 7, 1); // Aug 1, 2025
    const recentDate = new Date(2025, 8, 5); // Sep 5, 2025

    const result = pipe.transform([olderDate, recentDate]);
    expect(result).toBe(recentDate);
  });

  it('should return the soonest future date when all dates are in the future', () => {
    const soonDate = new Date(2025, 8, 7); // Sep 7, 2025
    const laterDate = new Date(2025, 8, 15); // Sep 15, 2025

    const result = pipe.transform([laterDate, soonDate]);
    expect(result).toBe(soonDate);
  });

  it('should handle dates at equal distance (returns first in array)', () => {
    const pastDate = new Date(2025, 8, 4); // Sep 4, 2025
    const futureDate = new Date(2025, 8, 8); // Sep 8, 2025
    // Both are 2 days away from Sep 6

    const result = pipe.transform([pastDate, futureDate]);
    expect(result).toBe(pastDate); // First in array
  });

  it('should ignore nulls in the dates array', () => {
    const pastDate = new Date(2025, 8, 1); // Sep 1, 2025
    const futureDate = new Date(2025, 8, 9); // Sep 9, 2025
    const result = pipe.transform([null, pastDate, null, futureDate]);
    expect(result).toBe(futureDate);
  });
});
