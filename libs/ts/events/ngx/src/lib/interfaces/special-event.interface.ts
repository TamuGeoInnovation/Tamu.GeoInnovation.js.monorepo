export interface EventSettings extends Record<string, any> {
  /**
   * Whether or not the user requires accessible accommodations
   */
  accessible?: boolean;
}

export interface SpecialEventOptions {
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

  options: Array<EventAccommodationOption>;
}

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
  effects: {
    layers?: Array<{
      layerId: string;

      definitionExpression: string;
    }>;
  };
}

export interface ResolvedEventSettings {
  [key: SpecialEventOptions['value']]: {
    shortDescription: string;
    option: {
      value: string | boolean | number;
      label: string;
    } | null;
  };
}
