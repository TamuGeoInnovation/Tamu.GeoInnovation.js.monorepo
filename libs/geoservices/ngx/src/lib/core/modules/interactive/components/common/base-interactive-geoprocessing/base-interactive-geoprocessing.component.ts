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
  ReplaySubject
} from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

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

  public querySubmit: Subject<'query'> = new Subject();
  public processing: Observable<boolean>;
  public buttonLanguage: Observable<string>;

  public reset: Subject<'reset'> = new Subject();
  public mapPoints: Observable<Array<ILatLonPair>>;

  /**
   * The URL to redirect to view the full response/component
   */
  public redirectUrl = './interactive/';

  private _localStorePrimaryKey = 'geoservices';
  private _localStoreSubKey = 'interactive-cache';
  private _cacheResult: ReplaySubject<ResultType> = new ReplaySubject(1);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly localStore: LocalStoreService
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
            return of(true).pipe(this.getQuery(), startWith(null));
          }
        }
      }),
      shareReplay()
    );

    this.processing = this.querySubmit.pipe(
      switchMap(() => {
        return of(true).pipe(
          this.getQuery(),
          // Once the query has resolved, set processing state to false.
          map(() => {
            return false;
          }),
          // If the query errors, set processing state to false.
          catchError(() => of(false)),
          // Set initial processing state to true while waiting for resolution of the query.
          startWith(true)
        );
      }),
      // Set initial processing state to false. This is the value used before any queries are submitted.
      startWith(false),
      // This stream is used by the template and other subscribers in the component. We want to ensure that the stream
      // is shared and replayed so that the value is not re-emitted on each subscription.
      shareReplay()
    );

    this.buttonLanguage = merge(this.processing, this.result).pipe(
      map((processing) => {
        if (typeof processing === 'boolean') {
          return processing ? 'Processing...' : 'Solve';
        } else {
          return 'Solve';
        }
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

  /**
   * Applies the cached form and result from local storage.
   *
   * This is used when transitioning from basic to advanced mode when a result has already been generated.
   */
  private _applyLocalStoreCache() {
    const store = this._cache;

    if (store !== null) {
      this.form.patchValue(store.form);
      this._cacheResult.next(store.result);

      // Immediately after clear the local cache to prevent the form from being populated on subsequent visits
      // or other interactive components that don't share the same model.
      this._clearLocalStoreCache();
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
