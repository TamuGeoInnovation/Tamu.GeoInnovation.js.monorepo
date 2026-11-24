import { centralDay, centralInstant, formatCentral, GISDAY_TIME_ZONE } from './central-time';

/** #3323: GIS Day's one Central-time module. */
describe('central time', () => {
  it('is US Central', () => {
    expect(GISDAY_TIME_ZONE).toBe('America/Chicago');
  });

  it('formats in Central time with a plain space before AM and PM, whatever the ICU version', () => {
    const text = formatCentral('2026-11-01T15:00:00.000Z', { hour: 'numeric', minute: '2-digit' });

    expect(text).toBe('9:00 AM');
    expect(text).not.toMatch(/\u202f/);
  });

  it("gives an instant's Central calendar day, either side of the November and March changes", () => {
    expect(['2026-11-01T04:59:00.000Z', '2026-11-01T05:00:00.000Z', '2026-03-08T05:59:00.000Z', '2026-03-08T06:00:00.000Z'].map(centralDay)).toEqual([
      '2026-10-31',
      '2026-11-01',
      '2026-03-07',
      '2026-03-08'
    ]);
  });

  it('gives the instant of a Central wall-clock time, in daylight and standard time alike', () => {
    expect(
      [centralInstant('2026-11-01'), centralInstant('2026-11-01', '09:00'), centralInstant('2026-03-08'), centralInstant('2026-03-08', '10:00:30')].map(
        (d) => d.toISOString()
      )
    ).toEqual(['2026-11-01T05:00:00.000Z', '2026-11-01T15:00:00.000Z', '2026-03-08T06:00:00.000Z', '2026-03-08T15:00:30.000Z']);
  });
});
