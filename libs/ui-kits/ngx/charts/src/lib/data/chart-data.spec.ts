import {
  alignToAnchor,
  anchorTicks,
  bandOfDays,
  countsByDay,
  dayIn,
  daysFrom,
  everyDay,
  relativeDayLabel,
  runningTotalByDay,
  weekAnchor,
  withColors
} from './chart-data';

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

describe('weekAnchor() (#3215)', () => {
  it("gives the Monday of the week holding the days, in Central time", () => {
    // GIS Day week 2025: Monday 17 to Friday 21 November.
    expect(weekAnchor(['2025-11-17T15:00:00Z', '2025-11-19T15:00:00Z', '2025-11-21T15:00:00Z'])).toEqual(new Date('2025-11-17T00:00:00Z'));
  });

  it('gives the Monday even when the week has no Monday in it', () => {
    expect(weekAnchor(['2024-11-19T15:00:00Z', '2024-11-20T15:00:00Z'])).toEqual(new Date('2024-11-18T00:00:00Z'));
  });

  it("takes the week holding most of the days, not a stray day before or after it, as 2023's list has", () => {
    const days = ['2023-11-10', '2023-11-12', '2023-11-14', '2023-11-15', '2023-11-16', '2023-11-17', '2023-11-30'].map(
      (d) => `${d}T18:00:00Z`
    );

    expect(weekAnchor(days)).toEqual(new Date('2023-11-13T00:00:00Z'));
  });

  it('counts a Sunday in the week that started the Monday before', () => {
    expect(weekAnchor(['2026-11-22T18:00:00Z'])).toEqual(new Date('2026-11-16T00:00:00Z'));
  });

  it('gives no anchor for no days', () => {
    expect(weekAnchor([])).toBeNull();
  });
});

describe('alignToAnchor() (#3215)', () => {
  const day = (d: string) => new Date(`${d}T00:00:00Z`);

  it("puts two seasons' GIS Day weeks at the same x, though they fall on different dates", () => {
    const anchor2025 = weekAnchor(['2025-11-17T15:00:00Z']) as Date;
    const anchor2026 = weekAnchor(['2026-11-16T15:00:00Z']) as Date;
    const lastYear = { label: '2025', points: [{ x: day('2025-11-07'), y: 3 }, { x: day('2025-11-17'), y: 9 }] };

    const aligned = alignToAnchor(lastYear, anchor2025, anchor2026);

    // The first day of 2025's GIS Day week is drawn on the first day of 2026's, and ten days before it ten days before.
    expect(aligned.points).toEqual([
      { x: day('2026-11-06'), y: 3 },
      { x: day('2026-11-16'), y: 9 }
    ]);
    expect(daysFrom(anchor2026, aligned.points[1].x)).toBe(0);
    expect(daysFrom(anchor2026, aligned.points[0].x)).toBe(daysFrom(anchor2025, lastYear.points[0].x));
    // How far it moved, so its hover can give each point's own date.
    expect(aligned.shiftDays).toBe(364);
  });

  it('leaves out the points from `until` on', () => {
    const series = { label: '2025', points: [{ x: day('2025-11-20'), y: 1 }, { x: day('2025-11-24'), y: 2 }] };

    expect(alignToAnchor(series, day('2025-11-17'), day('2026-11-16'), day('2025-11-24')).points).toEqual([{ x: day('2026-11-19'), y: 1 }]);
  });
});

describe('relativeDayLabel() (#3215)', () => {
  it('reads a day before the anchor with a minus sign, after it with a plus, and the anchor as 0', () => {
    expect([-7, 0, 3].map(relativeDayLabel)).toEqual(['−7', '0', '+3']);
  });
});

describe('anchorTicks() (#3215)', () => {
  const anchor = new Date('2026-11-16T00:00:00Z');
  const at = (days: number) => anchor.getTime() + days * 24 * 60 * 60 * 1000;
  const labels = (ticks: Array<number>) => ticks.map((t) => daysFrom(anchor, new Date(t)));

  it('counts whole weeks out from the anchor on a wide chart, the anchor among them', () => {
    expect(labels(anchorTicks(anchor, at(-42), at(7), 1000))).toEqual([-42, -35, -28, -21, -14, -7, 0, 7]);
  });

  it("keeps the anchor on a phone's narrow chart, two weeks apart, rather than -35, -21, -7 (lab report 136)", () => {
    expect(labels(anchorTicks(anchor, at(-42), at(7), 300))).toEqual([-42, -28, -14, 0]);
  });

  it('counts single days on a short span, such as one week of check-ins', () => {
    expect(labels(anchorTicks(anchor, at(0), at(7), 800))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});
