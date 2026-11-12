import { bandOfDays, countsByDay, dayIn, everyDay, runningTotalByDay, withColors } from './chart-data';

const times = [
  '2026-11-03T15:00:00Z',
  '2026-11-01T15:00:00Z',
  '2026-11-01T20:00:00Z',
  // 11:30 PM Central on 3 November, already the 4th in UTC.
  '2026-11-04T05:30:00Z'
];

describe('countsByDay()', () => {
  it('counts each day, in Central time, in order', () => {
    expect(countsByDay(times)).toEqual([
      { x: new Date('2026-11-01T00:00:00Z'), y: 2 },
      { x: new Date('2026-11-03T00:00:00Z'), y: 2 }
    ]);
  });
});

describe('runningTotalByDay()', () => {
  it('adds up each day, in Central time, in order', () => {
    expect(runningTotalByDay(times)).toEqual([
      { x: new Date('2026-11-01T00:00:00Z'), y: 2 },
      { x: new Date('2026-11-03T00:00:00Z'), y: 4 }
    ]);
  });

  it('gives nothing for no times', () => {
    expect(runningTotalByDay([])).toEqual([]);
  });
});

describe('everyDay()', () => {
  const points = [
    { x: new Date('2026-11-01T00:00:00Z'), y: 2 },
    { x: new Date('2026-11-04T00:00:00Z'), y: 5 }
  ];

  it('holds the last value on days with no point, for a running total', () => {
    expect(everyDay(points, 'hold').map((p) => [p.x.toISOString().slice(0, 10), p.y])).toEqual([
      ['2026-11-01', 2],
      ['2026-11-02', 2],
      ['2026-11-03', 2],
      ['2026-11-04', 5]
    ]);
  });

  it("counts zero on days with no point, for a day's count", () => {
    expect(everyDay(points, 'zero').map((p) => p.y)).toEqual([2, 0, 0, 5]);
  });

  it('gives nothing for no points', () => {
    expect(everyDay([], 'hold')).toEqual([]);
  });
});

describe('bandOfDays()', () => {
  it('runs from the first day to the end of the last, in Central time', () => {
    // 7 PM Central on the 20th is already the 21st in UTC.
    expect(bandOfDays(['2026-11-18T15:00:00Z', '2026-11-16T14:00:00Z', '2026-11-21T01:00:00Z'], 'GIS Day week')).toEqual({
      from: new Date('2026-11-16T00:00:00Z'),
      to: new Date('2026-11-21T00:00:00Z'),
      label: 'GIS Day week'
    });
  });

  it('gives no band for no times', () => {
    expect(bandOfDays([], 'GIS Day week')).toBeNull();
  });
});

describe('withColors()', () => {
  it('keeps a colour given and fills in the rest in order', () => {
    expect(withColors([{ label: 'a', points: [] }, { label: 'b', points: [], color: 'teal' }, { label: 'c', points: [] }]).map((s) => s.color)).toEqual([
      '#500000',
      'teal',
      '#d95f02'
    ]);
  });
});

describe('dayIn()', () => {
  it('gives the calendar day in the time zone asked for', () => {
    expect(dayIn(new Date('2026-11-04T05:30:00Z'), 'America/Chicago')).toBe('2026-11-03');
    expect(dayIn(new Date('2026-11-04T05:30:00Z'), 'UTC')).toBe('2026-11-04');
  });
});
