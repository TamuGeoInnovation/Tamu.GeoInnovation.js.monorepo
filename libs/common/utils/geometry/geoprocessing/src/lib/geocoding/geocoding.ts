import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

import { APIBuilder } from '../core/builder';
import { GeoservicesError } from '../core/errors';

import {
  GeocodeResult,
  ICallBack,
  IGeocodingOptions,
  IGeocodeApiFourDotZeroOneOptions,
  MappedTransformers
} from '../core/types';

export class Geocoder extends APIBuilder<GeocodingTransformers, IGeocodingOptions> {
  constructor(options: IGeocodingOptions) {
    super(options);

    this.settings = {
      version: {
        value: 4.01
      },
      format: {
        value: 'json'
      },
      parsed: {
        value: false,
        excludeParams: true
      },
      urlVersion: {
        value: '',
        excludeParams: true,
        target: 'version',
        fn: function(v: number) {
          this.value = `_V0${v.toString().replace('.', '_')}`;
        }
      },
      serviceType: {
        value: 'GeocoderWebServiceHttpNonParsed',
        excludeParams: true,
        target: 'parsed',
        fn: function(parsed) {
          if (parsed) {
            this.value = `GeocoderService`;
          }
        }
      },
      responseFormat: {
        value: 'json',
        excludeParams: true,
        target: 'format',
        fn: function(f) {
          if (f === 'tsv' || f === 'csv') {
            this.value = 'text';
          }
        }
      },
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/Geocode/WebService/',
        excludeParams: true,
        target: ['urlVersion', 'serviceType', 'parsed'],
        fn: function(version, type, parsed) {
          this.value = `${this.value}${type}${version}${parsed ? '.asmx' : '.aspx'}?`;
        }
      }
    };

    super.setup();
  }

  /**
   * Geocode an address.
   *
   * Can return response in various the types:
   *
   *  - Observable: No method overload
   *  - Promise: `true` for method overload
   *  - Callback: Callback function for method overload
   *
   *  Defaults to Observable.
   */
  public geocode(promiseOrCallback?: false): Observable<GeocodeResult>;
  public geocode(promiseOrCallback?: true): Promise<GeocodeResult>;
  public geocode(promiseOrCallback?: ICallBack<GeocodeResult>): void;
  public geocode(
    promiseOrCallback?: undefined | boolean | ICallBack<GeocodeResult>
  ): Observable<GeocodeResult> | Promise<GeocodeResult> | void {
    const request = ajax({
      url: this.settings.serviceUrl.value + this.queryString,
      method: 'GET',
      responseType: this.settings.format.value
    }).pipe(
      switchMap((response) => {
        if (
          (response.response && response.response.QueryStatusCodeValue === '200') ||
          (typeof response.response === 'string' && response.response.length > 0) ||
          (response.response instanceof XMLDocument &&
            response.response.getElementsByTagName('QueryStatusCodeValue')[0].textContent === '200')
        ) {
          return of(response.response);
        } else {
          return new GeoservicesError(response.response).throw();
        }
      })
    );

    if (promiseOrCallback === undefined || (typeof promiseOrCallback === 'boolean' && promiseOrCallback === false)) {
      return (request as unknown) as Observable<GeocodeResult>;
    }

    if (typeof promiseOrCallback === 'boolean' && promiseOrCallback === true) {
      return (request.toPromise() as unknown) as Promise<GeocodeResult>;
    }

    if (promiseOrCallback instanceof Object) {
      request.subscribe(
        (res) => {
          promiseOrCallback(undefined, (res as unknown) as GeocodeResult);
        },
        (err) => {
          promiseOrCallback(err, undefined);
        }
      );
    }
  }
}

/**
 * Internal class settings used to generate geocoding-specific defaults/values.
 */
interface IGeocodingSettings {
  urlVersion?: string;
  serviceType?: string;
  responseFormat?: string;
  serviceUrl?: string;
}

interface GeocodingTransformers
  extends MappedTransformers<IGeocodeApiFourDotZeroOneOptions>,
    MappedTransformers<IGeocodingSettings> {}
