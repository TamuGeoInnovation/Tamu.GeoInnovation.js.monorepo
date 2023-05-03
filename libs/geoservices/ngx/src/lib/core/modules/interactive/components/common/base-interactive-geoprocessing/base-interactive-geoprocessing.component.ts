import { Component, OnInit } from '@angular/core';
import { style, transition, trigger, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { merge, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.form = this.buildForm();

    this.result = merge(this.querySubmit, this.reset).pipe(
      switchMap((action) => {
        if (action === 'reset') {
          return of(null);
        } else {
          // Reset any outstanding result with null.
          return of(true).pipe(this.getQuery(), startWith(null));
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
  }

  public processInteractiveQuery() {
    this.querySubmit.next('query');
  }

  public clearResult() {
    this.reset.next('reset');
  }

  public navigateToAdvanced() {
    this.router.navigate([this.redirectUrl], { relativeTo: this.route });
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
