import type { RsvpDashboard } from '@tamu-gisc/gisday/platform/data-api';

import {
  dashboardBands,
  dashboardDaily,
  dashboardFileName,
  dashboardRows,
  dashboardSeries,
  dashboardTotals
} from './event-dashboard.component';

const counts = (c: Partial<RsvpDashboard['events'][0]['counts']>) => ({
  undergraduate: 0,
  graduate: 0,
  student: 0,
  academia: 0,
  industry: 0,
  'not-given': 0,
  ...c
});

const dashboard: RsvpDashboard = {
  events: [
    {
      guid: 'e-1',
      name: 'Workshop',
      starts: '2026-11-18T15:00:00.000Z',
      location: 'ILCB 111',
      place: null,
      total: 3,
      counts: counts({ undergraduate: 2, academia: 1 })
    },
    {
      guid: 'e-2',
      name: 'Keynote',
      starts: '2026-11-18T20:00:00.000Z',
      location: null,
      place: null,
      total: 1,
      counts: counts({ industry: 1 })
    }
  ],
  made: [
    { event: 'e-1', created: '2026-11-01T15:00:00Z' },
    { event: 'e-1', created: '2026-11-01T16:00:00Z' },
    { event: 'e-2', created: '2026-11-03T15:00:00Z' },
    { event: 'e-1', created: '2026-11-04T15:00:00Z' }
  ],
  unreadAccounts: 0
};

describe('dashboardTotals()', () => {
  it('adds up every event, type by type', () => {
    expect(dashboardTotals(dashboard.events)).toEqual({
      total: 4,
      counts: counts({ undergraduate: 2, academia: 1, industry: 1 })
    });
  });
});

describe('dashboardRows()', () => {
  it('gives the table each event, its venue under its name and its start in its own column', () => {
    expect(dashboardRows(dashboard.events)[0]).toEqual({
      key: 'e-1',
      name: 'Workshop',
      note: 'ILCB 111',
      when: '2026-11-18T15:00:00.000Z',
      total: 3,
      counts: counts({ undergraduate: 2, academia: 1 })
    });
  });
});

describe('dashboardFileName()', () => {
  it("names an event's CSV by its name and day, in Central time", () => {
    expect(dashboardFileName('gisday-rsvps', dashboard.events[0])).toBe('gisday-rsvps-workshop-2026-11-18');
  });
});

describe('dashboardSeries()', () => {
  it("draws every event's running total, and the opened event's own beside it", () => {
    expect(dashboardSeries(dashboard, null).map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([
      ['All events', [2, 3, 4]]
    ]);
    expect(dashboardSeries(dashboard, dashboard.events[0]).map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([
      ['All events', [2, 3, 4]],
      ['Workshop', [2, 3]]
    ]);
  });
});

describe('dashboardDaily()', () => {
  it("counts every event's new RSVPs each day", () => {
    expect(dashboardDaily(dashboard).points.map((p) => p.y)).toEqual([2, 1, 1]);
  });
});

describe('dashboardBands()', () => {
  it("shades the days the season's events run, in Central time", () => {
    expect(dashboardBands(dashboard)).toEqual([
      { from: new Date('2026-11-18T00:00:00Z'), to: new Date('2026-11-19T00:00:00Z'), label: 'GIS Day week' }
    ]);
  });

  it('shades nothing when no event has a day', () => {
    expect(dashboardBands({ ...dashboard, events: dashboard.events.map((e) => ({ ...e, starts: null })) })).toEqual([]);
  });
});
