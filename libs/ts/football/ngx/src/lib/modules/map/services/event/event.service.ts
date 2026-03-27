import { Injectable } from '@angular/core';
import { delay } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

import {
  FootballSettings,
  GAMEDAY_LAYERS,
  SHOWDOWN_EVENT,
  SHOWDOWN_LAYERS
} from '../../../../interfaces/football.interface';
import { GameDaySettingsService } from '../settings/game-day-settings.service';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  public settings: FootballSettings;

  public gamedayLayerReferences: Array<GAMEDAY_LAYERS>;
  public showdownLayerReferences: Array<SHOWDOWN_LAYERS>;

  private _map: __esri.Map;
  private _view: __esri.MapView;

  constructor(
    private readonly env: EnvironmentService,
    private readonly moduleProvider: EsriModuleProviderService,
    private readonly mapService: EsriMapService,
    private readonly eventSettingsService: GameDaySettingsService
  ) {
    this.mapService.store.pipe(delay(250)).subscribe((instanced) => {
      this._map = instanced.map;
      this._view = instanced.view as __esri.MapView;
      this.init();
    });
  }

  public init() {
    this.settings = this.eventSettingsService.settings;
    this.gamedayLayerReferences = Object.entries(GAMEDAY_LAYERS).map(([, value]) => value);
    this.showdownLayerReferences = Object.entries(SHOWDOWN_LAYERS).map(([, value]) => value);

    const event = this.settings.event as SHOWDOWN_EVENT;

    this.drawEvent(event);
  }

  public async drawEvent(event: SHOWDOWN_EVENT) {
    try {
      let eventLayers: Array<GAMEDAY_LAYERS | SHOWDOWN_LAYERS>;

      if (event === SHOWDOWN_EVENT.YellPractice || event === SHOWDOWN_EVENT.ShowdownConcert) {
        eventLayers = this.showdownLayerReferences;
      } else if (event === SHOWDOWN_EVENT.ShowdownGame || event === SHOWDOWN_EVENT.BBQ) {
        eventLayers = this.gamedayLayerReferences;
      } else {
        throw new Error(`drawEvent: Event '${event}' not recognized.`);
      }

      const sources = eventLayers.map((ref) => this.getLayerSourceCopy(ref));

      if (sources.length > 0) {
        this.mapService.loadLayers(sources);
      } else {
        throw new Error('drawEvent: No layer sources found.');
      }
    } catch (err) {
      console.error(`Failed to draw ring day areas`, err);
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

  private makeSQLInStringList(list: Array<string>): string {
    return list.reduce((acc, curr, index, arr) => {
      acc += `'${curr}'`;

      if (index !== arr.length - 1) {
        acc += ',';
      }
      return acc;
    }, '');
  }

  /**
   * Converts an array of features into a list of attribute values.
   *
   * @returns Attribute value list
   */
  private getAttributeList(features: __esri.Graphic[], attribute: string): string[] {
    return features.map((f) => f.attributes[attribute]);
  }

  /**
   * Executes task with provided options.
   *
   * @param {string} url URL used to instantiate the Esri QueryTask class
   * @param {__esri.QueryProperties} query At minimum, requires `where` property
   * @param {*} [intersect] If true, the query will run with a `intersects` geometry context utilizing boundaries based on builder settings
   * This will return only features within the provided polygon paths.
   * @param {boolean} [returnFeatureLayer] If provided and `true`, will return a FeatureLayer from the result of the task
   * @returns Task result or feature layer
   */
  public async runTask(
    url: string,
    query: __esri.QueryProperties,
    intersect?: boolean | number[][] | __esri.Geometry,
    returnFeatureLayer?: false,
    featureLayerProperties?: __esri.FeatureLayerProperties
  ): Promise<__esri.FeatureSet>;
  public async runTask(
    url: string,
    query: __esri.QueryProperties,
    intersect?: boolean | number[][] | __esri.Geometry,
    returnFeatureLayer?: true,
    featureLayerProperties?: __esri.FeatureLayerProperties
  ): Promise<__esri.FeatureLayer>;
  public async runTask(
    url: string,
    query: __esri.QueryProperties,
    intersect?: boolean | number[][] | __esri.Geometry,
    returnFeatureLayer?: boolean,
    featureLayerProperties?: __esri.FeatureLayerProperties
  ): Promise<unknown> {
    const [QueryTask, Query, FeatureLayer, SpatialReference]: [
      __esri.QueryTaskConstructor,
      __esri.QueryConstructor,
      __esri.FeatureLayerConstructor,
      __esri.SpatialReferenceConstructor
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
