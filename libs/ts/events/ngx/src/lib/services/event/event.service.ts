import { Injectable } from '@angular/core';
import { delay } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

import { EventSettings, SpecialEventOptions } from '../../interfaces/special-event.interface';
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
    private readonly eventSettingsService: EventSettingsService
  ) {
    this.eventOptions = this.eventSettingsService.eventOptions();
    this.settings = this.eventSettingsService.settings();
    this.specialEventLayerReferences = Object.entries(this.eventSettingsService.eventLayerReferences()).map(
      ([, value]) => value
    );

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
                      let value: string | number | boolean;

                      // If the layer has conversion options, convert the setting value to the appropriate value.
                      if (layer.conversions) {
                        // Using the value of the current setting, locate the conversion object that uses the setting value as an input.
                        // Its output property will be used as the value for the definition expression.
                        const correspondingOption = layer.conversions.find((c) => c.input === settingValue);

                        if (correspondingOption && correspondingOption.expression) {
                          value = correspondingOption.expression;

                          (source as esri.FeatureLayer).definitionExpression = value;

                          return source;
                        }

                        if (correspondingOption && correspondingOption.output) {
                          value = correspondingOption.output;
                        } else {
                          console.log(
                            `No conversion found for setting value '${settingValue}' on layer '${source.id}'. Not applying definition expression.`
                          );

                          return source;
                        }
                      } else {
                        value = settingValue;
                      }

                      (source as esri.FeatureLayer).definitionExpression = `${layer.field} = ${
                        typeof value === 'string' ? `'${value}'` : value
                      }`;
                    }
                  }
                }
              }
            }
          }

          return source;
        });

      if (sources.length > 0) {
        this.mapService.loadLayers(sources);
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
    const sources: Array<LayerSource> = this.env.value('ColdLayerSources', false);
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
