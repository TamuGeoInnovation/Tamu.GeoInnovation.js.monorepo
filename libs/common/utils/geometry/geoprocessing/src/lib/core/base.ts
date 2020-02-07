import { Observable, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap } from 'rxjs/operators';

import { GeoservicesError } from './errors';

import { Transformer, TransformersMap, ICallBack } from './types';

export class ApiBase<T extends TransformersMap<unknown>, U extends object, Res> {
  private _options: object;
  public settings: T & { serviceUrl: Transformer<string, T>; format: Transformer<string, T> };
  public queryString: string;

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
    this.patchDefaults();

    // Determine default values based on inputs
    this.calculateDefaults();

    // Generate the geocode query string based on patched defaults and calculated defaults.
    this.queryString = Object.keys(this.settings)
      .filter((setting) => {
        // Filter out any setting transformer entries that explicity define exclusion
        // for building the query string.
        return !Boolean(this.settings[setting].excludeParams) && this.settings[setting].value !== undefined;
      })
      .map((key, index) => {
        return `${key}=${this.settings[key].value}`;
      })
      .join('&');
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
  public execute(promiseOrCallback?: false): Observable<Res>;
  public execute(promiseOrCallback?: true): Promise<Res>;
  public execute(promiseOrCallback?: ICallBack<Res>): void;
  public execute(promiseOrCallback?: undefined | boolean | ICallBack<Res>): Observable<Res> | Promise<Res> | void {
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
      return (request as unknown) as Observable<Res>;
    }

    if (typeof promiseOrCallback === 'boolean' && promiseOrCallback === true) {
      return (request.toPromise() as unknown) as Promise<Res>;
    }

    if (promiseOrCallback instanceof Object) {
      request.subscribe(
        (res) => {
          promiseOrCallback(undefined, (res as unknown) as Res);
        },
        (err) => {
          promiseOrCallback(err, undefined);
        }
      );
    }
  }

  /**
   *
   */
  private calculateDefaults() {
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
  private patchDefaults() {
    Object.entries(this._options).forEach(([key, value]) => {
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
}
