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
import { TsMainParkingDefinitions } from '../../definitions/main-parking.definitions';
import { EventSettingsService } from '../settings/event-settings.service';

import esri = __esri;

const TS_MAIN_PARKING_EVENT_ID = 'ts-main-parking';
const TS_MAIN_ROUTE_STOP_LABEL_LAYER_ID = 'ts-main-route-stop-labels';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  public settings: EventSettings;
  public eventOptions: SpecialEventOptions;

  public specialEventLayerReferences: Array<string>;

  private _map: esri.Map;
  private _view: esri.MapView;
  private _tsMainRouteStopLabelHandles: esri.WatchHandle[] = [];

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
    this.settings = this.eventSettingsService.settings();
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
      this.removeTsMainRouteStopLabelLayer();
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
        await this.addTsMainRouteStopLabelLayer();
      } else {
        throw new Error('drawEvent: No layer sources found.');
      }
    } catch (err) {
      console.error(`Failed to event areas`, err);
    }
  }

  private clearTsMainRouteStopLabelHandles() {
    this._tsMainRouteStopLabelHandles.forEach((handle) => handle.remove());
    this._tsMainRouteStopLabelHandles = [];
  }

  private removeTsMainRouteStopLabelLayer() {
    this.clearTsMainRouteStopLabelHandles();

    const existing = this._map?.findLayerById(TS_MAIN_ROUTE_STOP_LABEL_LAYER_ID);

    if (existing) {
      this._map.remove(existing);
    }
  }

  private async addTsMainRouteStopLabelLayer() {
    const activeEvent = this.eventSettingsService.eventConfiguration()?.configuration?.id;

    if (activeEvent !== TS_MAIN_PARKING_EVENT_ID) {
      return;
    }

    const routeStopLayer = this._map?.findLayerById(TsMainParkingDefinitions.ROUTE_STOP_START_POINTS.id) as esri.FeatureLayer;

    if (!routeStopLayer) {
      return;
    }

    const [GraphicsLayer, Graphic]: [esri.GraphicsLayerConstructor, esri.GraphicConstructor] = await this.moduleProvider.require([
      'GraphicsLayer',
      'Graphic'
    ]);

    const result = (await this.runTask(TsMainParkingDefinitions.ROUTE_STOP_START_POINTS.url, {
      where: routeStopLayer.definitionExpression || '1=1',
      outFields: ['Route'],
      returnGeometry: true
    })) as esri.FeatureSet;

    let objectId = 1;

    const graphics = result.features.flatMap((feature) => {
      const route = feature.attributes?.Route;
      const geometry = feature.geometry as esri.Multipoint;

      if (!route || !geometry?.points?.length) {
        return [];
      }

      return geometry.points.map(
        ([longitude, latitude]) =>
          new Graphic({
            geometry: {
              type: 'point',
              longitude,
              latitude,
              spatialReference: {
                wkid: 4326
              }
            } as esri.PointProperties,
            attributes: {
              OBJECTID: objectId++,
              Route: route
            },
            symbol: {
              type: 'text',
              text: String(route),
              color: [255, 255, 255, 255],
              haloColor: [255, 255, 255, 255],
              haloSize: 0.3,
              font: {
                family: 'Open Sans',
                size: 10,
                weight: 'bold'
              },
              horizontalAlignment: 'center',
              verticalAlignment: 'middle',
              xoffset: 0,
              yoffset: 0
            } as esri.TextSymbolProperties
          })
      );
    });

    if (graphics.length === 0) {
      return;
    }

    const labelLayer = new GraphicsLayer({
      id: TS_MAIN_ROUTE_STOP_LABEL_LAYER_ID,
      title: 'Route Stop/Start Labels',
      listMode: 'hide',
      visible: routeStopLayer.visible,
      minScale: routeStopLayer.minScale,
      maxScale: routeStopLayer.maxScale,
      graphics
    });

    const routeStopLayerIndex = this._map.layers.indexOf(routeStopLayer);
    this._map.add(labelLayer, routeStopLayerIndex > -1 ? routeStopLayerIndex + 1 : undefined);

    this._tsMainRouteStopLabelHandles.push(
      routeStopLayer.watch('visible', (visible) => {
        labelLayer.visible = visible;
      })
    );

    this._tsMainRouteStopLabelHandles.push(
      routeStopLayer.watch('minScale', (minScale) => {
        labelLayer.minScale = minScale;
      })
    );

    this._tsMainRouteStopLabelHandles.push(
      routeStopLayer.watch('maxScale', (maxScale) => {
        labelLayer.maxScale = maxScale;
      })
    );
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
