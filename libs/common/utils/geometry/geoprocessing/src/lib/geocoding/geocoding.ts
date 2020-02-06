import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

export class Geocoder {
  private _settings: GeocodingDefaultTransformers = {
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

  private _queryString: string;

  constructor(options: IGeocodeOptions) {
    if (options === undefined || options.apiOptions === undefined) {
      throw new Error('No API options for Geocoder were provided.');
    }
    // Merge the provided options into the settings model.
    this.patchDefaults({ ...options.apiOptions });

    // Determine default values based on inputs
    this.calculateDefaults();

    // Generate the geocode query string based on patched defaults and calculated defaults.
    this._queryString = Object.keys(this._settings)
      .filter((setting) => {
        // Filter out any setting transformer entries that explicity define exclusion
        // for building the query string.
        return !Boolean(this._settings[setting].excludeParams);
      })
      .map((key, index) => {
        return `${key}=${this._settings[key].value}`;
      })
      .join('&');
  }

  /**
   *
   */
  private calculateDefaults() {
    Object.entries(this._settings).forEach(([key, entry]) => {
      if (entry.fn) {
        if (entry.target !== undefined) {
          // Generate a list of params from target(s)
          const params =
            entry.target instanceof Array
              ? entry.target.map((k) => this._settings[k].value)
              : [this._settings[entry.target].value];

          entry.fn(...params);
        }
      }
    });
  }

  /**
   * Updates the default settings value with the provided value if it exists,
   * else it creates an entry in the settings model.
   */
  private patchDefaults(options) {
    Object.entries(options).forEach(([key, value]) => {
      // If the default value transformer exists, patch its value with that of the
      // entry key.
      if (this._settings[key]) {
        this._settings[key].value = value;
      } else {
        // If the default value transformer does not exist, make a new entry
        this._settings[key] = {
          value: value
        };
      }
    });
  }

  /**
   * Geocode an address.
   */
  public geocode() {
    return ajax({
      url: this._settings.serviceUrl.value + this._queryString,
      method: 'GET',
      responseType: this._settings.format.value
    }).pipe(
      map((response) => {
        return response.response;
      })
    );
  }
}

export interface IGeocodeOptions {
  requestOptions?: IGeocodeRequestOptions;
  apiOptions: IGeocodingOptions;
}

enum GEOPROCESSING_RESULT {
  OBSERVABLE = 'observable',
  PROMISE = 'promise',
  CALLBACK = 'callback'
}
export interface IGeocodeRequestOptions {
  returnAs?: 'observable' | 'promise' | 'callback';
}

export interface IGeocodeApiThreeDotZeroOneOptions {
  version: 3.01;
  apiKey: string;
  parsed?: boolean;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: number;
  census?: boolean;
  includeHeader?: boolean;
  notStore?: boolean;
}

export interface IGeocodeApiFourDotZeroOneOptions extends Omit<IGeocodeApiThreeDotZeroOneOptions, 'version'> {
  version: 4.01;
  tieBreakingStrategy?: 'flipACoin' | 'revertToHierarchy';
  censusYear?: Array<'1990' | '2000' | '2010' | 'allAvailable'>;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
}

interface ISettings {
  urlVersion?: string;
  serviceType?: string;
  responseFormat?: string;
  serviceUrl?: string;
}

type IGeocodingOptions = IGeocodeApiThreeDotZeroOneOptions | IGeocodeApiFourDotZeroOneOptions;

type DefaultOptions = {
  [P in keyof IGeocodeApiFourDotZeroOneOptions]?: DefaultTransformer<IGeocodeApiFourDotZeroOneOptions[P]>;
};

type ClassDefaults<U> = {
  [P in keyof U]: DefaultTransformer<U[P]>;
};

interface GeocodingDefaultTransformers extends DefaultOptions, ClassDefaults<ISettings> {}

interface DefaultTransformer<U> {
  value: U;
  excludeParams?: boolean;
  target?: string | string[];
  fn?: (...args) => void;
}
