import { ToDatePipe } from './to-date.pipe';

describe('ToDatePipe', () => {
  let pipe: ToDatePipe;

  beforeEach(() => {
    pipe = new ToDatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null for nullish input', () => {
    expect(pipe.transform(null as unknown as string)).toBeNull();
    expect(pipe.transform(undefined as unknown as string)).toBeNull();
  });

  it('should convert single string/number/Date to Date', () => {
    const iso = '2025-09-06T00:00:00Z';
    const ts = Date.parse(iso);
    const d = new Date(iso);

    const fromString = pipe.transform(iso) as Date;
    const fromNumber = pipe.transform(ts) as Date;
    const fromDate = pipe.transform(d) as Date;

    expect(fromString instanceof Date && !isNaN(fromString.getTime())).toBe(true);
    expect(fromNumber instanceof Date && !isNaN(fromNumber.getTime())).toBe(true);
    expect(fromDate).toBe(d);
  });

  it('should convert array input to array of Dates (always array)', () => {
    const iso1 = '2025-09-06T00:00:00Z';
    const iso2 = '2025-09-10T00:00:00Z';
    const result = pipe.transform([iso1, iso2]);
    expect(Array.isArray(result)).toBe(true);
    expect((result as Array<Date | null>).length).toBe(2);
    for (const d of result as Array<Date | null>) {
      expect(d instanceof Date && !isNaN((d as Date).getTime())).toBe(true);
    }
  });

  it('should return [null] for invalid single value inside array', () => {
    const result = pipe.transform(['not-a-date']);
    expect(result).toEqual([null]);
  });
});
