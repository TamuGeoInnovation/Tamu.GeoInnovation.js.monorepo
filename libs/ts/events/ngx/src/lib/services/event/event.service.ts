import { Injectable } from '@angular/core';
import { delay } from 'rxjs';

import deepmerge from 'deepmerge';

import { EsriMapService, EsriModuleProviderService, LayerSourcesService } from '@tamu-gisc/maps/esri';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

import {
  EventSettings,
  ConversionDeconflictingStrategy,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { EventSettingsService } from '../settings/event-settings.service';

import esri = __esri;

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

          return source;
        });

      if (sources.length > 0) {
        await this.mapService.loadLayers(sources);
        await this.selectFeatureFromUrl(sources);
      } else {
        throw new Error('drawEvent: No layer sources found.');
      }
    } catch (err) {
      console.error(`Failed to event areas`, err);
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

    const popupComponent = root?.popupComponent;

    if (root) {
      const copied = JSON.parse(JSON.stringify(root));

      copied.popupComponent = popupComponent;

      return copied;
    } else {
      throw new Error(`Layer source reference '${reference}' not found.`);
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
    const selectedLot = params.get('lot') || params.get('Lot');

    if (selectedFeature) {
      await this.selectGenericFeatureFromUrl(sources, selectedFeature);
      return;
    }

    if (selectedLot) {
      await this.selectLotFromUrl(sources, selectedLot);
    }
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

    this.mapService.selectFeatures({
      graphics: [feature],
      shouldShowPopup: true
    });
  }

  private async selectLotFromUrl(sources: LayerSource[], selectedLot: string): Promise<void> {
    const normalizedLot = selectedLot.trim().replace(/^Lot\s+/i, '');

    if (normalizedLot.length === 0) {
      return;
    }

    const prioritizedSources = [...sources].sort((a, b) => {
      return Number(this._isLotLikeLayerSource(b)) - Number(this._isLotLikeLayerSource(a));
    });

    for (const source of prioritizedSources) {
      const layer = this._map.findLayerById(source.id) as esri.FeatureLayer | undefined;

      if (!layer) {
        continue;
      }

      await layer.load();

      const fields = (layer.fields || []).map((field) => field.name);
      const matchingField = ['Name', 'LotName', 'name'].find((fieldName) => fields.includes(fieldName));

      if (!matchingField) {
        continue;
      }

      const matchValues = Array.from(
        new Set(
          [normalizedLot, normalizedLot.replace(/^0+(\d)/, '$1'), normalizedLot.padStart(3, '0')].filter(
            (value) => value.length > 0
          )
        )
      );

      const where = matchValues
        .map((value) => `${matchingField} = '${value.replace(/'/g, "''")}'`)
        .join(' OR ');

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

        this.mapService.selectFeatures({
          graphics: [feature],
          shouldShowPopup: true
        });

        return;
      }
    }
  }

  private _isLotLikeLayerSource(source: LayerSource): boolean {
    const haystack = `${source.id} ${source.title}`.toLowerCase();
    return haystack.includes('parking') || haystack.includes('lot');
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
