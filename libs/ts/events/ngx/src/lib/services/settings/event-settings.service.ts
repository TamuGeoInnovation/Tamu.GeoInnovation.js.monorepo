import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';
import { Observable, of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import {
  AggiemapCustomMapConfiguration,
  EventSettings,
  ResolvedEventSettings,
  SpecialEventOption,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { EventDefinitions } from '../../definitions/all.definitions';

@Injectable({
  providedIn: 'root'
})
export class EventSettingsService {
  private _settingsPrimaryKey: string;
  private _settingsSecondaryKey: string;

  public get queryParamsFromSettings() {
    const settings = this.settings();

    if (!settings) {
      return null;
    }

    const validSettings = this.validateSettings(settings, this.eventOptions());

    if (!validSettings) {
      return null;
    }

    // Prepare the key-value settings as an array of key-value pairs to create url search params.
    const settingsAsList = Object.entries(validSettings) as unknown as string[][];

    return new URLSearchParams(settingsAsList);
  }

  /**
   * Returns a boolean result based on whether the event has any settings saved in local storage.
   */
  public get hasSettings() {
    const validSettings = this.validateSettings(this.settings(), this.eventOptions());

    if (validSettings === null) {
      return false;
    }

    return Object.keys(validSettings).length > 0;
  }

  /**
   * Returns a boolean result based on whether the event has any configuration options. This is used to determine
   * whether the event has any settings that can be configured via the builder and/or determine routing behavior.
   */
  public get hasOptions() {
    return this.eventOptions().length > 0;
  }

  public set initializeSettingsStore(key: string) {
    this._settingsPrimaryKey = 'ts-events-settings';

    // Initialize the settings store with an empty object if it does not exist
    this._settingsSecondaryKey = key ? key : this.at.snapshot.queryParamMap.get('eventId') || '_';
  }

  constructor(
    private readonly at: ActivatedRoute,
    private readonly env: EnvironmentService,
    private readonly store: LocalStoreService
  ) {}

  public settings(): EventSettings;
  public settings(asObservable: true): Observable<EventSettings>;
  public settings(asObservable: false): EventSettings;
  public settings(asObservable?: boolean): EventSettings | Observable<EventSettings> {
    const settings: EventSettings = this.store.getStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: this._settingsSecondaryKey
    });

    if (asObservable) {
      return of(settings);
    } else {
      return settings;
    }
  }

  public eventOptions(): SpecialEventOptions;
  public eventOptions(asObservable: true): Observable<SpecialEventOptions>;
  public eventOptions(asObservable: false): SpecialEventOptions;
  public eventOptions(asObservable?: boolean): SpecialEventOptions | Observable<SpecialEventOptions> {
    const options: SpecialEventOptions = this.eventConfiguration().options || [];

    if (asObservable) {
      return of(options);
    } else {
      return options;
    }
  }

  public eventConfiguration(): AggiemapCustomMapConfiguration;
  public eventConfiguration(asObservable: true): Observable<AggiemapCustomMapConfiguration>;
  public eventConfiguration(asObservable: false): AggiemapCustomMapConfiguration;
  public eventConfiguration(
    asObservable?: boolean
  ): AggiemapCustomMapConfiguration | Observable<AggiemapCustomMapConfiguration> {
    const config = this.getEventDefinitionById(this._settingsSecondaryKey);

    if (!config) {
      throw new Error(`Event configuration for ID '${this._settingsSecondaryKey}' not found.`);
    } else {
      if (asObservable) {
        return of(config);
      } else {
        return config;
      }
    }
  }

  public eventLayerReferences(): Record<string, string>;
  public eventLayerReferences(asObservable: true): Observable<Record<string, string>>;
  public eventLayerReferences(asObservable: false): Record<string, string>;
  public eventLayerReferences(asObservable?: boolean): Record<string, string> | Observable<Record<string, string>> {
    const config = this.getEventDefinitionById(this._settingsSecondaryKey);

    if (config && config.references !== null) {
      const references = config.references;

      if (asObservable) {
        return of(references);
      } else {
        return references;
      }
    } else {
      throw new Error(`Event layer references for event ID '${this._settingsSecondaryKey}' not found.`);
    }
  }

  public eventLayerSources(): Array<LayerSource>;
  public eventLayerSources(asObservable: true): Observable<Array<LayerSource>>;
  public eventLayerSources(asObservable: false): Array<LayerSource>;
  public eventLayerSources(asObservable?: boolean): Array<LayerSource> | Observable<Array<LayerSource>> {
    const config = this.getEventDefinitionById(this._settingsSecondaryKey);

    if (config && config.sources !== null) {
      const sources = config.sources;

      if (asObservable) {
        return of(sources);
      } else {
        return sources;
      }
    } else {
      throw new Error(`Event layer sources for event ID '${this._settingsSecondaryKey}' not found.`);
    }
  }

  /**
   * Determines whether an option should be shown as a builder step (and treated as required) given the
   * current settings. Options without a `visibleWhen` condition are always visible. Options with one are
   * only visible when the gating setting's saved value is one of the configured `equalsAnyOf` values.
   * When several conditions are provided, any one of them matching makes the option visible.
   *
   * Gating is transitive: a condition pointing at a setting whose own option is currently hidden never
   * matches. Settings persist per-key, so a step that has been branched away from still has its last
   * selection in storage — without this, that stale value would keep a dependent step visible (for
   * example, a `direction` step gated on a personal-vehicle sub-mode would survive a switch to Shuttle).
   *
   * @param visiting Internal cycle guard for the transitive check; not part of the public contract.
   */
  public isOptionVisible(
    option: SpecialEventOption,
    settings: EventSettings | null | undefined,
    visiting: ReadonlySet<string> = new Set()
  ): boolean {
    if (!option.visibleWhen) {
      return true;
    }

    // A cyclic `visibleWhen` chain is a configuration error; treat the revisited option as unconditioned
    // rather than recursing forever.
    if (visiting.has(option.value)) {
      return true;
    }

    const chain = new Set(visiting).add(option.value);
    const conditions = Array.isArray(option.visibleWhen) ? option.visibleWhen : [option.visibleWhen];

    return conditions.some((condition) => {
      const gatingOption = this.eventOptions().find((o) => o.value === condition.setting);

      if (gatingOption && !this.isOptionVisible(gatingOption, settings, chain)) {
        return false;
      }

      const gatingValue = settings?.[condition.setting];

      return condition.equalsAnyOf.some((candidate) => candidate === gatingValue);
    });
  }

  /**
   * Returns the event options that are currently visible given the provided settings (defaults to the
   * settings in storage). Used to drive conditional builder flows so hidden steps are neither shown,
   * required, nor summarized.
   */
  public getVisibleOptions(settings: EventSettings | null | undefined = this.settings()): SpecialEventOptions {
    return this.eventOptions().filter((option) => this.isOptionVisible(option, settings));
  }

  public saveAccommodation(accommodationKey: string, accommodationValue: string | boolean | number) {
    const existing = this.store.getStorageObjectKeyValue<EventSettings>({
      primaryKey: this._settingsPrimaryKey,
      subKey: this._settingsSecondaryKey
    });

    this.store.setStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: this._settingsSecondaryKey,
      value: { ...existing, [accommodationKey]: accommodationValue }
    });

    const confirm = this.store.getStorageObjectKeyValue<boolean>({
      primaryKey: this._settingsPrimaryKey,
      subKey: this._settingsSecondaryKey
    });

    return confirm;
  }

  /**
   * Ensures every option has a value by assigning the first choice as default when missing.
   */
  public ensureDefaultOptionSettings() {
    const options = this.eventOptions();
    const existingSettings = this.settings() || {};
    let changed = false;

    const merged = options.reduce((acc, option) => {
      // Evaluate visibility against the accumulating settings so a gating option (listed earlier) can
      // determine whether a dependent, conditionally-visible option should receive a default value.
      if (this.isOptionVisible(option, acc) && acc[option.value] === undefined && option.choices.length > 0) {
        acc[option.value] = option.choices[0].value;
        changed = true;
      }

      return acc;
    }, { ...existingSettings } as EventSettings);

    if (changed) {
      this.store.setStorageObjectKeyValue({
        primaryKey: this._settingsPrimaryKey,
        subKey: this._settingsSecondaryKey,
        value: merged
      });
    }

    return merged;
  }

  public getSavedAccommodation(accommodationKey: string) {
    const settings = this.settings();

    if (settings !== null && settings !== undefined) {
      return settings[accommodationKey] !== undefined ? settings[accommodationKey] : null;
    } else {
      return null;
    }
  }

  public setSettingsFromQueryParams(params: EventSettings) {
    try {
      const settings = this.validateSettings(params, this.eventOptions());

      if (settings === null) {
        return this.store.setStorageObjectKeyValue({
          primaryKey: this._settingsPrimaryKey,
          subKey: this._settingsSecondaryKey,
          value: {}
        });
      }

      return this.store.setStorageObjectKeyValue({
        primaryKey: this._settingsPrimaryKey,
        subKey: this._settingsSecondaryKey,
        value: settings
      });
    } catch (err) {
      throw new Error((err as Error)['message']);
    }
  }

  /**
   * Merges the settings from local storage with the environment definitions.
   * to return a dictionary of event option keys with their respective value label and key.
   *
   * This is used for UI representation of the settings.
   */
  public getMergedSettings() {
    const settings = this.settings();
    // Only summarize options that are currently visible so conditionally-hidden steps (e.g. an
    // Entry/Exit direction that doesn't apply to the selected mode) don't render as blank rows.
    const options = this.getVisibleOptions(settings);

    return options.reduce((merged, option) => {
      if (settings && settings[option.value] !== undefined) {
        const value = settings[option.value];

        if (value !== undefined) {
          const selectedChoice = option.choices.find((o) => o.value === value);

          return [
            ...merged,
            {
              key: option.value,
              shortDescription: option.shortDescription,
              option: selectedChoice
                ? {
                    value: value,
                    label: selectedChoice.label,
                    note: selectedChoice.note
                  }
                : null
            }
          ];
        } else {
          return [
            ...merged,
            {
              key: option.value,
              shortDescription: option.shortDescription,
              option: null
            }
          ];
        }
      } else {
        return [
          ...merged,
          {
            key: option.value,
            shortDescription: option.shortDescription,
            option: null
          }
        ];
      }
    }, [] as ResolvedEventSettings);
  }

  public accommodationsValid() {
    const settings = this.settings();
    // A conditionally-hidden option is not required, so validity is measured against visible options only.
    const options = this.getVisibleOptions(settings);

    return options.every((opt) => {
      return settings?.[opt.value] !== undefined;
    });
  }

  /**
   * Validates the provided settings object against the provided event options.
   *
   * Returns a new settings object with only the keys that exist in the event options with a valid value.
   */
  public validateSettings(settings: EventSettings, options: SpecialEventOptions): EventSettings | null {
    if (settings === undefined || settings === null) {
      return null;
    }

    const validated = Object.entries(settings).reduce((acc, [key, setting]) => {
      const option = options.find((o) => o.value === key);
      // Find the event option that has the current settings key in its options

      if (option) {
        // Determine if the current setting value is in the list of valid options for the current option
        const valid = option.choices.some((opt) => opt.value === setting);

        if (valid) {
          acc[key] = setting;
        } else {
          console.warn(`Setting for key '${key}:${setting}' is not valid according to provided options.`);
        }
      } else {
        console.warn(`Setting for key '${key}' is not valid according to provided options.`);
      }

      return acc;
    }, {} as EventSettings);

    if (Object.keys(validated).length === 0) {
      return null;
    } else return validated;
  }

  /**
   * Validates the event ID against the EventDefinitions.
   *
   * @param {string} eventId A string that represents the event configuration Id
   * @return {Boolean} Returns true if the eventId is valid, false otherwise.
   */
  public validateEventId(eventId: string): boolean {
    // Implement your logic to validate the event ID
    if (!eventId || eventId.length === 0) {
      return false;
    }

    const eventIndex = EventDefinitions.findIndex((event) => event?.configuration?.id === eventId);

    // Check if the eventId exists in the EventDefinitions
    return eventIndex > -1;
  }

  /**
   * Returns the event definition by its ID.
   * If the eventId is not valid, it returns null.
   * If the eventId is valid, it returns the corresponding EventDefinition object.
   *
   * @param {string} eventId A string that represents the event configuration Id
   * @return {EventDefinition | null} Returns the EventDefinition object if found, otherwise null.
   */
  public getEventDefinitionById(eventId: string): AggiemapCustomMapConfiguration | null {
    if (!eventId || eventId.length === 0) {
      return null;
    }

    const eventIndex = EventDefinitions.findIndex((event) => event?.configuration?.id === eventId);

    // Check if the eventId exists in the EventDefinitions
    if (eventIndex > -1) {
      return EventDefinitions[eventIndex];
    } else {
      return null;
    }
  }

  /**
   * Checks if the eventId query parameter is present in the route snapshot.
   *
   * If the eventId is present, it validates the eventId against the EventDefinitions.
   *
   * If the eventId is not present or if the validation fails, it returns false.
   *
   * @param {ActivatedRouteSnapshot} [snapshot] Uses router state by default, but can optionally be provided a specific snapshot.
   */
  public validateEventQueryParams(snapshot?: ActivatedRouteSnapshot, initializeState?: boolean): boolean {
    const paramKey = 'eventId';
    const params = snapshot ? snapshot.params : this.at.snapshot.params;
    const paramsId = params[paramKey];

    if (this.routeHasParams(params)) {
      const validId = this.validateEventId(paramsId);

      if (validId) {
        if (initializeState) {
          this.initializeSettingsStore = paramsId;
        }
        return true;
      } else {
        console.warn(`Event ID '${paramsId}' is not valid.`);
        return false;
      }
    }

    return false;
  }

  /**
   * Simple utility function to check if the key eventId is in a Params dictionary
   */
  public routeHasParams(params: Params): boolean {
    if (params['eventId']) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns true when the provided query params include a supported feature deep-link
   * such as `?lot=43` or the generic `?feature=<layerId>:<objectId>` emitted by popup share links,
   * allowing maps to open directly without builder selections.
   */
  public hasFeatureSelectionQueryParams(params?: Params): boolean {
    const queryParams = params ?? this.at.snapshot.queryParams;

    if (!queryParams) {
      return false;
    }

    if (this._hasQueryParamValue(queryParams, 'feature')) {
      return true;
    }

    const searchSources = this.env.value('SearchSources') as SearchSource[] | null | undefined;

    if (!Array.isArray(searchSources)) {
      return false;
    }

    return searchSources.some((searchSource) => {
      if (!searchSource.urlQueryParam) {
        return false;
      }

      const parameterKeys = [searchSource.urlQueryParam, ...(searchSource.urlQueryParamAliases || [])];

      return parameterKeys.some((key) => this._hasQueryParamValue(queryParams, key));
    });
  }

  /**
   * Returns true when the provided query params carry at least one builder selection, i.e. a param
   * keyed to one of the event's configurable options. Used to determine whether the url should be
   * treated as the authoritative source of settings; params like `?feature=` or `?basemap=` are not
   * selections and must not be mistaken for them.
   */
  public hasSettingsQueryParams(params?: Params): boolean {
    const queryParams = params ?? this.at.snapshot.queryParams;

    if (!queryParams) {
      return false;
    }

    return this.eventOptions().some((option) => this._hasQueryParamValue(queryParams, option.value));
  }

  private _hasQueryParamValue(params: Params, key: string): boolean {
    const value = params[key];

    if (Array.isArray(value)) {
      return value.some((entry) => `${entry}`.trim().length > 0);
    }

    return value !== undefined && value !== null && `${value}`.trim().length > 0;
  }
}
