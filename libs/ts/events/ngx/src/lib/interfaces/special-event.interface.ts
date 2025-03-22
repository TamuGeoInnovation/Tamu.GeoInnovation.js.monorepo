export interface EventConfiguration {
  /**
   * Unique identifier for the event. This is partially used to store the specific event settings in storage
   * and to identify the event in the application.
   */
  id: string;

  /**
   * The name of the event. This is used for display purposes. For example, in the event selection dropdown.
   */
  name: string;

  /**
   * The name of the application. This is used for display purposes. For example, as a title in the application.
   */
  applicationName: string;

  /**
   * The short name of the application. This is used for display purposes. Used in places where the long name would create
   * layout issues.
   */
  shortApplicationName: string;

  /**
   * The event dates. This is used to display the event dates to the user.
   *
   * This can be a string, date, or number
   *
   * - If a string is provided, it should be a valid date string that can be parsed by the
   * `Date` constructor.
   *
   * - If a number is provided, it should be a valid epoch timestamp.
   *
   * - If a date is provided, it should be a valid date object.
   */
  eventDates: Array<string | Date | number>;
}

/**
 * Representation of key-value pairs that define how the event map should be configured.
 */
export interface EventSettings extends Record<string, any> {
  /**
   * Whether or not the user requires accessible accommodations
   */
  accessible?: boolean;
}

/**
 * Object representing an event accommodation/options that can be selected by the user to customize the event map.
 */
export interface SpecialEventOption {
  /**
   * The value of the option. This is used to store the option in local store.
   */
  value: string;

  /**
   * Title of the option. This is used to display the option to the user.
   */
  label: string;

  /**
   * Description of the option. This is used to provide more information to the user.
   */
  description: string;

  /**
   * Short description of the option. This is used to provide a brief description to the user in summary views.
   */
  shortDescription: string;

  choices: Array<EventAccommodationOption>;

  effects: {
    layers?: Array<{
      /**
       * Layer ID of the layer that will be affected by the option.
       */
      layerId: string;

      /**
       * The published layer field id
       */
      field: string;

      /**
       * Since the effecting fields are not always the same across affecting layers, this property is used to
       * define the conversion between the input value and the output value.
       *
       * Consider the the tables A and B with their respective fields X and Y
       *
       * Table A
       * --------
       * Field X: Possible values are '1', '2', '3'
       *
       * Table B
       * --------
       * Field Y: Possible values are 'A', 'B', 'C'
       *
       * Where the `field` and `options` values are a perfect 1:1 match there is no need to define a conversion.
       *
       * However, in the case of Table B, the values are not the same. In this case, a conversion would be defined as:
       *
       * ```
       * conversions: [
       * { input: 'A', output: '1' },
       * { input: 'B', output: '2' },
       * { input: 'C', output: '3' }
       * ]
       * ```
       *
       */
      conversions?: Array<{ input: string; output: string | number | boolean }>;
    }>;

    /**
     * If a layer is affected by multiple effects, this property determines how the effects are applied.
     *
     * - `replace` will replace the current definition expression with the new one.
     * - `ignore` will ignore the new definition expression.
     * - `append-and` will append the new definition expression with an `AND` operator.
     * - `append-or` will append the new definition expression with an `OR` operator.
     */
    deconflictingStrategy?: 'replace' | 'ignore' | 'append-and' | 'append-or';
  };
}

/**
 * A collection of special event options that can be selected by the user to customize the event map.
 */
export type SpecialEventOptions = Array<SpecialEventOption>;

export interface EventAccommodationOption {
  /**
   * The value of the option. This is the result of a user selection for a given accommodation.
   */
  value: string | boolean | number;

  /**
   * The label of the option. This is used to display the option to the user.
   */
  label: string;

  /**
   * Operations to apply to layers based on the selected option value.
   */
}

export interface ResolvedEventSettings {
  [key: SpecialEventOption['value']]: {
    shortDescription: string;
    option: {
      value: string | boolean | number;
      label: string;
    } | null;
  };
}
