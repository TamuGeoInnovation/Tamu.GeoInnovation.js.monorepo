import { Observable, of, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import axios, { AxiosError, AxiosPromise, ResponseType } from 'axios';

import { Transformer, TransformersMap, CallBack, ApiResponseFormat } from './types';
import { GeoservicesError } from './errors';
import { getXmlStatusCode } from './utils';

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
  private get _request() {
    return (
      axios({
        method: 'GET',
        url: this.settings.serviceUrl.value,
        responseType: this.xhrResponseType,
        params: this.getUrlOptions()
      }) as AxiosPromise<Res>
    ).catch(this.handleResponse);
  }

  /**
   * Supported service response types don't match up with Axio's response types
   * so this will return the correct response type defaulting to `json`;
   */
  private get xhrResponseType(): ResponseType {
    const f = this.settings.format.value;

    if (f === 'csv' || f === 'tsv') {
      return 'text';
    } else if (f === 'xml') {
      return 'document';
    } else {
      return 'json';
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

  public asPromise(): Promise<Res> {
    return this._request.then(this.handleResponse);
  }

  public asObservable(): Observable<Res> {
    return of(null).pipe(
      switchMap(() => {
        return from(this._request).pipe(
          map((response) => {
            return this.handleResponse(response);
          })
        );
      })
    );
  }

  public asCallback(callbackFn: CallBack<Res>) {
    this.asPromise()
      .then((data) => callbackFn(null, data as Res))
      .catch((err) => callbackFn(err, null));
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

  private handleResponse(response): Res {
    // Handle native errors
    if (response instanceof AxiosError) {
      throw new GeoservicesError(response);
    }

    // Handles JSON response type non-error responses
    else if (response.data.statusCode === 200) {
      return response.data;
    }

    // Handle CSV/TSV (text) response type non-error responses
    else if (
      response.config.responseType === 'text' &&
      typeof response.data === 'string' &&
      (response.data as string).length > 0
    ) {
      return response.data;
    }

    // Handle XML string non-error responses (node)
    else if (response.config.responseType === 'document' && typeof response.data === 'string') {
      const xmlStatusCode = getXmlStatusCode(response.data);

      if (xmlStatusCode === 200) {
        return response.data;
      }
    }

    // Handle XML document non-error responses (browser)
    else if (response.config.responseType === 'document' && window !== undefined) {
      const serializedDocument = new XMLSerializer().serializeToString(response.data);
      const xmlStatusCode = getXmlStatusCode(serializedDocument);

      if (xmlStatusCode === 200) {
        return serializedDocument as unknown as Res;
      }
    }

    // Default when unhandled response condition met
    throw new GeoservicesError(response);
  }
}
