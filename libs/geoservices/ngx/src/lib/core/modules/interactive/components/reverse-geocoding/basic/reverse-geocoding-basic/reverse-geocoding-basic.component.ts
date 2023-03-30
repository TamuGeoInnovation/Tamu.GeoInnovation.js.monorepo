import { style, transition, trigger, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, pipe, Subject, merge } from 'rxjs';
import { map, catchError, shareReplay, startWith, switchMap, delay, tap, filter, take } from 'rxjs/operators';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss'],
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
export class ReverseGeocodingBasicComponent implements OnInit {
  public states = STATES_TITLECASE;
  public form: FormGroup;

  public querySubmit: Subject<'query'> = new Subject();
  public processing: Observable<boolean>;
  public buttonLanguage: Observable<string>;

  public result: Observable<any>;
  public reset: Subject<'reset'> = new Subject();
  public mapConfig: Observable<MapConfig>;

  constructor(private readonly fb: FormBuilder, private readonly ms: EsriMapService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      lat: [null, Validators.required],
      lon: [null, Validators.required],
      state: [null]
    });

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

    this.mapConfig = this.result.pipe(
      filter((res) => res !== null),
      this.getBaseMapConfig(),
      shareReplay()
    );
  }

  public processInteractiveQuery() {
    this.querySubmit.next('query');
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

  public getBaseMapConfig() {
    return pipe(
      map(() => {
        const form = this.form.getRawValue();
        const center = [form.lon, form.lat];

        return {
          basemap: {
            basemap: 'streets-navigation-vector'
          },
          view: {
            mode: '2d',
            properties: {
              center,
              zoom: 12
            }
          }
        } as MapConfig;
      }),
      tap((r) => {
        this.ms.store.pipe(take(1)).subscribe(() => {
          const form = this.form.getRawValue();

          this.ms.loadLayers([
            {
              type: 'graphics',
              id: 'geoprocess-result',
              title: 'Geoprocessing Result',
              native: {
                graphics: [
                  {
                    attributes: { lat: form.lat, lon: form.lon },
                    geometry: {
                      type: 'point',
                      latitude: form.lat,
                      longitude: form.lon
                    } as esri.PointProperties,
                    symbol: {
                      type: 'simple-marker',
                      color: [255, 0, 0],
                      size: '12px',
                      outline: {
                        color: [255, 255, 255],
                        width: 2
                      }
                    } as esri.SimpleMarkerSymbolProperties
                  }
                ]
              },
              visible: true,
              popupTemplate: {
                title: 'Geoprocessing Result',
                content: 'Lat: {lat}, Lon: {lon}'
              }
            }
          ]);
        });
      })
    );
  }

  public clearResult() {
    this.reset.next('reset');
  }
}
