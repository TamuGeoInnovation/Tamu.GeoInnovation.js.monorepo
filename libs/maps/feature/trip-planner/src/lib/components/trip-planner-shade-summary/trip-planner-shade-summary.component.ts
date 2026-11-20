import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';

import { ShadeSummary } from '../../services/transportation/walk/shade-casters';

const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];

/** The compass point nearest a bearing in degrees, in words. */
export function compassPoint(bearing: number): string {
  return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}

/**
 * What a shaded walk's directions say about shade: where the sun is at the trip's time, how much of the walk is
 * shaded, what the quickest walk would have been, and what the shadows rest on (shade-aware walking prototype). Shown
 * by the desktop and the phone directions alike.
 */
@Component({
  selector: 'tamu-gisc-trip-planner-shade-summary',
  templateUrl: './trip-planner-shade-summary.component.html',
  styleUrls: ['./trip-planner-shade-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, PercentPipe]
})
export class TripPlannerShadeSummaryComponent {
  public readonly summary = input<ShadeSummary>(undefined);

  public readonly sunFrom = computed(() => compassPoint(this.summary()?.sun.azimuth ?? 0));

  /** Extra minutes the shaded walk takes over the quickest, never shown as negative. */
  public readonly extraMinutes = computed(() => {
    const s = this.summary();

    return s ? Math.max(0, Math.round(s.minutes - s.quickest.minutes)) : 0;
  });

  /** The buildings the walk cuts through, as `EDCT, ZACH and HALB`. */
  public readonly indoorList = computed(() => {
    const names = (this.summary()?.indoors ?? []).map((b) => b.abbreviation);

    return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '');
  });

  public readonly indoorMetres = computed(() =>
    (this.summary()?.indoors ?? []).reduce((sum, b) => sum + b.metres, 0)
  );

  public readonly buildingCount = computed(() => {
    const b = this.summary()?.buildings;

    return b ? b.model + b.floors + b.default : 0;
  });

  public readonly treeCount = computed(() => {
    const t = this.summary()?.trees;

    return t ? t.measured + t.estimated : 0;
  });
}
