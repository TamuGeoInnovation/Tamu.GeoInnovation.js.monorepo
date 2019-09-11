import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RouterHistoryService } from '../../../../../modules/services/router-history.service';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { TripPoint } from '../../../../../modules/services/trip-planner/core/trip-planner-core';
import { UIDragService } from '../../../../services/ui/ui-drag.service';

import { AltSearchHelper } from '../../../../../modules/helper/alt-search.service';

import { offCanvasSlideInFromBottom, offCanvasSlideUpFromTop } from '../../../../animations/elements';

@Component({
  selector: 'omnisearch',
  templateUrl: './omnisearch.component.html',
  styleUrls: ['./omnisearch.component.scss'],
  animations: [offCanvasSlideInFromBottom, offCanvasSlideUpFromTop],
  providers: [AltSearchHelper]
})
export class OmnisearchComponent implements OnInit, OnDestroy {
  /**
   * Determines when the backdrop component will be visible
   *
   * @type {boolean}
   * @memberof MobileUiComponent
   */
  public backdropVisible: boolean;

  /**
   * Determines when the search bar will slide out of view.
   *
   * @type {boolean}
   * @memberof OmnisearchComponent
   */
  public hideSearchBar: boolean;

  /**
   * Stores as a value, as matericl icon class string. If provided, it will render in the search bar as the left action
   *
   * @type {string}
   * @memberof OmnisearchComponent
   */
  public searchComponentLeftAction: string;

  /**
   * Stores as a value, as matericl icon class string. If provided, it will render in the search bar as the right action
   *
   * @type {string}
   * @memberof OmnisearchComponent
   */
  public searchComponentRightAction: string;

  /**
   * Value describing whether the gelocation feature of the search component will be rendered.
   *
   * Value is passed down to child search component.
   *
   */
  public geolocation: boolean;

  private _destroy$: Subject<Boolean> = new Subject();

  private _lastRoute: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService,
    private location: Location,
    private mapService: EsriMapService,
    private plannerService: TripPlannerService,
    private dragService: UIDragService,
    private helper: AltSearchHelper
  ) {
    // Set default search icon on search component on omnisearch initialize.
    this.searchComponentLeftAction = 'menu';
  }

  public ngOnInit(): void {
    // // If the route contains an index, auto-focus component for immediate interaction
    if (this.route.snapshot.params.hasOwnProperty('id')) {
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
      .subscribe((event: any) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Omnisearch can perform two functions:
   *
   * - Focus and highlight selected search item
   * - Add stop to the trip planner service
   *
   * Determination depends on the current url params.
   *
   * @param {TripPoint} point
   * @memberof OmnisearchComponent
   */
  public handleResult(point: TripPoint) {
    if (this.route.snapshot.params.hasOwnProperty('id')) {
      // Add stop to the trip planner service
      this.plannerService.setStops([Object.assign(point, { index: parseInt(this.route.snapshot.params.id, 10) })]);

      // if (this._lastRoute) {
      //   this.router.navigate([this._lastRoute]);
      // } else {
      //   this.location.back()
      // }

      this.router.navigate(['map/d/trip']);
    } else {
      // const componentOverride = SearchSources.find((source) => {
      //   return source.source == ( < SearchResultBreadcrumbSummary > point.originParameters.value).source;
      // });
      // // Highlight selected feature
      // this.mapService.selectFeatures({
      //   graphics: [point.toEsriGraphic()],
      //   shouldShowPopup: true,
      //   popupComponent: componentOverride ? componentOverride.popupComponent : undefined
      // });

      this.helper.handleSearchResultFeatureSelection(point);

      this.clearFocus();
    }
  }

  /**
   * Sets component focused state
   *
   * Method handles all the component-specific model changes that reflect in the UI when the search component
   * is focused such as enabling backdrop and changing action icons.
   *
   * @memberof OmnisearchComponent
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
   * @memberof OmnisearchComponent
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
   * @memberof OmnisearchComponent
   */
  public handleLeftAction() {
    if (this.route.snapshot.params.hasOwnProperty('id')) {
      this.router.navigate(['map/d/trip']);
    } else if (this.searchComponentLeftAction === 'menu') {
      this.router.navigate(['../sidebar'], { relativeTo: this.route });
    } else {
      this.clearFocus();
    }
  }
}
