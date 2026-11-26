import { DestroyRef, Signal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, filter } from 'rxjs';

import type { Season } from '@tamu-gisc/gisday/platform/data-api';
import { alignToAnchor, ChartPoint, ChartSeries, runningTotalByDay, weekAnchor } from '@tamu-gisc/ui-kits/ngx/charts';

/** A season the chart can compare: its year, and the Monday of its GIS Day week, or null with no days set. */
export interface ComparableSeason {
  guid: string;
  year: number;
  anchor: Date | null;
}

/** An earlier season's records as the comparison reads them: while they load, if they could not be, and once they are. */
export type ComparedRecords = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; made: Array<string> };

/** One year's button: whether its line is shown, and, if it cannot be, why not. */
export interface SeasonButton {
  guid: string;
  year: number;
  pressed: boolean;
  /** Why the button cannot be pressed, or null if it can. The selected season's is always shown. */
  disabledBecause: string | null;
  loading: boolean;
}

/** The colours of the compared years, after the selected season's maroon and an opened row's blue. */
export const COMPARED_COLORS = ['#d95f02', '#707373', '#1b9e77', '#7570b3', '#e7298a', '#66a61e'];

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

/** Each season with its GIS Day week's Monday, newest first. */
export function comparableSeasons(seasons: Array<Partial<Season>>): Array<ComparableSeason> {
  return seasons
    .filter((s): s is Partial<Season> & { guid: string; year: number } => Boolean(s.guid) && typeof s.year === 'number')
    .map((s) => ({ guid: s.guid, year: s.year, anchor: weekAnchor((s.days ?? []).map((d) => d.date)) }))
    .sort((a, b) => b.year - a.year);
}

/** The year before `selected`'s, if there is one: what a chart compares when it opens (decided on #3215). */
export function previousSeason(seasons: Array<ComparableSeason>, selected: ComparableSeason): ComparableSeason | null {
  return seasons.filter((s) => s.year < selected.year).sort((a, b) => b.year - a.year)[0] ?? null;
}

/**
 * The chart's lines with earlier seasons beside the selected one's (#3215). Each earlier season's records are drawn as a
 * running total on the selected season's days, moved so the Mondays of their GIS Day weeks fall on the same x, and end
 * with its GIS Day week. The selected season's lines are as the page draws them, the first named by its year. With
 * nothing to compare, or no week to line up on, they are unchanged and the axis reads in dates.
 */
export function compareSeasons(
  selected: ComparableSeason | null,
  lines: Array<ChartSeries>,
  earlier: Array<{ season: ComparableSeason; made: Array<string> }>
): { series: Array<ChartSeries>; anchor: Date | null } {
  const anchor = selected?.anchor ?? null;
  const drawn = earlier.filter(
    (e): e is { season: ComparableSeason & { anchor: Date }; made: Array<string> } =>
      e.season.anchor !== null && e.made.length > 0
  );

  if (!selected || !anchor || drawn.length === 0 || lines.length === 0) {
    return { series: lines, anchor: null };
  }

  const [first, ...rest] = lines;

  return {
    series: [
      { ...first, label: `${selected.year}`, color: first.color ?? '#500000' },
      ...rest.map((line) => ({ ...line, color: line.color ?? '#2c7fb8' })),
      ...drawn.map(({ season, made }, i) =>
        alignToAnchor(
          {
            label: `${season.year}`,
            points: throughWeek(runningTotalByDay(made), season.anchor),
            color: COMPARED_COLORS[i % COMPARED_COLORS.length]
          },
          season.anchor,
          anchor
        )
      )
    ],
    anchor
  };
}

/**
 * A running total up to the end of the GIS Day week starting `anchor`, as decided on #3215: the days after its Sunday
 * left out, and its total held to that Sunday, so an earlier year's line runs to the end of its week rather than
 * stopping at its last record.
 */
export function throughWeek(points: Array<ChartPoint>, anchor: Date): Array<ChartPoint> {
  const sunday = anchor.getTime() + WEEK - DAY;
  const kept = points.filter((p) => p.x.getTime() <= sunday);
  const last = kept[kept.length - 1];

  return last && last.x.getTime() < sunday ? [...kept, { x: new Date(sunday), y: last.y }] : kept;
}

/** Each season's button, newest first. */
export function seasonButtons(
  seasons: Array<ComparableSeason>,
  selected: ComparableSeason | null,
  shown: Array<string>,
  records: Record<string, ComparedRecords>,
  noun: string
): Array<SeasonButton> {
  return seasons.map((season) => {
    const state = records[season.guid];
    const isSelected = season.guid === selected?.guid;
    let disabledBecause: string | null = null;

    if (isSelected) {
      disabledBecause = 'The season selected above is always shown.';
    } else if (!season.anchor) {
      disabledBecause = `${season.year} has no GIS Day week days set, so there is nothing to line it up on.`;
    } else if (!selected?.anchor) {
      disabledBecause = `${selected?.year ?? 'The selected season'} has no GIS Day week days set, so there is nothing to line ${season.year} up on.`;
    } else if (state?.status === 'failed') {
      disabledBecause = `${season.year}'s ${noun} could not be read.`;
    } else if (state?.status === 'ready' && state.made.length === 0) {
      disabledBecause = `${season.year} has no ${noun}.`;
    }

    return {
      guid: season.guid,
      year: season.year,
      pressed: isSelected || (shown.includes(season.guid) && disabledBecause === null),
      disabledBecause,
      loading: state?.status === 'loading'
    };
  });
}

/**
 * Earlier seasons drawn beside the selected one on a dashboard's chart (#3215): which are shown, their records once read,
 * and the year buttons. A page makes one in its ngOnInit with how it reads a season's records (when each was made), and
 * draws its chart's lines through `compare`. A season's records are read the first time its button is pressed, and kept.
 */
export class SeasonComparison {
  public readonly seasons = signal<Array<ComparableSeason>>([]);
  public readonly selected = signal<ComparableSeason | null>(null);
  /** The earlier seasons whose lines are shown, by guid. */
  public readonly shown = signal<Array<string>>([]);
  public readonly records = signal<Record<string, ComparedRecords>>({});

  public readonly buttons: Signal<Array<SeasonButton>>;

  constructor(
    private readonly read: (seasonGuid: string) => Observable<Array<string>>,
    seasons$: Observable<Array<Partial<Season>>>,
    selected$: Observable<Partial<Season> | null | undefined>,
    destroyRef: DestroyRef,
    noun: string
  ) {
    this.buttons = computed(() => seasonButtons(this.seasons(), this.selected(), this.shown(), this.records(), noun));

    combineLatest([seasons$, selected$.pipe(filter((s) => Boolean(s?.guid)))])
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(([all, picked]) => {
        const seasons = comparableSeasons(all ?? []);
        const selected = seasons.find((s) => s.guid === picked?.guid) ?? null;
        const changed = selected?.guid !== this.selected()?.guid;

        this.seasons.set(seasons);
        this.selected.set(selected);

        // A newly selected season opens beside the year before it.
        if (changed) {
          const previous = selected ? previousSeason(seasons, selected) : null;
          this.shown.set([]);

          if (previous) {
            this.toggle(previous.guid);
          }
        }
      });
  }

  /** The selected season's lines with the shown seasons' beside them, and the day the axis counts from. */
  public compare(lines: Array<ChartSeries>): { series: Array<ChartSeries>; anchor: Date | null } {
    const records = this.records();
    const earlier = this.seasons()
      .filter((s) => this.shown().includes(s.guid))
      .map((season) => {
        const state = records[season.guid];

        return { season, made: state?.status === 'ready' ? state.made : [] };
      });

    return compareSeasons(this.selected(), lines, earlier);
  }

  /** Shows or hides a season's line, reading its records the first time. */
  public toggle(guid: string) {
    const button = this.buttons().find((b) => b.guid === guid);

    if (!button || button.guid === this.selected()?.guid) {
      return;
    }

    if (this.shown().includes(guid)) {
      this.shown.update((shown) => shown.filter((g) => g !== guid));

      return;
    }

    if (button.disabledBecause) {
      return;
    }

    this.shown.update((shown) => [...shown, guid]);

    const state = this.records()[guid];

    if (!state || state.status === 'failed') {
      this.records.update((r) => ({ ...r, [guid]: { status: 'loading' } }));
      this.read(guid).subscribe({
        next: (made) => this.records.update((r) => ({ ...r, [guid]: { status: 'ready', made } })),
        error: () => this.records.update((r) => ({ ...r, [guid]: { status: 'failed' } }))
      });
    }
  }
}
