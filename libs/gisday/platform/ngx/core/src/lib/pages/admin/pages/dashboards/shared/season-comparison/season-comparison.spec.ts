import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';

import type { Season } from '@tamu-gisc/gisday/platform/data-api';
import { daysFrom } from '@tamu-gisc/ui-kits/ngx/charts';

import { comparableSeasons, compareSeasons, previousSeason, SeasonComparison, seasonButtons, throughWeek } from './season-comparison';

/** A made-up season with GIS Day week on the days given. */
const season = (guid: string, year: number, days: Array<string>) =>
  ({ guid, year, days: days.map((d) => ({ date: `${d}T18:00:00Z` })) }) as unknown as Partial<Season>;

const s2026 = season('s-2026', 2026, ['2026-11-16', '2026-11-17', '2026-11-18']);
const s2025 = season('s-2025', 2025, ['2025-11-17', '2025-11-18', '2025-11-19']);
const s2024 = season('s-2024', 2024, ['2024-11-18', '2024-11-20']);
const noDays = season('s-2023', 2023, []);

const day = (d: string) => new Date(`${d}T00:00:00Z`);

describe('comparableSeasons() and previousSeason() (#3215)', () => {
  it('gives each season the Monday of its GIS Day week, newest first, and the year before the selected one', () => {
    const seasons = comparableSeasons([s2024, s2026, noDays, s2025]);

    expect(seasons.map((s) => [s.year, s.anchor?.toISOString().slice(0, 10) ?? null])).toEqual([
      [2026, '2026-11-16'],
      [2025, '2025-11-17'],
      [2024, '2024-11-18'],
      [2023, null]
    ]);
    expect(previousSeason(seasons, seasons[0])?.year).toBe(2025);
    expect(previousSeason(seasons, seasons[3])).toBeNull();
  });
});

describe('compareSeasons() (#3215)', () => {
  const [c2026, c2025] = comparableSeasons([s2026, s2025]);
  const lines = [{ label: 'All events', points: [{ x: day('2026-11-10'), y: 4 }] }];

  it('leaves the lines as they are, on dates, with nothing to compare', () => {
    expect(compareSeasons(c2026, lines, [])).toEqual({ series: lines, anchor: null });
  });

  it("draws an earlier year on the selected year's days, each GIS Day week's Monday on the same x, counted from it", () => {
    // 2025: one RSVP 10 days before GIS Day week, one on its Monday, and one the week after, which is left out.
    const made = ['2025-11-07T18:00:00Z', '2025-11-17T18:00:00Z', '2025-11-25T18:00:00Z'];

    const { series, anchor } = compareSeasons(c2026, lines, [{ season: c2025, made }]);

    expect(anchor).toEqual(day('2026-11-16'));
    expect(series.map((s) => s.label)).toEqual(['2026', '2025']);
    // It runs to the Sunday ending its week, holding its total, rather than stopping at its last record (lab report 135).
    expect(series[1].points.map((p) => [daysFrom(anchor as Date, p.x), p.y])).toEqual([
      [-10, 1],
      [0, 2],
      [6, 2]
    ]);
  });

  it('draws nothing for an earlier year with no records, and nothing when the selected year has no week', () => {
    const [, , c2023] = comparableSeasons([s2026, s2025, noDays]);

    expect(compareSeasons(c2026, lines, [{ season: c2025, made: [] }]).anchor).toBeNull();
    expect(compareSeasons(c2023, lines, [{ season: c2025, made: ['2025-11-17T18:00:00Z'] }]).anchor).toBeNull();
  });
});

describe('throughWeek() (#3215)', () => {
  const monday = day('2025-11-17');

  it("holds the total to the week's Sunday, and leaves out what comes after it", () => {
    const points = [
      { x: day('2025-11-10'), y: 3 },
      { x: day('2025-11-18'), y: 5 },
      { x: day('2025-11-25'), y: 9 }
    ];

    expect(throughWeek(points, monday)).toEqual([
      { x: day('2025-11-10'), y: 3 },
      { x: day('2025-11-18'), y: 5 },
      { x: day('2025-11-23'), y: 5 }
    ]);
  });

  it('adds nothing to a line that already reaches the Sunday, or to no points', () => {
    expect(throughWeek([{ x: day('2025-11-23'), y: 4 }], monday)).toEqual([{ x: day('2025-11-23'), y: 4 }]);
    expect(throughWeek([], monday)).toEqual([]);
  });
});

describe('seasonButtons() (#3215)', () => {
  const seasons = comparableSeasons([s2026, s2025, s2024, noDays]);

  it('presses the selected year and the shown ones, and says why a year cannot be pressed', () => {
    const buttons = seasonButtons(
      seasons,
      seasons[0],
      ['s-2025'],
      { 's-2025': { status: 'ready', made: ['x'] }, 's-2024': { status: 'ready', made: [] } },
      'RSVPs'
    );

    expect(buttons.map((b) => [b.year, b.pressed, b.disabledBecause])).toEqual([
      [2026, true, 'The season selected above is always shown.'],
      [2025, true, null],
      [2024, false, '2024 has no RSVPs.'],
      [2023, false, '2023 has no GIS Day week days set, so there is nothing to line it up on.']
    ]);
  });
});

describe('SeasonComparison (#3215)', () => {
  function make(read: (guid: string) => Observable<Array<string>>) {
    const destroyRef = TestBed.inject(DestroyRef);
    const selected$ = new BehaviorSubject<Partial<Season>>(s2026);
    const comparison = new SeasonComparison(read, of([s2026, s2025, s2024]), selected$, destroyRef, 'RSVPs');

    return { comparison, selected$ };
  }

  it('opens beside the year before, reading its records once', () => {
    const read = jest.fn(() => of(['2025-11-17T18:00:00Z']));
    const { comparison } = make(read);

    expect(read).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledWith('s-2025');
    expect(comparison.compare([{ label: 'All events', points: [] }]).series.map((s) => s.label)).toEqual(['2026', '2025']);

    comparison.toggle('s-2025');
    comparison.toggle('s-2025');

    expect(read).toHaveBeenCalledTimes(1);
  });

  it('opens a newly selected season beside the year before it instead', () => {
    const read = jest.fn(() => of(['2024-11-18T18:00:00Z']));
    const { comparison, selected$ } = make(read);

    selected$.next(s2025);

    expect(comparison.shown()).toEqual(['s-2024']);
  });

  it('marks a year whose records could not be read, and leaves it off the chart', () => {
    const { comparison } = make(() => throwError(() => new Error('down')));

    expect(comparison.buttons().find((b) => b.year === 2025)?.disabledBecause).toBe("2025's RSVPs could not be read.");
    expect(comparison.compare([{ label: 'All events', points: [] }]).anchor).toBeNull();
  });

  it('shows a year as loading until its records arrive', () => {
    const pending = new Subject<Array<string>>();
    const { comparison } = make(() => pending);

    expect(comparison.buttons().find((b) => b.year === 2025)?.loading).toBe(true);

    pending.next(['2025-11-17T18:00:00Z']);

    expect(comparison.buttons().find((b) => b.year === 2025)?.loading).toBe(false);
  });
});
