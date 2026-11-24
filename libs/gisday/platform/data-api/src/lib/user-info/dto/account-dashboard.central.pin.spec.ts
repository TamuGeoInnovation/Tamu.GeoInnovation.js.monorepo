import { centralDay, centralMidnight, seasonWindow } from './account-dashboard.dto';

/**
 * The accounts dashboard's Central days and midnights (#3323), on and either side of the November and March changes of
 * 2026, pinned before they move to gisday/common's one Central-time module.
 */
describe("the accounts dashboard's Central time (#3323)", () => {
  const DAYS = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-03-07', '2026-03-08', '2026-03-09'];

  it('centralDay', () => {
    expect(
      ['2026-11-01T04:59:00.000Z', '2026-11-01T05:01:00.000Z', '2026-11-01T06:30:00.000Z', '2026-03-08T05:59:00.000Z', '2026-03-08T06:01:00.000Z', '2026-03-09T04:59:00.000Z'].map(
        (i) => centralDay(i)
      )
    ).toEqual([
      '2026-10-31',
      '2026-11-01',
      '2026-11-01',
      '2026-03-07',
      '2026-03-08',
      '2026-03-08'
    ]);
  });

  it('centralMidnight', () => {
    expect(DAYS.map((d) => centralMidnight(d).toISOString())).toEqual([
      '2026-10-31T05:00:00.000Z',
      '2026-11-01T05:00:00.000Z',
      '2026-11-02T06:00:00.000Z',
      '2026-03-07T06:00:00.000Z',
      '2026-03-08T06:00:00.000Z',
      '2026-03-09T05:00:00.000Z'
    ]);
  });

  it('seasonWindow across a change', () => {
    const { from, to } = seasonWindow(['2026-11-02T06:00:00.000Z'], ['2026-03-07T06:00:00.000Z']);

    expect([from?.toISOString(), to.toISOString()]).toEqual([
      '2026-03-08T06:00:00.000Z',
      '2026-11-03T06:00:00.000Z'
    ]);
  });
});
