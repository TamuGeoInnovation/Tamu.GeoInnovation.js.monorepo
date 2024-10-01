import { Injectable } from '@angular/core';
import { delay } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';

import { RingDaySettings } from '../../../../interfaces/ring-day.interface';
import { RingDaySettingsService } from '../settings/ring-day-settings.service';

import esri = __esri;

const LayerReferences = {
  areas: 'ring-day-areas-layer',
  paths: 'ring-day-routes-layer',
  pois: 'ring-day-pois-layer'
};

@Injectable({
  providedIn: 'root'
})
export class EventService {
  public settings: RingDaySettings;

  private _map: esri.Map;
  private _view: esri.MapView;

  constructor(
    private readonly env: EnvironmentService,
    private readonly moduleProvider: EsriModuleProviderService,
    private readonly mapService: EsriMapService,
    private readonly settingsService: RingDaySettingsService
  ) {
    this.mapService.store.pipe(delay(250)).subscribe((instanced) => {
      this._map = instanced.map;
      this._view = instanced.view as esri.MapView;
      this.init();
    });
  }

  public init() {
    this.settings = this.settingsService.settings;

    this.drawAreas();
    this.drawPOIs();
    this.drawPaths();
  }

  public async drawAreas() {
    try {
      const source = this.getLayerSourceCopy(LayerReferences.areas) as FeatureLayerSourceProperties;
      const eventDateStart = this.settingsService.getMoveDateEventAsDate();

      if (source.native && eventDateStart) {
        // Set the hour of eventDateStart to 3AM since that's what the data uses as the start of the day
        eventDateStart?.setHours(3);

        const timeStartDefinitionExpression = this._getDateStartExpression(eventDateStart, this.settings.accessible);

        // Get features intersecting in user-selected zone
        const features = await this.runTask(source.url, { where: timeStartDefinitionExpression }, false);

        if (features.features.length > 0) {
          // Make list of object id's in user-selected zone.
          // This list will be used to make a new definition expression for the layer that will only display
          // provided objectID's
          const objectIdList = this.getAttributeList(features.features, 'OBJECTID');

          source.native.definitionExpression = `OBJECTID IN (${objectIdList.toString()})`;

          this.mapService.loadLayers([source as LayerSource]);
        }
      } else {
        throw new Error('drawAreas: No event date start found or invalid source.');
      }
    } catch (err) {
      console.error(`Failed to draw ring day areas`, err);
    }
  }

  /**
   * POI's to load
   */
  public async drawPOIs() {
    try {
      const source = this.getLayerSourceCopy(LayerReferences.pois) as FeatureLayerSourceProperties;
      const eventDateStart = this.settingsService.getMoveDateEventAsDate();

      if (source.native && eventDateStart) {
        // Set the hour of eventDateStart to 3AM since that's what the data uses as the start of the day
        eventDateStart?.setHours(3);

        // There are no accessible POI's in the data, so we don't need to filter them out
        // const timeStartDefinitionExpression = this._getDateStartExpression(eventDateStart, true);

        // POIs don't have a type field, so we can't filter them by type
        // We can only filter them by name, anything that does not have "%accessib%" in the title
        let expression;

        if (!this.settings.accessible) {
          expression = `name not like '%accessib%'`;
        } else {
          expression = '1=1';
        }
        const intersectingFeatures = await this.runTask(source.url, { where: expression }, false);

        if (intersectingFeatures.features.length > 0) {
          const objectIDList = this.getAttributeList(intersectingFeatures.features, 'OBJECTID');

          source.native.definitionExpression = `OBJECTID IN (${objectIDList.toString()})`;

          this.mapService.loadLayers([source as LayerSource]);
        }
      } else {
        throw new Error('drawPOIs: No event date start found or invalid source.');
      }
    } catch (err) {
      console.error(`Failed to draw POIs`, err);
    }
  }

  /**
   * Draws parking lots and surface lots
   *
   */
  public async drawPaths() {
    try {
      const source = this.getLayerSourceCopy(LayerReferences.paths) as FeatureLayerSourceProperties;
      const eventDateStart = this.settingsService.getMoveDateEventAsDate();

      if (source.native && eventDateStart) {
        // Set the hour of eventDateStart to 3AM since that's what the data uses as the start of the day
        eventDateStart?.setHours(3);

        // const timeStartDefinitionExpression = this._getDateStartExpression(eventDateStart, this.settings.accessible);

        const intersectingFeatures = await this.runTask(source.url, { where: '1=1' }, false);

        if (intersectingFeatures.features.length > 0) {
          const objectIDList = this.getAttributeList(intersectingFeatures.features, 'OBJECTID');

          source.native.definitionExpression = `OBJECTID IN (${objectIDList.toString()})`;

          this.mapService.loadLayers([source as LayerSource]);
        }
      } else {
        throw new Error('drawPaths: No event date start found or invalid source.');
      }
    } catch (err) {
      console.error(`Failed to draw parking`, err);
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
    const [QueryTask, Query, FeatureLayer, SpatialReference, Polygon]: [
      esri.QueryTaskConstructor,
      esri.QueryConstructor,
      esri.FeatureLayerConstructor,
      esri.SpatialReferenceConstructor,
      esri.PolygonConstructor
    ] = await this.moduleProvider.require(['QueryTask', 'Query', 'FeatureLayer', 'SpatialReference', 'Polygon']);

    const task = new QueryTask({
      url: url
    });

    const q = new Query();

    // Assign query default options.
    Object.assign(q, { returnGeometry: true, outFields: ['*'], outSpatialReference: new SpatialReference({ wkid: 4326 }) });

    // Assign provided query options.
    Object.assign(q, query);

    // if (intersect) {
    //   let polygon: esri.PolygonProperties;

    //   if (typeof intersect === 'boolean') {
    //     const existingBoundary = BOUNDARIES.find((b) => b.name == this.settings.residence.zone);

    //     if (existingBoundary && existingBoundary.paths) {
    //       polygon = { rings: [existingBoundary.paths] };
    //     } else {
    //       throw new Error('No existing boundary for provided residence zone.');
    //     }
    //   } else if (Array.isArray(intersect)) {
    //     polygon = { rings: [intersect] };
    //   } else if (typeof intersect === 'object' && intersect.toJSON) {
    //     polygon = intersect.toJSON();
    //   } else {
    //     throw new Error('Invalid intersect value. Must be boolean or number[][]');
    //   }

    //   q.geometry = new Polygon(polygon);
    //   q.spatialRelationship = 'intersects';
    // }

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

  /**
   * Formats a date object derived from an EventDate object into a string suitable for use in ArcGIS REST API queries.
   */
  private _formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  private _getDateStartExpression(date: Date, includeAda: boolean): string {
    let expression = `StartDate >= date '${this._formatDate(date)}'`;

    // If the user does not require ADA accommodations, the expression will be updated to exclude ADA types.
    if (!includeAda) {
      expression += ` AND type not like '%ada%'`;
    }

    return expression;
  }
}
