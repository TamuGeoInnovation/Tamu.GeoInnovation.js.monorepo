import { Component, OnInit } from '@angular/core';
import { style, transition, trigger, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  merge,
  Observable,
  of,
  Subject,
  catchError,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  ReplaySubject,
  combineLatest
} from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { AuthService } from '@tamu-gisc/geoservices/data-access';
import { GeoservicesError } from '@tamu-gisc/geoprocessing-core';

@Component({
  selector: 'tamu-gisc-base-interactive-geoprocessing',
  template: '',
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-1rem)', opacity: 0 }),
        animate('.3s ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),

      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('.25s ease-out', style({ transform: 'translateX(2.5rem)', opacity: 0, height: 0 }))
      ])
    ])
  ]
})
export abstract class BaseInteractiveGeoprocessingComponent<ResultType, ParamType> implements OnInit {
  public form: FormGroup;
  public result: Observable<ResultType>;

  /**
   * Checks if the emitted result value is an error object.
   * This will reduce the required template logic for handling errors.
   */
  public resultError: Observable<boolean>;

  public querySubmit: Subject<'query'> = new Subject();
  public processing: Observable<boolean>;
  public buttonLanguage: Observable<string>;

  public reset: Subject<'reset'> = new Subject();
  public mapPoints: Observable<Array<ILatLonPair>>;

  public componentMode: ReplaySubject<ComponentMode> = new ReplaySubject();
  public isAdvanced: Observable<boolean> = this.componentMode.pipe(
    map((mode) => {
      return mode === ComponentMode.Advanced;
    }),
    shareReplay()
  );

  /**
   * The URL to redirect to view the full response/component
   */
  public redirectUrl = './interactive/';

  private _localStorePrimaryKey = 'geoservices';
  private _localStoreSubKey = 'interactive-cache';
  private _localModeSubKey = 'mode';
  private _cacheResult: ReplaySubject<ResultType> = new ReplaySubject(1);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly localStore: LocalStoreService,
    private readonly authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.form = this.buildForm();

    this.result = merge(this.querySubmit, this.reset, this._cacheResult).pipe(
      switchMap((action) => {
        if (action === 'reset') {
          return of(null);
        } else {
          // If action is an object, it's a cached value
          if (typeof action === 'object') {
            return of(action) as Observable<ResultType>;
          } else {
            // Reset any outstanding result with null.
            return of(true).pipe(
              this.getQuery(),
              startWith(null),
              catchError((err) => {
                return of(err);
              })
            );
          }
        }
      }),
      shareReplay()
    );

    this.resultError = this.result.pipe(
      map((res) => {
        if (res instanceof GeoservicesError) {
          return true;
        }

        return false;
      }),
      shareReplay()
    );

    this.processing = this.querySubmit.pipe(
      switchMap(() => {
        return this.result.pipe(
          // Once the query has resolved, set processing state to false.
          map((v) => {
            // If the result is a rate limit error, prevent the user from submitting another query.
            if (v instanceof Error) {
              return true;
            }

            // If the result is null, it's the startWith value from result. That signifies that the query is processing.
            // If the result is not null, the query has resolved and the processing state should be false.
            return v === null ? true : false;
          }),
          // If the query errors, set processing state to false. Allow the user to submit another query.
          catchError(() => {
            return of(false);
          })
        );
      }),
      // Set initial processing state to false. This is the value used before any queries are submitted.
      startWith(false)
    );

    // Set the button language based on the processing state and result.
    // Initialize both processing and result as null to prevent the button from displaying a value before
    // the user has submitted a query.
    //
    // If the result is an error, display the error message.
    this.buttonLanguage = combineLatest([this.processing.pipe(startWith(null)), this.result.pipe(startWith(null))]).pipe(
      map(([processing, res]) => {
        const resIsError = res instanceof GeoservicesError;

        // Even if processing is true, if the result is an error, we want to display an error message.
        if (typeof processing === 'boolean' && resIsError === false) {
          return processing ? 'Processing...' : 'Solve';
        }

        // This block will be reached when the result is an error, regardless of the processing state.
        if (res instanceof GeoservicesError) {
          if (res.statusCode === 402) {
            return 'Rate limit exceeded. Please try again later or log in.';
          }

          return `Error. Please try again later.`;
        }

        // Default button language
        return 'Solve';
      }),
      catchError(() => {
        return of('Error. Please try again.');
      })
    );

    this.mapPoints = this.result.pipe(
      filter((res) => res !== null),
      this.getMapPoints(),
      shareReplay()
    );

    this._applyLocalStoreCache();
    this._applyLocalStoreComponentMode();
  }

  public processInteractiveQuery() {
    this.querySubmit.next('query');
  }

  public clearResult() {
    this.reset.next('reset');
  }

  /**
   * Navigates to the advanced view of the interactive component, caching
   * the result and form values in local storage if provided.
   *
   * This is used when transitioning from basic to advanced mode when a result has already been generated.
   */
  public navigateToAdvanced(cache?: ResultType) {
    if (cache) {
      this._cache = {
        form: this.form.getRawValue(),
        result: cache
      };
    }

    this.router.navigate([this.redirectUrl], { relativeTo: this.route });
  }

  public toggleMode(mode: ComponentMode) {
    // Get mode from local storage
    const localMode = this._getLocalToggleMode();

    if (localMode !== mode) {
      this.componentMode.next(mode);

      // Set mode in local storage
      this.localStore.setStorageObjectKeyValue({
        primaryKey: this._localStorePrimaryKey,
        subKey: this._localModeSubKey,
        value: mode
      });
    }
  }

  private _getLocalToggleMode(): ComponentMode {
    return this.localStore.getStorageObjectKeyValue({
      primaryKey: this._localStorePrimaryKey,
      subKey: this._localModeSubKey
    });
  }

  /**
   * Applies the cached form and result from local storage.
   *
   * This is used when transitioning from basic to advanced mode when a result has already been generated.
   */
  private _applyLocalStoreCache() {
    const store = this._cache;

    if (store && store !== null) {
      this.form.patchValue(store.form);
      this._cacheResult.next(store.result);

      // Immediately after clear the local cache to prevent the form from being populated on subsequent visits
      // or other interactive components that don't share the same model.
      this._clearLocalStoreCache();
    }
  }

  /**
   * If the user has toggled the component mode toggle, restore it. Otherwise, set default to basic.
   */
  private _applyLocalStoreComponentMode() {
    const mode = this._getLocalToggleMode();

    if (mode) {
      this.componentMode.next(mode);
    } else {
      this.componentMode.next(ComponentMode.Basic);
    }
  }

  /**
   * Wipe the local interactive cache.
   */
  private _clearLocalStoreCache() {
    const store = this._cache;

    if (store !== null) {
      this._cache = null;
    }
  }

  /**
   * Returns the cached form and result from local storage.
   */
  private get _cache(): { form; result } {
    return this.localStore.getStorageObjectKeyValue({
      primaryKey: this._localStorePrimaryKey,
      subKey: this._localStoreSubKey
    });
  }

  /**
   * Returns the cached form and result from local storage.
   */
  private set _cache(c: { form; result } | null) {
    this.localStore.setStorageObjectKeyValue({
      primaryKey: this._localStorePrimaryKey,
      subKey: this._localStoreSubKey,
      value: c
    });
  }

  public abstract buildForm(): FormGroup;

  public abstract getQuery(): (source: unknown) => Observable<ResultType>;

  public abstract getMapPoints(): (source: unknown) => Observable<Array<ILatLonPair>>;

  public abstract getQueryParameters(): ParamType;
}

export interface ILatLonPair {
  latitude: number;
  longitude: number;
}

export enum ComponentMode {
  Basic = 'simple',
  Advanced = 'advanced'
}

export enum ComponentModeLabel {
  Basic = 'Basic',
  Advanced = 'Advanced'
}
