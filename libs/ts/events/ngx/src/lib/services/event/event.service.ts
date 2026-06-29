import { Component, Injectable, Type } from '@angular/core';
import { delay } from 'rxjs';

import deepmerge from 'deepmerge';

import { EsriMapService, EsriModuleProviderService, LayerSourcesService } from '@tamu-gisc/maps/esri';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { hasTemplateExpression, TemplateRenderer } from '@tamu-gisc/common/utils/string';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import {
  EventSettings,
  ConversionDeconflictingStrategy,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { EventSettingsService } from '../settings/event-settings.service';

import esri = __esri;

type PopupDataDefinition = NonNullable<LayerSource['popupData']>;
type PopupDataResolutionStrategy = NonNullable<LayerSource['popupDataResolutionStrategy']>;
type PopupDataEntry = PopupDataDefinition[string];

@Injectable({
  providedIn: 'root'
})
export class EventService {
  public settings: EventSettings;
  public eventOptions: SpecialEventOptions;

  public specialEventLayerReferences: Array<string>;

  private _map: esri.Map;
  private _view: esri.MapView;

  constructor(
    private readonly env: EnvironmentService,
    private readonly moduleProvider: EsriModuleProviderService,
    private readonly mapService: EsriMapService,
    private readonly eventSettingsService: EventSettingsService,
    private readonly lss: LayerSourcesService
  ) {
    // Patch default layer overrides
    const eventConfiguration = this.eventSettingsService.eventConfiguration()?.configuration || undefined;

    if (eventConfiguration && eventConfiguration.defaultLayerOverrides) {
      Object.entries(eventConfiguration.defaultLayerOverrides).forEach(([layerId, override]) => {
        this.lss.setLayerOverrides(layerId, override);
      });
    }

    this.eventOptions = this.eventSettingsService.eventOptions();
    this.settings = this.eventSettingsService.settings() || {};
    this.specialEventLayerReferences = Object.entries(this.eventSettingsService.eventLayerReferences())
      .map(([, value]) => value)
      .reverse();

    this.mapService.store.pipe(delay(250)).subscribe((instanced) => {
      this._map = instanced.map;
      this._view = instanced.view as esri.MapView;
      this.drawEvent();
    });
  }

  public async drawEvent() {
    try {
      const eventLayers = this.specialEventLayerReferences;

      // For each source, iterate through event options and determine if any of the option effect targets apply to the immediate source.
      // If so, apply the effect.
      const sources = eventLayers
        .map((ref) => this.getLayerSourceCopy(ref))
        .map((source) => {
          // Determine the list of options that list the current source as an effect target
          const specialEventOptionsTargetingSource = this.eventOptions.filter((o) => {
            return o.effects.layers?.some((layer) => layer.layerId === source.id);
          });

          if (specialEventOptionsTargetingSource.length > 0) {
            for (const option of specialEventOptionsTargetingSource) {
              if (option.effects.layers && option.effects.layers?.length > 0) {
                for (const layer of option.effects.layers) {
                  if (layer.layerId === source.id) {
                    const settingValue = this.settings[option.value];

                    if (settingValue !== undefined) {
                      let value: string | number | boolean | null = null;

                      // If the layer has conversion options, convert the setting value to the appropriate value.
                      if (layer.conversions) {
                        // Using the value of the current setting, locate the conversion object that uses the setting value as an input.
                        // Its output property will be used as the value for the definition expression.
                        const correspondingOption = layer.conversions.find((c) => c.input === settingValue);

                        // If propOverrides are provided, assign them to the source layer.
                        // This enables the ability to, for example, show/hide layers based on accommodation selections.
                        if (correspondingOption && correspondingOption.propOverrides) {
                          source = deepmerge(source, correspondingOption.propOverrides) as LayerSource;
                        }

                        if (correspondingOption && correspondingOption.expression) {
                          value = correspondingOption.expression;

                          // If there's already a definition expression set, use the deconflicting strategy to determine how to apply the new expression.
                          // If there's no deconflicting strategy, default to 'append-and'

                          const existingExpression = (source as esri.FeatureLayer).definitionExpression;

                          if (existingExpression) {
                            const deconflictingStrategy =
                              correspondingOption.deconflictingStrategy || ConversionDeconflictingStrategy.APPEND_AND;

                            if (deconflictingStrategy === ConversionDeconflictingStrategy.APPEND_AND) {
                              (source as esri.FeatureLayer).definitionExpression = `(${existingExpression}) AND (${value})`;
                            } else if (deconflictingStrategy === ConversionDeconflictingStrategy.APPEND_OR) {
                              (source as esri.FeatureLayer).definitionExpression = `(${existingExpression}) OR (${value})`;
                            } else if (deconflictingStrategy === ConversionDeconflictingStrategy.REPLACE) {
                              (source as esri.FeatureLayer).definitionExpression = value;
                            } else {
                              // Ignore
                              console.warn(
                                `EventService.drawEvent: Ignoring new definition expression for layer ${source.id} using 'ignore' deconflicting strategy.`
                              );
                            }
                          } else {
                            (source as esri.FeatureLayer).definitionExpression = value;
                          }
                        }

                        if (correspondingOption && correspondingOption.output) {
                          value = correspondingOption.output;
                        }
                      } else {
                        value = settingValue;
                      }

                      // Only set definition expression if we have a value and it's not already set by expression above
                      if (value !== null && !(source as esri.FeatureLayer).definitionExpression) {
                        (source as esri.FeatureLayer).definitionExpression = `${layer.field} = ${
                          typeof value === 'string' ? `'${value}'` : value
                        }`;
                      }
                    }
                  }
                }
              }
            }
          }

          // Group layers (e.g. Fish Camp's Arrival/Departure groups) hold their feature layers in a
          // nested `sources` array. The block above only targets the top-level source, so walk the
          // children and apply any option effects whose layerId matches a nested feature layer.
          this.applyEffectsToGroupChildren(source);

          return source;
        });

      if (sources.length > 0) {
        await this.mapService.loadLayers(sources);
        await this.selectFeatureFromUrl(sources);
        await this.applySelectedChoiceView();
        this.setupExclusiveLayers();
      } else {
        throw new Error('drawEvent: No layer sources found.');
      }
    } catch (err) {
      console.error(`Failed to event areas`, err);
    }
  }

  /**
   * Recursively applies option effects to a group source's nested feature layers.
   *
   * Unlike top-level sources (handled inline in `drawEvent`), group children are not direct effect
   * targets in the reference list, so their definition expressions must be resolved by walking the
   * tree. The resolved expression is written to the child's `native.definitionExpression` because
   * `EsriMapService.generateLayer` spreads `native` last — any expression set elsewhere would be
   * overridden by it.
   */
  private applyEffectsToGroupChildren(source: LayerSource): void {
    const children = (source as { sources?: LayerSource[] }).sources;

    if (!children || children.length === 0) {
      return;
    }

    for (const child of children) {
      // Handle nested groups before applying effects to the immediate child.
      this.applyEffectsToGroupChildren(child);

      const optionsTargetingChild = this.eventOptions.filter((o) =>
        o.effects.layers?.some((layer) => layer.layerId === child.id)
      );

      for (const option of optionsTargetingChild) {
        const settingValue = this.settings[option.value];

        if (settingValue === undefined) {
          continue;
        }

        for (const layer of option.effects.layers ?? []) {
          if (layer.layerId !== child.id || !layer.conversions) {
            continue;
          }

          const conversion = layer.conversions.find((c) => c.input === settingValue);

          if (!conversion) {
            continue;
          }

          if (conversion.propOverrides) {
            Object.assign(child, deepmerge(child, conversion.propOverrides));
          }

          if (conversion.expression) {
            this.setChildDefinitionExpression(child, conversion.expression, conversion.deconflictingStrategy);
          }
        }
      }
    }
  }

  /**
   * Sets a group child's definition expression on its `native` block, honoring any deconflicting
   * strategy when an expression is already present. A `'1=0'` placeholder is treated as empty.
   */
  private setChildDefinitionExpression(
    child: LayerSource,
    expression: string,
    strategy?: ConversionDeconflictingStrategy
  ): void {
    const native = ((child as { native?: { definitionExpression?: string } }).native ??= {});
    const existingRaw = native.definitionExpression;
    const existing = existingRaw && existingRaw !== '1=0' ? existingRaw : undefined;

    if (!existing) {
      native.definitionExpression = expression;
      return;
    }

    const deconflictingStrategy = strategy || ConversionDeconflictingStrategy.APPEND_AND;

    if (deconflictingStrategy === ConversionDeconflictingStrategy.APPEND_AND) {
      native.definitionExpression = `(${existing}) AND (${expression})`;
    } else if (deconflictingStrategy === ConversionDeconflictingStrategy.APPEND_OR) {
      native.definitionExpression = `(${existing}) OR (${expression})`;
    } else if (deconflictingStrategy === ConversionDeconflictingStrategy.REPLACE) {
      native.definitionExpression = expression;
    }
    // ConversionDeconflictingStrategy.IGNORE leaves the existing expression untouched.
  }

  /**
   * Recenters the map on the active selection's configured `mapView`, if any.
   *
   * Applies an explicit `[lon, lat]` center and optional zoom carried by the selected builder choice.
   * It gives events with fixed, choice-specific locations precise control over framing and takes
   * precedence over the configuration-level `mapCenter`/`zoom`.
   */
  private async applySelectedChoiceView(): Promise<void> {
    if (!this._view) {
      return;
    }

    for (const option of this.eventOptions) {
      const settingValue = this.settings[option.value];

      if (settingValue === undefined) {
        continue;
      }

      const selectedChoice = option.choices?.find((choice) => choice.value === settingValue);
      const view = selectedChoice?.mapView;

      if (view?.center) {
        try {
          await this._view.goTo({ center: view.center, zoom: view.zoom ?? this._view.zoom });
        } catch (err) {
          console.error('EventService: Failed to apply selected choice view', err);
        }

        return;
      }
    }
  }

  /**
   * Wires up mutually-exclusive (radio) behavior for the layers listed in the event
   * configuration's `exclusiveLayerIds`. When any one of them becomes visible, the others in the
   * set are turned off.
   *
   * Turning the others off only re-fires the watcher with `visible === false`, which hits the
   * no-op branch, so there is no feedback loop. Because both the Layers (TOC) list and the legend
   * toggle `layer.visible`, this applies regardless of which surface the user toggles from.
   */
  private setupExclusiveLayers(): void {
    const exclusiveLayerIds =
      this.eventSettingsService.eventConfiguration()?.configuration?.exclusiveLayerIds ?? [];

    if (!this._map || exclusiveLayerIds.length < 2) {
      return;
    }

    const layers = exclusiveLayerIds
      .map((id) => this._map.findLayerById(id))
      .filter((layer): layer is esri.Layer => Boolean(layer));

    for (const layer of layers) {
      layer.watch('visible', (isVisible: boolean) => {
        if (!isVisible) {
          return;
        }

        for (const other of layers) {
          if (other !== layer && other.visible) {
            other.visible = false;
          }
        }
      });
    }
  }

  /**
   * Returns a clone layer source of the provided layer source `id` reference.
   *
   * Throws error if no referenced source found (invalid or non-existing).
   */
  public getLayerSourceCopy(reference: string): LayerSource {
    const sources: Array<LayerSource> = this.eventSettingsService.eventLayerSources();
    const root = sources.find((s) => s.id == reference);

    if (root) {
      const copied = JSON.parse(JSON.stringify(root));

      // JSON.stringify strips non-serializable values like Angular component class references.
      // Walk both trees in parallel to restore them on the cloned copy.
      this._restoreNonSerializableSourceProperties(root, copied);

      return copied;
    } else {
      throw new Error(`Layer source reference '${reference}' not found.`);
    }
  }

  private _restoreNonSerializableSourceProperties(original: LayerSource, copy: LayerSource): void {
    if (original.popupComponent) {
      copy.popupComponent = original.popupComponent;
    }

    const originalChildren = (original as { sources?: LayerSource[] }).sources;
    const copyChildren = (copy as { sources?: LayerSource[] }).sources;

    if (originalChildren && copyChildren) {
      originalChildren.forEach((child, index) => {
        if (copyChildren[index]) {
          this._restoreNonSerializableSourceProperties(child, copyChildren[index]);
        }
      });
    }
  }

  /**
   * Converts an array of features into a list of attribute values.
   *
   * @returns Attribute value list
   */
  private getAttributeList(features: esri.Graphic[], attribute: string): string[] {
    return features.map((f) => f.attributes[attribute]);
  }

  private async selectFeatureFromUrl(sources: LayerSource[]): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const selectedFeature = params.get('feature');

    // The generic `feature=<layerId>:<objectId>` form is unambiguous and takes precedence.
    if (selectedFeature) {
      await this.selectGenericFeatureFromUrl(sources, selectedFeature);
      return;
    }

    // Otherwise attempt to resolve a feature using any configured search-source deep link
    // (e.g. `?lot=43`, `?bldg=AGLS`). The parameter keys and the attribute fields to match
    // against are read entirely from the search source configuration, so this works for any
    // layer or data type without code changes.
    await this.selectFeatureByConfiguredParam(sources, params);
  }

  private async selectGenericFeatureFromUrl(sources: LayerSource[], selectedFeature: string): Promise<void> {
    const separatorIndex = selectedFeature.indexOf(':');

    if (separatorIndex === -1) {
      console.warn(`EventService.selectFeatureFromUrl: Invalid feature parameter '${selectedFeature}'.`);
      return;
    }

    const layerId = selectedFeature.slice(0, separatorIndex);
    const objectId = Number(selectedFeature.slice(separatorIndex + 1));

    if (!layerId || Number.isNaN(objectId)) {
      console.warn(`EventService.selectFeatureFromUrl: Invalid feature parameter '${selectedFeature}'.`);
      return;
    }

    const layer = this._map.findLayerById(layerId) as esri.FeatureLayer | undefined;
    const source = sources.find((candidate) => candidate.id === layerId);

    if (!layer || !source) {
      console.warn(`EventService.selectFeatureFromUrl: Layer '${layerId}' not found.`);
      return;
    }

    await layer.load();

    const result = await layer.queryFeatures({
      objectIds: [objectId],
      outFields: ['*'],
      returnGeometry: true
    });

    const feature = result.features[0];

    if (!feature) {
      console.warn(`EventService.selectFeatureFromUrl: Feature '${selectedFeature}' not found.`);
      return;
    }

    feature.attributes = {
      ...feature.attributes,
      __featureLayerId: layerId,
      __featureObjectId: objectId
    };

    this.hydrateFeaturePopupData(feature, source);

    this.mapService.selectFeatures({
      graphics: [feature],
      shouldShowPopup: true,
      popupComponent: this.getPopupComponent(source)
    });
  }

  /**
   * Attempts to select a feature using a human-friendly value supplied via a configured URL query
   * parameter (e.g. `?lot=43`, `?bldg=AGLS`).
   *
   * The recognized parameter keys and the attribute fields to match against are sourced from the
   * `SearchSource` configuration (`urlQueryParam`/`urlQueryParamAliases` and the where-clause
   * `keys`), so no layer- or data-type-specific values are hard-coded here.
   */
  private async selectFeatureByConfiguredParam(sources: LayerSource[], params: URLSearchParams): Promise<void> {
    const searchSources = this.env.value('SearchSources') as SearchSource[] | null | undefined;

    if (!Array.isArray(searchSources)) {
      return;
    }

    for (const searchSource of searchSources) {
      if (!searchSource.urlQueryParam) {
        continue;
      }

      const paramKeys = [searchSource.urlQueryParam, ...(searchSource.urlQueryParamAliases || [])];
      const rawValue = paramKeys
        .map((key) => params.get(key))
        .find((value): value is string => !!value && value.trim().length > 0);

      const matchFields = searchSource.queryParams?.where?.keys || [];

      if (!rawValue || matchFields.length === 0) {
        continue;
      }

      const selected = await this.selectFeatureByFieldMatch(sources, rawValue.trim(), matchFields);

      if (selected) {
        return;
      }
    }
  }

  /**
   * Queries the provided layer sources for a feature whose value in one of the `candidateFields`
   * matches `value` (case-insensitive), then selects and shows it.
   *
   * Sources are tried in order of the most specific field they expose: the earlier a field appears
   * in `candidateFields` (highest priority first), the earlier its layer is queried. This replaces
   * any layer-name heuristics with a configuration-driven ordering that works for any layer.
   *
   * @returns `true` if a matching feature was found and selected.
   */
  private async selectFeatureByFieldMatch(
    sources: LayerSource[],
    value: string,
    candidateFields: string[]
  ): Promise<boolean> {
    const escapedValue = value.replace(/'/g, "''").toUpperCase();

    const candidates: Array<{ source: LayerSource; layer: esri.FeatureLayer; fields: string[]; priority: number }> = [];

    for (const source of sources) {
      const layer = this._map.findLayerById(source.id) as esri.FeatureLayer | undefined;

      if (!layer) {
        continue;
      }

      await layer.load();

      const layerFields = (layer.fields || []).map((field) => field.name);
      const matchingFields = candidateFields.filter((fieldName) => layerFields.includes(fieldName));

      if (matchingFields.length === 0) {
        continue;
      }

      const priority = Math.min(...matchingFields.map((fieldName) => candidateFields.indexOf(fieldName)));

      candidates.push({ source, layer, fields: matchingFields, priority });
    }

    candidates.sort((a, b) => a.priority - b.priority);

    for (const { source, layer, fields } of candidates) {
      const where = fields.map((field) => `UPPER(${field}) = '${escapedValue}'`).join(' OR ');

      const result = await layer.queryFeatures({
        where,
        outFields: ['*'],
        returnGeometry: true
      });

      const feature = result.features[0];

      if (feature) {
        feature.attributes = {
          ...feature.attributes,
          __featureLayerId: source.id,
          __featureObjectId: feature.attributes[layer.objectIdField]
        };

        this.hydrateFeaturePopupData(feature, source);

        this.mapService.selectFeatures({
          graphics: [feature],
          shouldShowPopup: true,
          popupComponent: this.getPopupComponent(source)
        });

        return true;
      }
    }

    return false;
  }

  private getPopupComponent(source: LayerSource): Type<Component> | undefined {
    return source.popupComponent as Type<Component> | undefined;
  }

  /**
   * Resolves any layer-configured popupData onto a queried feature so direct-link selections
   * render the same sidebar content as a real map click.
   */
  private hydrateFeaturePopupData(feature: esri.Graphic, source: LayerSource): void {
    if (!source.popupData) {
      return;
    }

    const resolvedPopupData = this.resolvePopupData(
      feature,
      source.popupData,
      source.popupDataResolutionStrategy ?? 'independent'
    );

    feature.attributes = {
      ...feature.attributes,
      ...resolvedPopupData
    };
  }

  private resolvePopupData(
    graphic: esri.Graphic,
    popupData: PopupDataDefinition,
    strategy: PopupDataResolutionStrategy
  ): Record<string, unknown> {
    return Object.entries(popupData).reduce<Record<string, unknown>>((acc, [key, definition]) => {
      if (acc[key] !== undefined) {
        return acc;
      }

      acc[key] = this.resolvePopupDataEntry(graphic, definition, acc, strategy);

      return acc;
    }, {});
  }

  private resolvePopupDataEntry(
    graphic: esri.Graphic,
    definition: PopupDataEntry,
    resolvedEntries: Record<string, unknown>,
    strategy: PopupDataResolutionStrategy
  ): unknown {
    if (typeof definition !== 'string') {
      return getPropertyValue(graphic.attributes, definition.field, definition.collapsed);
    }

    const lookup = this.getPopupDataLookup(graphic, resolvedEntries, strategy);

    if (hasTemplateExpression(definition)) {
      return new TemplateRenderer({
        template: definition,
        lookup,
        options:
          strategy === 'cumulative'
            ? {
                nullishReplacement: '',
                trim: true
              }
            : undefined
      }).render();
    }

    return getPropertyValue(lookup, definition);
  }

  private getPopupDataLookup(
    graphic: esri.Graphic,
    resolvedEntries: Record<string, unknown>,
    strategy: PopupDataResolutionStrategy
  ) {
    if (strategy === 'cumulative') {
      return {
        ...graphic,
        attributes: {
          ...(graphic.attributes || {}),
          ...resolvedEntries
        }
      };
    }

    return graphic;
  }

  /**
   * Executes task with provided options.
   *
   * @param {string} url URL used to instantiate the Esri QueryTask class
   * @param {esri.QueryProperties} query At minimum, requires `where` property
   * @param {*} [intersect] If true, the query will run with a `intersects` geometry context utilizing boundaries based on builder settings
   * This will return only features within the provided polygon paths.
   * @param {boolean} [returnFeatureLayer] If provided and `true`, will return a FeatureLayer from the result of the task
   * @returns Task result or feature layer
   */
  public async runTask(
    url: string,
    query: esri.QueryProperties,
    intersect?: boolean | number[][] | esri.Geometry,
    returnFeatureLayer?: false,
    featureLayerProperties?: esri.FeatureLayerProperties
  ): Promise<esri.FeatureSet>;
  public async runTask(
    url: string,
    query: esri.QueryProperties,
    intersect?: boolean | number[][] | esri.Geometry,
    returnFeatureLayer?: true,
    featureLayerProperties?: esri.FeatureLayerProperties
  ): Promise<esri.FeatureLayer>;
  public async runTask(
    url: string,
    query: esri.QueryProperties,
    intersect?: boolean | number[][] | esri.Geometry,
    returnFeatureLayer?: boolean,
    featureLayerProperties?: esri.FeatureLayerProperties
  ): Promise<unknown> {
    const [QueryTask, Query, FeatureLayer, SpatialReference]: [
      esri.QueryTaskConstructor,
      esri.QueryConstructor,
      esri.FeatureLayerConstructor,
      esri.SpatialReferenceConstructor
    ] = await this.moduleProvider.require(['QueryTask', 'Query', 'FeatureLayer', 'SpatialReference']);

    const task = new QueryTask({
      url: url
    });

    const q = new Query();

    // Assign query default options.
    Object.assign(q, { returnGeometry: true, outFields: ['*'], outSpatialReference: new SpatialReference({ wkid: 4326 }) });

    // Assign provided query options.
    Object.assign(q, query);

    const result = await task.execute(q);

    if (returnFeatureLayer) {
      const props = {
        source: result.features,
        fields: result.fields.filter((f) => !f.name.includes('Shape'))
      };
      return new FeatureLayer(featureLayerProperties ? { ...props, ...featureLayerProperties } : props);
    } else {
      return result;
    }
  }
}
