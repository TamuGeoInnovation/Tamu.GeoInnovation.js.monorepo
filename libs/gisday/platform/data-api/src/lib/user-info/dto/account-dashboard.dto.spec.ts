import type { RsvpDashboardPerson } from '../../user-rsvp/dto/rsvp-dashboard.dto';
import { accountRowKey, accountRows, centralDay, centralMidnight, seasonWindow } from './account-dashboard.dto';

const person = (organization: string | null, type: RsvpDashboardPerson['type'] = 'industry'): RsvpDashboardPerson => ({
  firstName: null,
  lastName: null,
  email: null,
  type,
  classification: null,
  department: null,
  position: null,
  organization,
  created: '2026-10-01T15:00:00.000Z'
});

describe('centralDay() and centralMidnight()', () => {
  it('give the day in Central time, which can be the day before the UTC one', () => {
    expect(centralDay('2026-11-21T03:00:00.000Z')).toBe('2026-11-20');
  });

  it('give midnight in standard time and in daylight time', () => {
    expect(centralMidnight('2026-11-21').toISOString()).toBe('2026-11-21T06:00:00.000Z');
    expect(centralMidnight('2026-07-04').toISOString()).toBe('2026-07-04T05:00:00.000Z');
  });
});

describe('seasonWindow()', () => {
  const days2025 = ['2025-11-17T06:00:00.000Z', '2025-11-21T06:00:00.000Z', '2025-11-19T06:00:00.000Z'];
  const days2026 = ['2026-11-16T06:00:00.000Z', '2026-11-20T06:00:00.000Z'];

  it('runs from the day after the previous season ends to the end of this one, in Central time', () => {
    const { from, to } = seasonWindow(days2026, days2025);

    expect(from.toISOString()).toBe('2025-11-22T06:00:00.000Z');
    expect(to.toISOString()).toBe('2026-11-21T06:00:00.000Z');
  });

  it('starts at the beginning when there is no previous season with a day', () => {
    expect(seasonWindow(days2026, []).from).toBeNull();
  });

  it('ends now when the season has no day yet', () => {
    const now = new Date('2026-08-01T12:00:00.000Z');

    expect(seasonWindow([], days2025, now).to).toBe(now);
  });
});

describe('accountRowKey()', () => {
  it('puts the same name, however it is typed, in one row, and no name in Not given', () => {
    expect(accountRowKey('  Texas A&M   University ')).toBe(accountRowKey('texas a&m university'));
    expect(accountRowKey(null)).toBe('not-given');
    expect(accountRowKey('   ')).toBe('not-given');
  });
});

describe('accountRows()', () => {
  it('counts each university or employer by person type, the most accounts first, and no name last', () => {
    const rows = accountRows([
      person('Esri'),
      person(null, 'not-given'),
      person('Texas A&M University', 'undergraduate'),
      person('texas a&m university', 'graduate'),
      person('Texas A&M University', 'academia')
    ]);

    expect(rows.map((r) => [r.name, r.total])).toEqual([
      ['Texas A&M University', 3],
      ['Esri', 1],
      ['No university or employer given', 1]
    ]);
    expect(rows[0].counts).toMatchObject({ undergraduate: 1, graduate: 1, academia: 1, industry: 0 });
  });
});
