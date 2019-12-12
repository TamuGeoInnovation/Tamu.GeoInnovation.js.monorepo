import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { TripPoint } from '../../../../services/trip-planner/core/trip-planner-core';

import esri = __esri;

@Component({
  selector: 'base-popup-component',
  templateUrl: './base.popup.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class BasePopupComponent implements OnInit, OnDestroy {
  /**
   * Data set by the parent popup component.
   *
   * @type {esri.Graphic}
   * @memberof BuildingPopupComponent
   */
  public data: esri.Graphic;

  /**
   * Current href string, used in UI
   *
   * @type {string}
   * @memberof BuildingPopupComponent
   */
  public url: string;

  /**
   * Composed URL passed into the copy component
   *
   * @type {string}
   * @memberof BuildingPopupComponent
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
  ) {}

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
   * @memberof BasePopupComponent
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
            source: '',
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
