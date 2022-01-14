import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { BasePopupComponent } from '../base/base.popup.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-base-directions',
  templateUrl: './base-directions.component.html',
  styleUrls: ['./base-directions.component.scss']
})
export class BaseDirectionsComponent extends BasePopupComponent implements OnInit, OnDestroy {
  /**
   * Data set by the parent popup component.
   */
  public data: esri.Graphic;

  /**
   * Current href string, used in UI
   */
  public url: string;

  /**
   * Composed URL passed into the copy component
   */
  public shareUrl: string;

  private _stops: TripPoint[];

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private plannerService: TripPlannerService,
    private analytics: Angulartics2,
    private mapService: EsriMapService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.url = window.location.origin;
    this.shareUrl = `${this.url}/?bldg=${this.data.attributes.Number}`;

    // Set a listener for stop changes.
    // This is used to determine the length of stops, allowing to reliably set the last endpoint.
    this.plannerService.Stops.pipe(takeUntil(this._destroy$)).subscribe((stops) => {
      this._stops = stops;
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Enable trip planning mode setting selected feature as the endpoint.
   *
   * Event called from sub-classes because display fields (e.g. BldgName) are different for
   * different layers and are handled there.
   *
   * @param {string} analyticsLabel Formatted feature name that will be used to report to Google Analytics
   */
  public startDirections(analyticsLabel: string): void {
    this.plannerService.setStops([
      new TripPoint({
        index: this._stops.length - 1,
        source: 'directions-to-here',
        originAttributes: this.data.attributes,
        originGeometry: {
          raw: this.data.geometry
        },
        originParameters: {
          type: 'directions-to-here',
          // Value for this is set during normalization else logic would have to be duplicated here.
          value: {
            source: undefined,
            value: analyticsLabel
          }
        }
      })
    ]);

    const label = {
      guid: guid(),
      date: Date.now(),
      value: analyticsLabel
    };

    this.analytics.eventTrack.next({
      action: 'Directions To Here',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });

    // Clear the popup as we transition to the trip route
    this.mapService.clearHitTest();

    // Navigate to the trip route
    this.router.navigate(['trip'], { relativeTo: this.route });
  }
}
