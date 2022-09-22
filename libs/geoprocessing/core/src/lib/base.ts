import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import axios, { AxiosPromise, ResponseType } from 'axios';

import { GeoservicesError } from './errors';

import { Transformer, TransformersMap, CallBack, ApiResponseFormat } from './types';

export abstract class ApiBase<T extends TransformersMap<unknown>, U extends object, Res> {
  private _options: object;
  public settings: T & { serviceUrl: Transformer<string, T>; format: Transformer<string, T> };

  public abstract responseType: ApiResponseFormat;

  constructor(options: U) {
    if (options === undefined) {
      throw new Error('No API options were provided.');
    } else {
      this._options = { ...options };
    }
  }

  /**
   * Call after the class has been initialized and the default settings have been set.
   *
   * If executed before default settings are set, settings will be overwritten by defaults.
   */
  public setup() {
    // Merge the provided options into the settings model.
    this.patchOptions(this._options);

    // Determine default values based on inputs
    this.calculateDefaults();
  }

  private get _request() {
    return (
      axios({
        method: 'GET',
        url: this.settings.serviceUrl.value,
        responseType: this.settings.format.value as ResponseType,
        params: this.getUrlOptions()
      }) as AxiosPromise<Res>
    ).then((d) => d.data);
  }

  public asPromise(): Promise<Res> {
    return this._request;
  }

  public asObservable(): Observable<Res> {
    return of(null).pipe(
      switchMap(() => {
        return from(this._request).pipe(
          switchMap((response) => {
            return this.handleResponse(response);
          })
        );
      })
    );
  }

  public asCallback(callbackFn: CallBack<Res>) {
    this._request.then((data) => callbackFn(null, data)).catch((err) => callbackFn(err, null));
  }

  /**
   * Returns the service endpoint
   */
  public getServiceUrl() {
    return this.settings.serviceUrl.value;
  }

  /**
   * Get list of service options based on the conditions that the property values are not:
   *
   * - null
   * - undefined
   * - marked as excluded
   */
  public getUrlOptions(): { [key: string]: string | number | boolean } {
    // Generate the geocode query string based on patched defaults and calculated defaults.
    return Object.keys(this.settings)
      .filter((setting) => {
        // Filter out any setting transformer entries that explicity define exclusion
        // for building the query string.
        return (
          (this.settings[setting].excludeParams === undefined || this.settings[setting].excludeParams === false) &&
          this.settings[setting].value !== undefined
        );
      })
      .reduce((acc, key) => {
        acc[key] = this.settings[key].value;

        return acc;
      }, {});
  }

  /**
   *
   */
  private calculateDefaults() {
    // `key` is unused but is a necessary assignment because of the returned value from `Object.entires`
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(this.settings).forEach(([key, entry]: [string, Transformer<unknown, never>]) => {
      if (entry.fn) {
        // Get target values
        if (entry.target !== undefined) {
          // Generate a list of params from target(s)
          const params =
            entry.target instanceof Array
              ? entry.target.map((k) => (this.settings[k] ? this.settings[k].value : undefined))
              : [this.settings[entry.target].value];

          entry.fn(...params);
        } else {
          // No target values to get
          entry.fn();
        }
      }
    });
  }

  /**
   * Updates the default settings value with the provided value if it exists,
   * else it creates an entry in the settings model.
   */
  public patchOptions(options?: object) {
    Object.entries(options).forEach(([key, value]) => {
      // If the default value transformer exists, patch its value with that of the
      // entry key.
      if (this.settings[key]) {
        this.settings[key].value = value;
      } else {
        // If the default value transformer does not exist, make a new entry
        this.settings[key] = {
          value: value
        };
      }
    });
  }

  // `response` is of type `any` because the API versions handled by this library do not return
  // consistent responses
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleResponse(response): Observable<Res> {
    if (this.responseType === ApiResponseFormat.Text) {
      if (
        (response.response && response.response.QueryStatusCode === 'Success') ||
        (typeof response.response === 'string' && response.response.length > 0) ||
        (response.response instanceof XMLDocument &&
          response.response.getElementsByTagName('QueryStatusCodeValue')[0].textContent === '200')
      ) {
        return of(response.response);
      } else {
        return new GeoservicesError<Res>(response.response).throw();
      }
    } else if (this.responseType === ApiResponseFormat.Code) {
      if (
        response.statusCode === 200 ||
        (typeof response.response === 'string' && response.response.length > 0) ||
        (response.response instanceof XMLDocument &&
          response.response.getElementsByTagName('QueryStatusCodeValue')[0].textContent === '200')
      ) {
        return of(response);
      } else {
        return new GeoservicesError<Res>(response.statusCode).throw();
      }
    }
  }
}
