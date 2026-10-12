import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, take, takeUntil } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { RangeComponent, RangeTick } from '@tamu-gisc/ui-kits/ngx/forms';

import { BasemapGalleryService } from '../../services/basemap-gallery/basemap-gallery.service';
import { SLIDER_LENGTH, dayOf, positionOfDay, spreadPositions } from './nearmap-timeline';

import esri = __esri;

/**
 * A timeline along the bottom of the map for stepping the Aerial Imagery basemap through Nearmap's
 * captures, oldest on the left and the latest on the right, with a tick per capture (#1541).
 *
 * Shows only while Aerial Imagery is the basemap and its date can be chosen. Place it once inside a
 * map's template; it moves itself into the map view's own UI, so it centres on the map rather than on
 * the window and stays clear of the side panel.
 */
@Component({
  selector: 'tamu-gisc-nearmap-date-slider',
  templateUrl: './nearmap-date-slider.component.html',
  styleUrls: ['./nearmap-date-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RangeComponent, ReactiveFormsModule]
})
export class NearmapDateSliderComponent implements OnInit, OnDestroy {
  private readonly bs = inject(BasemapGalleryService);
  private readonly ms = inject(EsriMapService);
  private readonly el = inject(ElementRef);
  private readonly anl = inject(Angulartics2);

  /** The captures oldest first, the order the slider runs in. */
  private readonly steps = computed(() => [...this.bs.nearmapCaptures()].reverse());

  /**
   * Where each capture sits on the slider, from 0 to `SLIDER_LENGTH`, in the same order as `steps`.
   *
   * A timeline, as in Google Earth's historical imagery: the gaps between ticks are the gaps in time
   * between captures, except that no two are closer than `MIN_GAP`, so captures days apart can still be
   * told apart and picked. The right end is the newest capture, which stands for Nearmap's latest.
   */
  private readonly positions = computed(() => spreadPositions(this.steps().map((capture) => dayOf(capture.date))));

  public readonly sliderLength = SLIDER_LENGTH;

  /** A mark per capture, and each year's label at its 1 January, without a mark. */
  public readonly ticks = computed<RangeTick[]>(() => {
    const steps = this.steps();
    const positions = this.positions();

    if (steps.length === 0) {
      return [];
    }

    const days = steps.map((capture) => dayOf(capture.date));
    const firstYear = Number(steps[0].date.slice(0, 4));
    const lastYear = Number(steps[steps.length - 1].date.slice(0, 4));
    const yearStep = lastYear - firstYear > 12 ? 2 : 1;
    const years: RangeTick[] = [];

    for (let year = firstYear + 1; year <= lastYear; year += yearStep) {
      years.push({ value: positionOfDay(dayOf(`${year}-01-01`), days, positions), label: `${year}`, mark: false });
    }

    return [...positions.map((value) => ({ value })), ...years];
  });

  public readonly visible = computed(() => this.steps().length > 0);

  /** Where the slider is while it is dragged, before anything is requested. */
  private readonly at = signal(0);

  /** The capture the slider is on or nearest to, which is the one it will show. */
  private readonly nearest = computed(() => {
    const positions = this.positions();

    if (positions.length === 0) {
      return undefined;
    }

    const index = positions.reduce(
      (best, position, i) => (Math.abs(position - this.at()) < Math.abs(positions[best] - this.at()) ? i : best),
      0
    );

    return { capture: this.steps()[index], index };
  });

  /** What the label reads: the capture under the slider, or the latest at its right end. */
  public readonly currentLabel = computed(() => {
    const nearest = this.nearest();

    if (!nearest) {
      return '';
    }

    return nearest.index === this.steps().length - 1 ? `Latest (${nearest.capture.label})` : nearest.capture.label;
  });

  public readonly loading = this.bs.nearmapLoading;

  public readonly position = new FormControl<number>(0);

  private view: esri.MapView | esri.SceneView;
  private readonly _destroy$ = new Subject<void>();

  constructor() {
    // Follow the capture showing, including one opened from an `?imagery=` link.
    effect(() => {
      const date = this.bs.nearmapDate();
      const steps = this.steps();
      const positions = this.positions();

      if (steps.length === 0) {
        return;
      }

      const index = date ? steps.findIndex((capture) => capture.date === date) : -1;
      const at = positions[index >= 0 ? index : positions.length - 1];

      untracked(() => {
        this.at.set(at);
        this.position.setValue(at, { emitEvent: false });
      });
    });
  }

  public ngOnInit(): void {
    this.ms.store.pipe(take(1), takeUntil(this._destroy$)).subscribe((instance) => {
      this.view = instance.view;
      this.view.ui.add(this.el.nativeElement, 'manual');
    });

    this.position.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((at) => this.at.set(at));

    // Dragging passes over several captures; only the one it comes to rest near is requested, and the
    // slider snaps onto it.
    this.position.valueChanges.pipe(debounceTime(400), takeUntil(this._destroy$)).subscribe(() => {
      const nearest = this.nearest();

      if (!nearest) {
        return;
      }

      const snapped = this.positions()[nearest.index];
      const date = nearest.index === this.steps().length - 1 ? undefined : nearest.capture.date;

      this.position.setValue(snapped, { emitEvent: false });
      this.at.set(snapped);

      if (date === this.bs.nearmapDate()) {
        return;
      }

      this.anl.eventTrack.next({
        action: 'nearmap_date_select',
        properties: {
          category: 'ui_interaction',
          gstCustom: date ?? 'latest'
        }
      });

      this.bs.setNearmapCapture(date);
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    this.view?.ui.remove(this.el.nativeElement);
  }
}
