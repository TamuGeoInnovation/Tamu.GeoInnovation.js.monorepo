import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SearchSelection, AltSearchHelper } from '@tamu-gisc/ui-kits/ngx/search';

import { offCanvasSlideInFromBottom, offCanvasSlideUpFromTop } from '../../animations/elements';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-omnisearch',
  templateUrl: './omnisearch.component.html',
  styleUrls: ['./omnisearch.component.scss'],
  animations: [offCanvasSlideInFromBottom, offCanvasSlideUpFromTop],
  providers: [AltSearchHelper]
})
export class OmnisearchComponent implements OnInit, OnDestroy {
  /**
   * Determines the backdrop visibility
   */
  public backdropVisible = false;

  /**
   * Determines when the search bar will slide out of view.
   */
  public hideSearchBar: boolean;

  /**
   * Stores as a value, as material icon class string. If provided, it will render in the search bar as the left action
   */
  public searchComponentLeftAction: string;

  /**
   * Stores as a value, as material icon class string. If provided, it will render in the search bar as the right action
   */
  public searchComponentRightAction: string;

  /**
   * Value describing whether the geolocation feature of the search component will be rendered.
   *
   * Value is passed down to child search component.
   */
  public geolocation: boolean;

  private _destroy$: Subject<boolean> = new Subject();

  private _lastRoute: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService,
    private location: Location,
    private mapService: EsriMapService,
    private plannerService: TripPlannerService,
    private dragService: DragService,
    private helper: AltSearchHelper
  ) {
    // Set default search icon on search component on omnisearch initialize.
    this.searchComponentLeftAction = 'menu';
  }

  public ngOnInit(): void {
    // // If the route contains an index, auto-focus component for immediate interaction
    if ('id' in this.route.snapshot.params) {
      this.setFocus();

      // If params has an id, we're performing a search result for a trip point for a trip task.
      // Geolocation should be one of the options.
      this.geolocation = true;
    }

    this.dragService.states.pipe(takeUntil(this._destroy$)).subscribe((states) => {
      // Listen for drag states and set the hideBar value to true if any element on the screen
      // exceeds 60% relative drag position.
      //
      // This will trigger the search bar to slide up out of view.
      this.hideSearchBar = states.some((state) => state.dragPercentage > 60);
    });

    // Preserve last route path.
    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: RouterEvent) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Omnisearch can perform two functions:
   *
   * - Focus and highlight selected search item
   * - Add stop to the trip planner service
   *
   * Determination depends on the current url params.
   */
  public handleResult(selected: SearchSelection<esri.Graphic>) {
    if ('id' in this.route.snapshot.params) {
      // Add stop to the trip planner service

      const tPoint = new TripPoint({
        index: parseInt(this.route.snapshot.params.id, 10),
        source: selected.type,
        originAttributes: selected.selection.attributes,
        originGeometry: {
          raw: selected.selection.geometry
        },
        originParameters: {
          type: 'search',
          value: selected.result.breadcrumbs
        }
      });

      this.plannerService.setStops([tPoint]);

      // if (this._lastRoute) {
      //   this.router.navigate([this._lastRoute]);
      // } else {
      //   this.location.back()
      // }

      this.router.navigate(['map/d/trip']);
    } else {
      this.helper.handleSearchResultFeatureSelection(selected).subscribe((res) => {
        const tPoint = TripPoint.from(res);

        this.mapService.selectFeatures({
          graphics: [tPoint.toEsriGraphic()],
          shouldShowPopup: true,
          popupComponent: res.result.breadcrumbs.source.popupComponent
        });
      });
      this.clearFocus();
    }
  }

  /**
   * Sets component focused state
   *
   * Method handles all the component-specific model changes that reflect in the UI when the search component
   * is focused such as enabling backdrop and changing action icons.
   *
   */
  public setFocus() {
    // Enable the backdrop for the search component search suggestions
    this.backdropVisible = true;

    // Set the component left action to "back" so that previous route or dismiss methods are called on click, isntead.
    this.searchComponentLeftAction = 'arrow_back';
  }

  /**
   * Sets component blurred state.
   *
   * Method handles all the component-specific model changes that reflect in the UI when the search component
   * is blurred such as enabling backdrop and changing action icons.
   *
   */
  public clearFocus() {
    // Disable backdrop
    this.backdropVisible = false;

    // Return the left action to a regular "search" icon
    this.searchComponentLeftAction = 'menu';
  }

  /**
   * Method fired when the child search component emits a left action event, allowing the omnisearch component
   * to determine how to handle the behavior.
   *
   */
  public handleLeftAction() {
    if ('id' in this.route.snapshot.params) {
      this.router.navigate(['map/d/trip']);
    } else if (this.searchComponentLeftAction === 'menu') {
      this.router.navigate(['map/m/sidebar']);
    } else {
      this.clearFocus();
    }
  }
}
