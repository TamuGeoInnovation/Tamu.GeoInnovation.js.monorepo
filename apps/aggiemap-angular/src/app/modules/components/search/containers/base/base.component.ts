import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  Optional
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import { SearchService, SearchResult, SearchResultItem, SearchSource } from '@tamu-gisc/search';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TripPoint } from '../../../../services/trip-planner/core/trip-planner-core';

import { arrowKeyControl } from '@tamu-gisc/common/utils/ui';
import { getGeolocation, isCoordinatePair } from '@tamu-gisc/common/utils/geometry/generic';
import { TemplateRenderer } from '@tamu-gisc/common/utils/string';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

// Using OnPush change detection strategy since I don't want to pipe out every observable value in the template.
//
// Furthermore, need access to observable values but subscribing and altering model does not trigger change
// detection on push, and so have to mark it manually.
//
// Good performance improvement with OnPush because change detection does not run absolutely everywhere, particularly
// with function property bindings in template.

@Component({
  selector: 'search',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   * Placeholder text for the input.
   *
   * Defaults to blank.
   */
  @Input()
  public placeholder: string;

  /**
   * Option that handles whether or not geolocation for the component is enabled
   *
   * Defaults to false.
   */
  @Input()
  public canGeolocate: boolean;

  /**
   * Option that enables/disabled the left side action icon on the search bar.
   *
   * Default to false.
   */
  @Input()
  public leftActionIcon: string;

  /**
   * Option that enables/disabled the right side action on the search bar.
   *
   * Preset keywords and actions are as follow:
   *
   * - `close` - Clears the input
   *
   * Default to false.
   */
  @Input()
  public rightActionIcon: string;

  /**
   * Option that sets a default search input value
   *
   * Defaults to empty.
   */
  @Input()
  public value = '';

  /**
   * Option describing the index of the component in a list of like components
   *
   * Defaults to 0.
   */
  @Input()
  public index = 0;

  /**
   * Option that auto-focuses input text box when component is rendered.
   *
   * Defaults to 0.
   */
  @Input()
  public focused = false;

  // ===========================================================================

  /**
   * Event emitter that will emit to parent component, the value of the selected item
   */
  @Output()
  public result: EventEmitter<TripPoint> = new EventEmitter();

  /**
   * Event emitter that will emit when the value has changed and is no longer the same as initial.
   */
  @Output()
  public dirty: EventEmitter<SearchEvent> = new EventEmitter();

  /**
   * Event emitter that will emit when the input box in the template is set focus
   */
  @Output()
  public focus: EventEmitter<boolean> = new EventEmitter();

  /**
   * Event emitter that will emit when the input box in the template loses focus
   */
  @Output()
  public blur: EventEmitter<boolean> = new EventEmitter();

  /**
   * Event emitter that will emit when the value has been cleared.
   */
  @Output()
  public empty: EventEmitter<SearchEvent> = new EventEmitter();

  /**
   * Event emitter that will emit when the left side action icon is pressed.
   * Up to the parent component on how to handle interaction.
   */
  @Output()
  public leftAction: EventEmitter<boolean> = new EventEmitter();

  /**
   * Event emitter that will emit when the right side action icon is pressed.
   * Up to the parent component on how to handle interaction.
   */
  @Output()
  public rightAction: EventEmitter<boolean> = new EventEmitter();

  // ===========================================================================

  /**
   * Input element model
   */
  public input: Subject<string> = new Subject();

  /**
   * Search query search status.
   *
   * True indicates on-going search that has yet to resolve.
   *
   * False indicates no on-going search or a search that has resolved.
   *
   * @type {Observable < boolean >}
   * @memberof SearchComponent
   */
  public searchStatus: Observable<boolean>;

  /**
   * Search results list
   */
  public searchResults: SearchResult<unknown>;

  /**
   * Resolved search status, indicates if the resolved search result includes at least one feature.
   *
   * @type {boolean}
   * @memberof SearchComponent
   */
  public searchResultStatus: boolean;

  /**
   *  Describes if search dropdown selections are visible
   */
  public searchActionsActive = false;

  /**
   * Describes if and geolocation selection is visible
   */
  public searchResultsActive: boolean = undefined;

  private _sources: SearchSource[];

  /**
   * Search service subscription, allowing unsubscription on component destroy
   */
  private _destroy$: Subject<boolean> = new Subject();

  /**
   * DOM input element reference.
   */
  @ViewChild('search', { static: true }) private searchElem: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
    private analytics: Angulartics2,
    private ns: NotificationService,
    private mapService: EsriMapService,
    private searchService: SearchService,
    private environment: EnvironmentService
  ) {
    if (this.environment.value('SearchSources')) {
      this._sources = this.environment.value('SearchSources');
    }
  }

  public ngOnInit() {
    this.searchStatus = this.searchService.searching;

    // Wait for the map service to load map and view
    this.searchService.store.subscribe((res) => {
      // Set the value of the search results used for the drop down suggestion list
      this.searchResults = res;

      // Test if any search result object contains at least one search result.
      // If there are no search result objects, it is understood that it a search service clear was invoked.
      if (res.results.length > 0) {
        this.searchResultStatus = res.results.some((result) => result.features.length > 0);
      } else {
        // Prevent the "no features found" suggestion on an emtpy search result.
        this.searchResultStatus = true;
      }

      // Force change detection here, since onPush disables it here. Reason why using onPush below component decorator.
      this.cd.markForCheck();
    });

    // RXJS operators on the input value model that limits when and how often the search service is queried.
    this.input
      .pipe(
        tap(() => {
          this.searchResultStatus = true;
        }),
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe((value) => {
        if (value && value.length > 0) {
          if (isCoordinatePair(value)) {
            this.setSelected(value, {
              name: value,
              breadcrumbs: {
                source: '',
                value: value
              }
            });
          } else {
            // Array of search source references to submit search query to.
            // const searchSourceIds = ['building', 'parking-garage', 'parking-lot', 'points-of-interest'];
            const searchSourceIds = this._sources.filter((s) => s.searchActive).map((s) => s.source);

            // Submit search service query
            this.searchService.search({ sources: searchSourceIds, values: Array(searchSourceIds.length).fill(value) });
          }

          // If the input value has changed trigger a "dirty" event
          if (value !== this.value) {
            this.dirty.emit(new SearchEvent({}));
          }
        } else {
          // Emit a cleared event
          this.empty.emit(new SearchEvent({ index: this.index }));

          // Clear the search service results
          this.searchService.clear();
        }

        if (value) {
          const label = {
            guid: guid(),
            date: Date.now(),
            value: value
          };

          // Send analytics search input
          this.analytics.eventTrack.next({
            action: 'Search',
            properties: {
              category: 'Searched Term',
              label: JSON.stringify(label),
              value: value.length
            }
          });
        }

        // Force change detection here, since onPush disables it here.
        // Reason why using onPush below component decorator.
        this.cd.markForCheck();
      });

    // If the focused property was provided and is true, focus the input element in the component
    // To make it ready for text input on devices.
    if (this.focused) {
      this.searchElem.nativeElement.focus();
    }
  }

  public ngOnDestroy(): void {
    // Dispose of any subscriptions made
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Sets focus on the search results, showing them
   *
   * @memberof SearchComponent
   */
  public setFocus(): void {
    this.searchResultsActive = true;
    this.searchActionsActive = true;

    this.focus.emit(true);
  }

  /**
   * Remove focus from the search results, hiding them
   *
   * @memberof SearchComponent
   */
  public loseFocus(): void {
    this.searchResultsActive = false;
    this.searchActionsActive = false;

    this.blur.emit(true);
  }

  /**
   * Event fired on input keyup thatthen sets the next Subject value. Also displays the search results
   *
   * @param {*} event
   * @memberof SearchComponent
   */
  public change(event: KeyboardEvent): void {
    // Some keyboard keys trigger the change event (e.g. tab).
    // Limit the execution of the process chain only if event key code is not in the not allowed list
    const keysNotAllowed = [9, 18, 16];

    // tslint:disable-next-line
    if (!keysNotAllowed.includes(event.which)) {
      const value = (<HTMLInputElement>event.target).value;
      // this.searchResultsStatus = undefined;
      this.input.next(value);
      this.setFocus();
    }
  }

  /**
   * Event fired when the user selects a search suggestion.
   *
   * Sets the input value to be the result text, and updates the Subject value to prevent stale
   * suggestions when component is focused on again.
   *
   * @param {esri.Graphic} feature
   * @memberof SearchComponent
   */
  public setSelected(feature: esri.Graphic | string, parentResult: SearchResultItem<unknown>) {
    const isString = typeof feature === 'string';
    const result = new TripPoint({
      source: 'search',
      index: this.index,
      originAttributes:
        !isString && feature ? Object.assign({}, (<esri.Graphic>feature).attributes) : Object.assign({}, { name: feature }),
      originGeometry:
        !isString && feature && (<esri.Graphic>feature).geometry
          ? {
              raw: Object.assign({}, (<esri.Graphic>feature).geometry)
            }
          : { latitude: 0, longitude: 0 },
      originParameters: {
        type: 'search',
        value: parentResult.breadcrumbs
      }
    }).normalize();

    if (feature && !isString) {
      // Set new input subject value, triggering dirty or empty events, and search through service
      // this.input.next(( < esri.Graphic > feature).attributes.BldgName);

      // Update the DOM model value
      this.value = result.attributes.name;

      // Defocus the component
      this.loseFocus();
    }

    // Emit search result object to be consumbed by parent component
    this.result.emit(result);
  }

  /**
   * Function wrapper for custom dropdown element arrow navigation.
   *
   * See child function documentation for parameter descriptions.
   *
   * @memberof SearchComponent
   */
  public keyControl(e: KeyboardEvent, action: string, target: string): void {
    arrowKeyControl(e, action, target);
  }

  /**
   * Gets current user location and populates state, handling both success and fail cases
   * (where gelocation is not available or not allowed).
   *
   * @memberof SearchComponent
   */
  public geolocate() {
    this.loseFocus();

    // Set pending geolocation view value
    this.searchElem.nativeElement.value = 'Getting your location...';

    getGeolocation()
      .then((res: Coordinates) => {
        // Set view value
        this.searchElem.nativeElement.value = 'Current Location';

        // Emit search result object to be consumbed by parent component
        this.result.emit(
          new TripPoint({
            source: 'search-geolocation',
            index: this.index,
            originAttributes: {
              name: 'Current Location'
            },
            originGeometry: Object.assign({}, { latitude: res.latitude, longitude: res.longitude }),
            originParameters: {
              type: 'search-geolocation',
              value: {
                latitude: res.latitude,
                longitude: res.longitude
              }
            }
          })
        );

        const label = {
          guid: guid(),
          date: Date.now(),
          value: `${res.latitude}, ${res.longitude}`
        };

        // Track analytics geolocation success
        this.analytics.eventTrack.next({
          action: 'Success',
          properties: {
            category: 'Geolocation',
            label: JSON.stringify(label)
          }
        });
      })
      .catch((err) => {
        // Set view value
        const name = 'Trigon (Default)';

        this.searchElem.nativeElement.value = name;

        const defaultLatitude = 30.61458;
        const defaultLongitude = -96.33947;

        // Emit search result object to be consumbed by parent component
        this.result.emit(
          new TripPoint({
            source: 'search-geolocation',
            index: this.index,
            originAttributes: {
              name: name
            },
            originGeometry: Object.assign({}, { latitude: defaultLatitude, longitude: defaultLongitude }),
            originParameters: {
              type: 'search-geolocation',
              value: {
                latitude: defaultLatitude,
                longitude: defaultLongitude
              }
            }
          })
        );

        this.ns.toast({
          acknowledge: true,
          id: 'geolocation-failed',
          imgAltText: '',
          imgUrl: '',
          title: 'Geolocation failed',
          message:
            'Could not retrieve your current location. To use this feature, please ensure Aggie Map is allowed to use your location.'
        });

        const label = {
          guid: guid(),
          date: Date.now(),
          value: err.message
        };

        // Track analytics geolocation failure
        this.analytics.eventTrack.next({
          action: 'Failed',
          properties: {
            category: 'Geolocation',
            label: JSON.stringify(label)
          }
        });
      });
  }

  /**
   * Uses a template renderer to evaluate the display template with values from the provided feature object.
   *
   * @param {object} obj
   * @param {string} template
   * @returns
   * @memberof SearchComponent
   */
  public evaluateDisplayTemplate(obj: object, template: string) {
    return new TemplateRenderer({
      lookup: obj,
      template: template
    }).render();
  }

  /**
   * Called when the left action icon is pressed. Will emit an event so parent component can handle interaction.
   *
   * @memberof SearchComponent
   */
  public emitLeftActionEvent(): void {
    if (this.leftActionIcon) {
      this.leftAction.emit();
    }
  }

  /**
   * Called when the right action icon is pressed. Will emit an event so parent component can handle interaction.
   *
   * @memberof SearchComponent
   */
  public emitRightActionEvent(): void {
    if (this.rightActionIcon) {
      this.rightAction.emit();

      // Default action clearing the input when the right action icon is 'close'
      if (this.rightActionIcon === 'close') {
        this.value = '';
        this.input.next('');
      }
    }
  }
}

/**
 * Describes a search even on specific custom behaviours (dirty, empty, etc.)
 *
 * Used in SearchEvent class
 *
 * @interface SearchEventProperties
 */
export interface SearchEventProperties {
  /**
   * At the time of event emitted, the value of the component.
   *
   * @type {string}
   * @memberof SearchEventProperties
   */
  value?: string;

  /**
   * At the time of event emitted, the render index.
   *
   * @type {number}
   * @memberof SearchEventProperties
   */
  index?: number;

  /**
   * At the time of the event emitted, whether the component has used user geolocation to populate its state.
   *
   * @type {boolean}
   * @memberof SearchEventProperties
   */
  geolocation?: boolean;
}

/**
 * Event class emitted from the search component on specific events (dirty, empty, etc.),
 * that effectively report component state.
 *
 * @export
 * @class SearchEvent
 */
export class SearchEvent {
  public value: SearchEventProperties['value'];
  public index: SearchEventProperties['index'];
  public geolocation: SearchEventProperties['geolocation'];

  /**
   * Creates an instance of SearchEvent.
   *
   * Event class emitted from the search component on specific events (dirty, empty, etc.),
   * that effectively report component state.
   *
   * @param {SearchEventProperties} props
   * @memberof SearchEvent
   */
  constructor(props: SearchEventProperties) {
    this.value = props.value || undefined;
    this.index = props.index || 0;
    this.geolocation = props.geolocation || undefined;
  }
}
