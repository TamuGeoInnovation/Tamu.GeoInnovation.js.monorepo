import { IGeocodingOptions, ValueTransformer, MappedTransformers } from './types';

export abstract class APIBuilder<T extends MappedTransformers<unknown>, U extends object> {
  private _options: object;
  public settings: T;
  public queryString: string;

  constructor(options: U) {
    if (options === undefined) {
      throw new Error('No API options for Geocoder were provided.');
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
        return !Boolean(this.settings[setting].excludeParams);
      })
      .map((key, index) => {
        return `${key}=${this.settings[key].value}`;
      })
      .join('&');
  }

  /**
   *
   */
  private calculateDefaults() {
    Object.entries(this.settings).forEach(([key, entry]: [string, ValueTransformer<unknown>]) => {
      if (entry.fn) {
        if (entry.target !== undefined) {
          // Generate a list of params from target(s)
          const params =
            entry.target instanceof Array
              ? entry.target.map((k) => this.settings[k].value)
              : [this.settings[entry.target].value];

          entry.fn(...params);
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
