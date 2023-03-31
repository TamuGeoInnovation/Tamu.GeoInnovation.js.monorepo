import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, pipe } from 'rxjs';
import { map, switchMap, delay, tap, take } from 'rxjs/operators';

import { ReverseGeocodeResult } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss']
})
export class ReverseGeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<ReverseGeocodeResult> {
  public states = STATES_TITLECASE;

  constructor(private fb: FormBuilder, private ms: EsriMapService) {
    super(fb, ms);
  }

  public buildForm(): FormGroup {
    return this.fb.group({
      lat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      lon: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      state: [null]
    });
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
        } as ReverseGeocodeResult).pipe(delay(1500));

        // const fv = this.form.getRawValue();
        //
        // return new ReverseGeocode({
        //   apiKey: 'demo',
        //   latitude: fv.lat,
        //   longitude: fv.lon,
        //   state: fv.state || undefined
        // }).asObservable();
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
}
