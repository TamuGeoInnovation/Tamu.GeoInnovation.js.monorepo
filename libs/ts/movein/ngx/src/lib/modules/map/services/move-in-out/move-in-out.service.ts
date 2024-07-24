import { Injectable } from '@angular/core';
import { delay } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { CompoundOperator, makeWhere } from '@tamu-gisc/common/utils/database';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';

import { MoveDate, MoveDates, MoveEventType, MoveInSettings } from '../../../../interfaces/move-in-out.interface';
import { BOUNDARIES } from '../../../../dictionaries/move-in-out.dictionary';
import { MoveInOutSettingsService } from '../move-in-out-settings/move-in-out-settings.service';

import esri = __esri;

const LayerReferences = {
  residence: 'residence-layer',
  noParking: 'no-parking-layer',
  personalEngraving: 'personal-engraving-layer',
  busStops: 'move-in-bus-stops-layer',
  refreshments: 'move-in-info-layer',
  recycle: 'recycle-layer',
  parkingLots: 'move-in-parking-lots-layer',
  parkingStreets: 'move-in-parking-streets-layer',
  accessible: 'accessible-parking-spaces-layer',
  checkin: 'move-in-out-checkin-layer',
  dining: 'dining-areas-layer'
};

@Injectable({
  providedIn: 'root'
})
export class MoveinOutService {
  public settings: MoveInSettings;
  public days: MoveDates = this.mioSettings.days;

  private _map: esri.Map;
  private _view: esri.MapView;

  constructor(
    private readonly env: EnvironmentService,
    private readonly moduleProvider: EsriModuleProviderService,
    private readonly mapService: EsriMapService,
    private readonly mioSettings: MoveInOutSettingsService
  ) {
    this.mapService.store.pipe(delay(250)).subscribe((instanced) => {
      this._map = instanced.map;
      this._view = instanced.view as esri.MapView;
      this.init();
    });
  }

  public init() {
    this.settings = this.mioSettings.settings;

    this.drawResidence();
    this.drawParking();
    this.drawAccessibleParkingSpaces();
    this.drawPOIs();
  }

  /**
   * Returns MoveDates for either move-in or move-out event.
   */
  public getDaysForType(type: MoveEventType) {
    if (this.days && this.days[type] && this.days[type].length > 0) {
      return this.days[type];
    } else {
      console.warn(`No move dates found for ${type} event.`);
      return undefined;
    }
  }

  /**
   * Returns the move-in/out date object for the provided matching calendar day (find operation)
   */
  public getDateForDay(type: MoveEventType, day: number | string) {
    if (this.days[type]?.length > 0) {
      return this.days[type].find((d) => d.day == day);
    } else {
      console.warn(`No move date for provided '${type}' type and '${day}' day.`);
      return undefined;
    }
  }

  /**
   * Returns the first move in/out MoveDate object or the provided event type.
   */
  public getFirstMoveDate(type: MoveEventType) {
    return this.getDaysForType(type)?.[0];
  }

  /**
   * Accepts a move event type and a MoveDate object and determines the index of the `date` object relative to the
   * event type's MoveDates array.
   */
  public getMoveDateEventDayNumber(type: MoveEventType, date: MoveDate) {
    const dates = this.getDaysForType(type);

    if (dates) {
      return dates.findIndex((d) => d.day == date.day) + 1;
    } else {
      console.warn(`No move dates found for ${type} event.`);
      return undefined;
    }
  }

  public getMoveDateEventDayNumberForSettings() {
    const savedDate = this.getDateForDay('in', parseInt(this.settings.date));

    if (savedDate) {
      return this.getMoveDateEventDayNumber('in', savedDate);
    } else {
      console.warn(`No move date found for settings date.`);
      return undefined;
    }
  }

  /**
   * Returns the move-in/out date as a Date object for the provided MoveDate object.
   *
   * Optionally provide a date object. Settings date will be used if not provided.
   */
  public getMoveDateEventAsDate(type: MoveEventType, date?: MoveDate) {
    const savedDate = this.getDateForDay(type, date ? date.day : parseInt(this.settings.date));

    if (savedDate) {
      return new Date(new Date().getFullYear(), savedDate.month - 1, savedDate.day);
    } else {
      console.warn(`No event day found for provided date.`);
      return undefined;
    }
  }

  public async drawResidence() {
    try {
      const source = this.getLayerSourceCopy(LayerReferences.residence) as FeatureLayerSourceProperties;

      const buildingListString = this.makeSQLInStringList(this.settings.residence.Bldg_Number);

      if (source.native) {
        source.native.definitionExpression = `Bldg_Number IN (${buildingListString})`;
      }

      // Add the residence layer
      this.mapService.loadLayers([source as LayerSource]);

      // Once view is ready, zoom to the boundary.
      this._view.when(async () => {
        const boundary = BOUNDARIES.find((b) => b.name == this.settings.residence.zone);

        if (boundary) {
          const [Polygon, Graphic]: [esri.PolygonConstructor, esri.GraphicConstructor] = await this.moduleProvider.require([
            'Polygon',
            'Graphic'
          ]);

          const boundaryGraphic = new Graphic({
            geometry: new Polygon({
              rings: [boundary.paths]
            })
          });

          this.mapService.zoomTo({ graphics: [boundaryGraphic], zoom: 18 });
        }
      });
    } catch (err) {
      console.error(`Failed to draw residence`, err);
    }
  }

  public async drawAccessibleParkingSpaces() {
    try {
      if (this.settings.accessible) {
        const source = this.getLayerSourceCopy(LayerReferences.accessible) as FeatureLayerSourceProperties;

        if (source.native) {
          // Get features intersecting in user-selected zone
          const features = await this.runTask(source.url, { where: source.native.definitionExpression }, true);

          if (features.features.length > 0) {
            // Make list of object id's in user-selected zone.
            // This list will be used to make a new definition expression for the layer that will only display
            // provided objectID's
            const objectIdList = this.getAttributeList(features.features, 'OBJECTID');

            source.native.definitionExpression = `OBJECTID IN (${objectIdList.toString()})`;

            this.mapService.loadLayers([source as LayerSource]);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to draw parking spaces`, err);
    }
  }

  /**
   * POI's to load include:
   *  - No Parking Locations
   *  - Personal Engraving Stations
   *  - Shuttle Bus Stops
   *  - Refreshment stations
   *  - Recycling stations
   */
  public async drawPOIs() {
    try {
      const references = [
        LayerReferences.noParking,
        LayerReferences.personalEngraving,
        LayerReferences.busStops,
        LayerReferences.refreshments,
        LayerReferences.recycle,
        LayerReferences.checkin,
        LayerReferences.dining
      ];

      const processes = references.map(async (reference) => {
        const source = this.getLayerSourceCopy(reference) as FeatureLayerSourceProperties;

        if (source.native) {
          const intersectingFeatures = await this.runTask(source.url, { where: source.native.definitionExpression }, true);

          if (intersectingFeatures.features.length > 0) {
            const objectIDList = this.getAttributeList(intersectingFeatures.features, 'OBJECTID');

            source.native.definitionExpression = `OBJECTID IN (${objectIDList.toString()})`;

            this.mapService.loadLayers([source as LayerSource]);
          }
        }
      });

      Promise.allSettled(processes);
    } catch (err) {
      console.error(`Failed to draw POIs`, err);
    }
  }

  /**
   * Draws parking lots and surface lots
   *
   */
  public async drawParking() {
    try {
      const eventDayStart = this.getFirstMoveDate('in')?.day;

      if (eventDayStart === undefined) {
        throw new Error('No event day start found.');
      }

      // User selected event attendance day
      const day = parseInt(this.settings.date);

      // Moveindays table has a series of columns for each event day from (1 to n).
      // The columns are prefixed `Day_`.
      // Each column specifies the type of parking for the given feature on the event day.
      //
      // To generate the proper SQL query, the user-selected attendance event date has to be related
      // to the correct column.
      const dateSuffix = day - eventDayStart + 1;

      const parkingCategories = ['Free', 'Paid', '1HR DZ w P', '1HR Drop', 'SSG', 'Free 6-9', 'NoParking', 'LSP Req'];

      if (this.settings.accessible) {
        parkingCategories.push('Disabled');
      }

      // Executing query will return a list of parking features that should be drawn.
      //
      // The resulting features will be a mix of lots, decks, and street parking.
      // Lots and decks both have a CIT_CODE which can be used against the MoveInLots table
      // to get their geometry.
      //
      // The move-in streets service does not contain the CIT_CODES from the MoveInDays table, so it is not possible
      // to get geometries for street parking. Move-in streets only has street names, so a lookup using a wildcard expression
      // will be used to get their geometries.

      const operator: CompoundOperator = {
        comparison: '=',
        logical: 'OR'
      };

      const query = {
        where: makeWhere(
          Array(parkingCategories.length).fill(`Day_${dateSuffix}`),
          parkingCategories,
          Array(parkingCategories.length).fill(operator)
        )
      };

      const connections = this.env.value('Connections', false)?.['moveInOutDaysTable'];

      // Execute query task
      const parkingForDay = await this.runTask(`${connections}`, query);

      if (parkingForDay.features.length > 0) {
        // Pull the CIT_CODE for every feature in the result. This list will include features that are not decks or lots
        // but the arcgis api will only filter out the features in the movein lots table.
        const decksLotsCitCodes = this.getAttributeList(parkingForDay.features, 'CIT_Code');

        // TODO: Lots and decks will be loaded from a local dictionary. This logic might be useful for a next event.
        // There were several complications with missing features in the tables.
        //
        // The following creates the CIT_CODES used as the value of an "IN" SQL expression.
        // More efficient than a series of "OR"'s for a list of items.
        const citCodesString = this.makeSQLInStringList(decksLotsCitCodes);

        // Get a copy of the parking lot source defined in environments
        // Used to pluck values for feature layer instantiation.
        const source = this.getLayerSourceCopy(LayerReferences.parkingLots) as FeatureLayerSourceProperties;

        const parkingLotsIntersected = await this.runTask(
          source.url,
          { where: `GIS.TS.ParkingLots.CIT_CODE IN (${citCodesString})` },
          true
        );

        const featureLayerSource = parkingLotsIntersected.features.reduce((acc, curr) => {
          // For the current intersected parking feature, get the MoveInDay entry which has the valid move-in type
          const moveInDayFeature = parkingForDay.features.find((f) => {
            return f.attributes.CIT_Code == curr.attributes['GIS.TS.ParkingLots.CIT_CODE'];
          });

          if (moveInDayFeature) {
            const feature = {
              attributes: {
                ...moveInDayFeature.attributes,
                type: moveInDayFeature.attributes[`Day_${dateSuffix}`].trim()
              },
              geometry: curr.geometry.clone()
            };

            return [...acc, feature];
          } else {
            return acc;
          }
        }, [] as esri.CollectionProperties<esri.GraphicProperties>);

        // We are adding the parking lots layer from client-side graphics.
        const typeField = { name: 'type', type: 'string' } as esri.FieldProperties;

        if (source.native) {
          if (source.url) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (source as any).url;
          }
          source.native.fields = [...parkingForDay.fields, typeField];
          source.native.source = featureLayerSource;

          this.mapService.loadLayers([source as LayerSource]);
        }

        //
        // Add street parking by simply display lzallweek, lzsundayonly (meaning full weekend, oddly enough), or both.
        //

        const streetParkingSource = this.getLayerSourceCopy(LayerReferences.parkingStreets) as FeatureLayerSourceProperties;

        const dateFilter =
          parseInt(this.settings.date) >= 17 && parseInt(this.settings.date) <= 18
            ? `'LZAllWeek', 'LZSundayOnly'`
            : `'LZAllWeek'`;

        const intersectingStreets = await this.runTask(
          streetParkingSource.url,
          { where: `Event IN ('mi', 'mio') AND Type IN (${dateFilter})` },
          true
        );

        if (intersectingStreets.features.length > 0) {
          const objectIDList = this.getAttributeList(intersectingStreets.features, 'OBJECTID');

          if (streetParkingSource.native !== undefined) {
            streetParkingSource.native.definitionExpression = `OBJECTID IN (${objectIDList.toString()})`;

            this.mapService.loadLayers([streetParkingSource as LayerSource]);
          }
        }
      } else {
        console.warn(`No parking lots for event day ${dateSuffix}.`);
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

  private getLayerSourcePopupReference(reference: string) {
    const sources: Array<LayerSource> = this.env.value('ColdLayerSources', false);
    const root = sources.find((s) => s.id == reference);

    if (root && root.popupComponent) {
      return root.popupComponent;
    } else {
      console.error(`Popup component reference '${reference}' not found.`);

      return undefined;
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

    if (intersect) {
      let polygon: esri.PolygonProperties;

      if (typeof intersect === 'boolean') {
        const existingBoundary = BOUNDARIES.find((b) => b.name == this.settings.residence.zone);

        if (existingBoundary && existingBoundary.paths) {
          polygon = { rings: [existingBoundary.paths] };
        } else {
          throw new Error('No existing boundary for provided residence zone.');
        }
      } else if (Array.isArray(intersect)) {
        polygon = { rings: [intersect] };
      } else if (typeof intersect === 'object' && intersect.toJSON) {
        polygon = intersect.toJSON();
      } else {
        throw new Error('Invalid intersect value. Must be boolean or number[][]');
      }

      q.geometry = new Polygon(polygon);
      q.spatialRelationship = 'intersects';
    }

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
