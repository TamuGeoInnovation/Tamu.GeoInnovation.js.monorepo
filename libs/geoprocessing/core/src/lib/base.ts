import { Observable, of, from, map, switchMap } from 'rxjs';

import axios, { AxiosError, AxiosPromise, ResponseType } from 'axios';

import { Transformer, TransformersMap, CallBack, ApiResponseType } from './types';
import { GeoservicesError } from './errors';
import { getXmlStatusCode } from './utils';

export abstract class ApiBase<T extends TransformersMap<unknown>, U extends object, Res> {
  private _options: U;
  public settings: T & {
    serviceHost: Transformer<string, T>;
    servicePath: Transformer<string, T>;
    format: Transformer<string, T>;
  };

  public abstract responseType: ApiResponseType;

  constructor(options: U) {
    if (options === undefined) {
      throw new Error('No API options were provided.');
    } else {
      this._options = { ...options };
    }
  }
  private get _request() {
    const params = this.getUrlOptions();

    return (
      axios({
        method: 'GET',
        url: this.getServiceUrl(),
        responseType: this.xhrResponseType,
        params: params
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
    // Merge default and incoming values for settings. These will be target args for transformers.
    const options = this.patchOptions(this._options);

    // Perform any necessary calculations on the settings model.
    this.calculateValues(options);
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
    return `${this.settings.serviceHost.value}${this.settings.servicePath.value}`;
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
   * Calculate values for settings that require transformation.
   *
   * Each setting with a `fn` function will be executed with the target values as arguments. It is up to
   * the function to determine how to handle the setting value.
   */
  private calculateValues(options: U) {
    Object.entries(this.settings).forEach(([key, entry]: [string, Transformer<unknown, never>]) => {
      if (entry.fn) {
        // Get target values. These are values that refer to another setting used in the setting's decision making logic.
        if (entry.target !== undefined) {
          // Generate a list of params from target(s)
          const params =
            entry.target instanceof Array
              ? // Send all values including nulls. `undefined` is the only value that signifies whether a setting
                // is applied to the url parameters
                entry.target.map((k) => (options[k] !== undefined ? options[k] : undefined))
              : [options[entry.target]];

          entry.fn(options[key], ...params);
        } else {
          // No target values to get, execute the function with the incoming option value.
          entry.fn(options[key]);
        }
      }
    });
  }

  /**
   * For parameters that are not defined in the default settings, patch them in.
   *
   * This is necessary because URL parameters are inferred from the settings model.
   */
  public patchOptions(options: U) {
    // Simple key-value object of settings. Settings not defined in the default will
    // be added to this object. Settings that are defined in the default will be updated
    // with the value of the incoming options.
    const simpleSettings = Object.keys(this.settings).reduce((acc, key) => {
      acc[key] = this.settings[key].value;

      return acc;
    }, {} as U);

    // Side-effect: For any option that does not have an setting entry, add it to the settings model.
    Object.keys(options).forEach((key) => {
      if (this.settings[key] === undefined) {
        this.settings[key] = {
          value: options[key]
        };
      }
    });

    return { ...simpleSettings, ...options };
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
