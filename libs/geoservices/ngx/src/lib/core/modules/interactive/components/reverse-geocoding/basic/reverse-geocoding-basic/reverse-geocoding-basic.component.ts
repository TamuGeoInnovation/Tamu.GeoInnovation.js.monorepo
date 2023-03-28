import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, pipe, Subject, merge } from 'rxjs';
import { map, catchError, shareReplay, startWith, switchMap, delay, timeout, mapTo } from 'rxjs/operators';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss']
})
export class ReverseGeocodingBasicComponent implements OnInit {
  public states = STATES_TITLECASE;
  public form: FormGroup;

  public querySubmit: Subject<null> = new Subject();
  public processing: Observable<boolean>;
  public buttonLanguage: Observable<string>;

  public result: Observable<any>;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      lat: [null, Validators.required],
      lon: [null, Validators.required],
      state: [null]
    });

    this.result = this.querySubmit.pipe(this.getQuery(), shareReplay());

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
  }

  public processInteractiveQuery() {
    this.querySubmit.next(null);
  }

  public getQuery() {
    return pipe(
      switchMap(() => {
        return of({
          statusCode: 200,
          message: 'Success',
          error: '',
          data: {
            version: {
              major: 5,
              minor: 0,
              build: 0,
              revision: -1,
              majorRevision: -1,
              minorRevision: -1
            },
            timeTaken: 171.88160000000002,
            transactionGuid: '31405f77-a6c9-444a-82dc-22ef1eee86d7',
            apiHost: 'geoservices.tamu.edu',
            clientHost: 'geoservices.tamu.edu',
            queryStatusCode: 'Success',
            results: [
              {
                timeTaken: 0,
                exceptionOccurred: false,
                errorMessage: '',
                apn: '4342011022',
                streetAddress: '9309 Burton Way',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90209',
                zipPlus4: '3605'
              }
            ]
          }
        }).pipe(delay(1500));

        const fv = this.form.getRawValue();

        // return new ReverseGeocode({
        //   apiKey: 'demo',
        //   latitude: fv.lat,
        //   longitude: fv.lon,
        //   state: fv.state || undefined
        // }).asObservable();
      }),
      catchError((e) => {
        return of(e);
      })
    );
  }
}
