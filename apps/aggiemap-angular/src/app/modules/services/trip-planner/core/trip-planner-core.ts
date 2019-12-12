// Contains classes that are integral to the operation of the trip planner service.

import esri = __esri;

import { TripResultProperties } from '../trip-planner.service';

import { SearchResultBreadcrumbSummary } from '@tamu-gisc/search';

import { isCoordinatePair, parseCoordinates } from '@tamu-gisc/common/utils/geometry/generic';
import { getGeometryType, centroidFromGeometry } from '@tamu-gisc/common/utils/geometry/esri';

/**
 * Class encapsulating the values required for an instance of a trip request, and the result values.
 *
 *
 * @export
 * @class TripResult
 */
export class TripResult {
  public isError: TripResultProperties['isError'];
  public isProcessing: TripResultProperties['isProcessing'];
  public isFulfilled: TripResultProperties['isFulfilled'];
  public tryCount: TripResultProperties['tryCount'];
  public error: TripResultProperties['error'];
  public params: TripResultProperties['params'];
  public directions: TripResultProperties['directions'];
  public result: TripResultProperties['result'];
  public connection: TripResultProperties['connection'];
  public stops: TripResultProperties['stops'];
  public stopsSource: TripResultProperties['stopsSource'];
  public modeSource: TripResultProperties['modeSource'];
  public modeSwitches: TripResultProperties['modeSwitches'];
  public timeMode: TripResultProperties['timeMode'];
  public requestedTime: TripResultProperties['requestedTime'];

  constructor(props: TripResultProperties) {
    this.isError = props.isError || false;
    this.isProcessing = props.isProcessing || false;
    this.isFulfilled = props.isFulfilled || false;
    this.tryCount = props.tryCount || 1;
    this.error = props.error || undefined;
    this.params = props.params || undefined;
    this.directions = props.directions || undefined;
    this.result = props.result || undefined;
    this.connection = props.connection || undefined;
    this.stops = props.stops || undefined;
    this.stopsSource = props.stopsSource || undefined;
    this.modeSource = props.modeSource || undefined;
    this.modeSwitches = props.modeSwitches || undefined;
    this.timeMode = props.timeMode || undefined;
    this.requestedTime = props.requestedTime || undefined;
  }

  public stopsToArray(): number[][] {
    if (this.params.stops && (<esri.FeatureSet>this.params.stops).features) {
      return (<esri.FeatureSet>this.params.stops).features.map((f) => {
        if (f.geometry) {
          // Return a concatenated pipe separated string of latitude and longitude coordinates for reporting
          return [
            (<esri.Point>f.geometry).latitude ? (<esri.Point>f.geometry).latitude : 0,
            (<esri.Point>f.geometry).longitude ? (<esri.Point>f.geometry).longitude : 0
          ];
        }
      });
    } else {
      return [];
    }
  }
}

/**
 * Class that represents a trip planner endpoint geometry and attributes.
 *
 * @export
 * @class TripPoint
 */
export class TripPoint {
  public source: TripPointProperties['source'];
  public index: TripPointProperties['index'];
  public normalized: TripPointProperties['normalized'];
  public exportable: TripPointProperties['exportable'];

  public originAttributes: TripPointProperties['originAttributes'];
  public originGeometry: TripPointProperties['originGeometry'];
  public originParameters: TripPointProperties['originParameters'];

  public attributes: TripPointProperties['attributes'];
  public geometry: TripPointProperties['geometry'];

  /**
   * Creates an instance of TripPoint.
   *
   * Stores the geometry and dattributes that describe a trip endpoint
   *
   * @param {TripPointProperties} props
   * @memberof TripPoint
   */
  constructor(props: TripPointProperties) {
    this.source = props.source || '';
    this.index = props.index;
    this.normalized = false;
    this.exportable = props.exportable === undefined ? true : props.exportable;
    this.originAttributes = props.originAttributes || { name: '' };
    this.originGeometry = props.originGeometry || { latitude: 0, longitude: 0 };
    this.originParameters = props.originParameters || undefined;
  }

  /**
   * Normalize the origin attributes and geometry, preparing the object for trip calculations.
   *
   * This step is necessary because there are multiple feature input methods: search selection,
   * map point click, directions to here, url parameters
   *
   * @public
   */
  public normalize(): TripPoint {
    if (!this.normalized) {
      if (this.originAttributes || this.originGeometry || this.source) {
        // The stop instance would not ideally be mutated. Standardized properties will be copies
        // of data instead of data by reference, which should elminate unexpected mutation by
        // reference on the origin properties.

        if (
          this.source === 'query' ||
          this.source === 'url-query' ||
          this.source === 'search' ||
          this.source === 'directions-to-here'
        ) {
          // Deal with point from search selection.
          //
          // Attributes will be inherited from the origin attributes object
          //
          // Geometry will be derived from the origin attributes object. Origin geometry has paths which
          // is not useful for a stop unless the centroid is calculated.

          if (this.originAttributes) {
            if (this.originAttributes.Latitude && this.originAttributes.Longitude) {
              this.geometry = {
                latitude: parseFloat(this.originAttributes.Latitude),
                longitude: parseFloat(this.originAttributes.Longitude)
              };

              this.addTransformation({
                type: 'query',
                value: { ...this.geometry }
              });
            } else if (this.originGeometry.raw) {
              // If the point location of the feature is not found in the GIS data attributes, calculate as last resort.
              const point = centroidFromGeometry(this.originGeometry.raw);

              this.geometry = {
                latitude: point.latitude,
                longitude: point.longitude
              };

              this.addTransformation({
                type: 'centroid',
                value: { ...this.geometry }
              });
            } else if (
              this.originAttributes.name &&
              this.originAttributes.name.length > 0 &&
              isCoordinatePair(this.originAttributes.name)
            ) {
              this.geometry = parseCoordinates(this.originAttributes.name);

              this.addTransformation({
                type: 'raw-to-geometry',
                value: { ...this.geometry }
              });
            } else {
              this.geometry = {
                latitude: NaN,
                longitude: NaN
              };

              this.addTransformation({
                type: 'no-geometry',
                value: { ...this.geometry }
              });
            }

            // Try to find feature name from dictionary
            this.attributes = Object.assign({}, this.originAttributes, { name: this.findName() });

            if (!this.attributes.name || this.attributes.name.trim() === '') {
              if (isNaN(this.geometry.latitude) || isNaN(this.geometry.longitude)) {
                this.attributes.name = '';
              } else {
                this.attributes.name = `${this.geometry.latitude}, ${this.geometry.longitude}`;
              }
            }

            if (this.originParameters && !this.originParameters.value) {
              this.originParameters.value = {
                latitude: this.geometry.latitude,
                longitude: this.geometry.longitude
              };
            }
          }
        } else if (this.source === 'url-coordinates') {
          this.geometry = parseCoordinates(this.originAttributes.name);

          this.addTransformation({
            type: 'raw-to-geometry',
            value: { ...this.geometry }
          });

          // No need to check for name since we know we have it from url-coordinates processing
          this.attributes = { ...this.originAttributes };
        } else if (
          this.source === 'search-geolocation' ||
          this.source === 'coordinates' ||
          this.source === 'url-geolocation'
        ) {
          // Deal with point from geolocation through search selection
          //
          // Attributes will be inherited from the origin attributes object
          //
          // Geometry will be inherited from the origin geometry object

          this.geometry = {
            latitude: this.originGeometry.latitude,
            longitude: this.originGeometry.longitude
          };

          this.attributes = Object.assign({}, this.originAttributes, { name: this.findName() });
        } else if (this.source === 'map-event') {
          // Deal with point from map event (click) that does not include a feature Graphic
          // Attributes will be inherited from the origin attributes object
          // Gometry will be derived from the origin attributes object. Origin geometry has paths
          // which is not useful for a stop unless the centroid is calculated.

          this.geometry = {
            latitude: this.originGeometry.latitude,
            longitude: this.originGeometry.longitude
          };

          this.attributes = Object.assign({}, this.originAttributes, { name: this.findName() });
        }

        // Check that the normalized geometry values are valid numbers.
        // If they are not, then there will be errors adding them to map and executing a route task
        if (this.geometry && !isNaN(this.geometry.latitude) && !isNaN(this.geometry.longitude)) {
          this.normalized = true;
        }

        return this;
      } else {
        throw new Error('Could not normalize TripPoint because it is missing one or more properties.');
      }
    } else {
      console.warn('Trip point has already been normalized. Skipping this time.');
      return this;
    }
  }

  /**
   * Finds a user-readable name for the feature when normalizing it, if any exists.
   * This method uses a dictionary of possible keys in the origin attributes that could represent that name.
   * If one is found, the value will be returned.
   *
   * @private
   * @returns {string} User-readable feature name.
   * @memberof TripPoint
   */
  private findName(): string {
    // Dictionary of properties used to check if exist in any Trip Point origin attribute object,
    // to use as the TripPoint name.
    const featureNameKeyDictionary = ['name', 'bldgname', 'lotname'];

    if (this.originAttributes) {
      const key = Object.keys(this.originAttributes).find((k) => {
        return featureNameKeyDictionary.includes(k.toLowerCase());
      });

      // Name returned in order of preference:
      //
      // 1. If a key is found in the object, return it's value, else return basic lat/lon as name
      // 2. If #1 is not met, geometry exists, and geometry values are not NaN, use geometry values as display name
      // 3. If #1 and #2 are not met, return empty string.
      if (key && this.originAttributes[key] !== '') {
        return this.originAttributes[key];
      } else if (this.geometry && !isNaN(this.geometry.latitude) && !isNaN(this.geometry.longitude)) {
        return `${this.geometry.latitude.toFixed(4)}, ${this.geometry.longitude.toFixed(4)}`;
      } else {
        return '';
      }
    }
  }

  /**
   * Generates esri graphic properties utilizing the trip point normalized attributes and origin geometry.
   *
   * @returns {esri.Graphic}
   * @memberof TripPoint
   */
  public toEsriGraphic(): esri.Graphic {
    const attributes = { ...this.attributes };
    const geometry: Partial<esri.Geometry> = { ...this.originGeometry.raw };

    ((geometry as unknown) as { type: string }).type = getGeometryType(geometry);

    return <esri.Graphic>{
      geometry: geometry,
      attributes: attributes
    };
  }

  /**
   * Returns first matching key value from a dictionary of known unique identifier properties
   * and aliases (building name, building number).
   *
   * @returns {string}
   * @memberof TripPoint
   */
  public getIdentifier(): string {
    const attr = (this.attributes as unknown) as TripPointAttributesMaybeIdentifiable;
    if (attr.Number && attr.Number !== '') {
      // Test building number
      return attr.Number;
    } else if (attr.BldgAbbr && attr.BldgAbbr !== '') {
      // Test building abbreviation
      return attr.BldgAbbr;
    } else {
      // Default to lat/lon geometry
      return `${this.geometry.latitude},${this.geometry.longitude}`;
    }
  }

  /**
   * Applies a transformation to the instance origin params.
   *
   * Performs a simple check to test if the transformations since not all trip point will have
   * transformations applied to them.
   *
   * @param {TripPointOriginTransformationsParams} transformation
   * @memberof TripPoint
   */
  public addTransformation(transformation: TripPointOriginTransformationsParams) {
    if (!this.originParameters) {
      this.originParameters = {
        type: ''
      };
    }

    if (!this.originParameters.transformations) {
      this.originParameters.transformations = [];
    }

    this.originParameters.transformations.push(transformation);
  }
}

export interface TripPointAttributes {
  /**
   * Display name for the trip point used by the search component.
   *
   * A dictionary of properties that may exist in the attributes object.
   *
   * If a specific name is desired, set value for this property else at the time of trip point
   * normalization, the class will attempt to find a suitable name from known keys containing a name.
   *
   * @type {string}
   * @memberof TripPointAttributes
   */
  name: string;

  /**
   * String representation for latitude.
   *
   * Used in origin events where point geometry is found in the attributes (feature query results).
   *
   * This value will be parsed into a float type.
   *
   * If value is already parsed into float type, set in geometry object instead.
   *
   * @type {string}
   * @memberof TripPointAttributes
   */
  Latitude?: string;

  /**
   * String representation for longitude.
   *
   * Used in origin events where point geometry is found in the attributes (feature query results).
   *
   * This value will be parsed into a float type.
   *
   * If value is already parsed into float type, set in geometry object instead.
   *
   * @type {string}
   * @memberof TripPointAttributes
   */
  Longitude?: string;
}

export interface TripPointGeometry {
  /**
   * Float representation for latitude.
   *
   * Used and set in origin events where latitude is provided as a number type
   *
   * @type {number}
   * @memberof TripPointGeometry
   */
  latitude?: number;

  /**
   * Float representation for longitude.
   *
   * Used and set in origin events where longitude is provided as a number type
   *
   * @type {number}
   * @memberof TripPointGeometry
   */
  longitude?: number;

  /**
   * Raw geometry object container.
   *
   * For origin events that derive location from attributes (feature query results)
   * where preserving the result geometry (typically polygon) is desired, for additional processing for example.
   *
   * @type {esri.Geometry}
   * @memberof TripPointGeometry
   */
  raw?: esri.Geometry;
}

export interface TripPointOriginTransformationsParams {
  type: 'nearest-door' | 'query' | 'centroid' | 'raw-to-geometry' | 'no-geometry';

  value: string | TripPointGeometry;
}

/**
 * Object that describes pathway used to create trip point.
 *
 * @interface TripPointOriginParams
 */
export interface TripPointOriginParams {
  /**
   * Originating source for trip point.
   *
   * @memberof TripPointOriginParams
   */
  type: TripPointProperties['source'];

  /**
   * Origin value used in the creation of the trip point, before any transformations are applied.
   *
   * @type {string}
   * @memberof TripPointOriginParams
   */
  value?: string | TripPointGeometry | SearchResultBreadcrumbSummary;

  /**
   * List of applied transformations AFTER and NOT INCLUDING trip point normalization.
   *
   * @type {Array < TripPointOriginTransformationsParams >}
   * @memberof TripPointOriginParams
   */
  transformations?: Array<TripPointOriginTransformationsParams>;
}

/**
 * Trip point property descriptions. Used in the TripPoint class.
 *
 * @interface TripPointProperties
 */
export interface TripPointProperties {
  /**
   * Source id, depending on event type given that each has different objectstructures and data
   * types that need to be parsed.
   *
   * The following list of events are supported:
   *
   * - ` `: Only used to initialize or generate blank trip points.
   * - `search`: Search component dropdown suggestion selection. Expects suggestion coordinates.
   * - `search-geolocation`: Search component dropdown geolocation selection. Expects geolocation coordinates.
   * - `url-geolocation`: Geolocation API Coords, intialized by reserved url stops param keyword `@whereeveriam`.
   * - `map-event`: Map view click. Expects click coordinates.
   * - `query`: Any **ONE** feature result from a search service SearchResult instance.
   * - `url-query`: Any **ONE** feature result from a search service SearchResult instance, initialized by a search
   * term in the url stops param
   * - `coordinates`: Latitude and longitude values. Expects geolocation API Coords
   * - `url-coordinates`: Latitude and longitude string representation of Coords. Expects URL coordinate string value.
   * - `directions-to-here`: Feature popup "Directions to Here" button. Expects feature geometry.
   *
   * @type {string}
   * @memberof TripPointProperties
   */
  source:
    | ''
    | 'search'
    | 'search-geolocation'
    | 'url-geolocation'
    | 'map-event'
    | 'query'
    | 'url-query'
    | 'coordinates'
    | 'url-coordinates'
    | 'directions-to-here';

  /**
   * Trip points input components are reflected and generated from a TripPoint array.
   * Index is used to track which stop is being edited given componets are derived from
   * immutable objects and not references that are modified as such.
   *
   * In cases where there is a list of search components, the index of the component must be provided.
   *
   * @type {number}
   * @memberof TripPointProperties
   */
  index?: number;

  /**
   * Due to the nature of trip points being created from different object structures from
   * origin events, each trip point originAttributes and originGeometry gets processed and
   * standardized to ensure predictable properties for generic methods.
   *
   * A trip point will normalize if the source id reference is valid, and geometry is parsed successfully.
   *
   * @type {boolean}
   * @memberof TripPointProperties
   */
  normalized?: boolean;

  /**
   * When building a share-able URL trip, this property determines whether a particlar trip point will
   * be included in that construction.
   *
   * Default: `true`
   *
   * @type {boolean}
   * @memberof TripPointProperties
   */
  exportable?: boolean;

  /**
   * Staging object containing metadata attributes. In some events, the point geometry will
   * be found here and will need to be parsed from string to float.
   *
   * The display name, as one of many possible keys, is found in this object.
   *
   * This object is normalized into an attributes object.
   *
   * @type {TripPointAttributes}
   * @memberof TripPointProperties
   */
  originAttributes?: TripPointAttributes;

  /**
   * Staging object containing geomeetry data. In some events, geometry is in the form of polygons.
   * This is not useful for placing the center on a map unless the centroid is calculated. In these cases,
   * recommended to include the resulting geometry for potential calculations using it depending on origin event type.
   *
   * This object must contain point latitude and longitude values.
   *
   * This object is normalized into an geometry object.
   *
   * @type {TripPointGeometry}
   * @memberof TripPointProperties
   */
  originGeometry?: TripPointGeometry;

  /**
   * Describes the originating type and value used to instantiate the trip point.
   *
   * @type {TripPointOriginParams}
   * @memberof TripPointProperties
   */
  originParameters?: TripPointOriginParams;

  /**
   * originAttributes will be normalized and set in this object.
   *
   * `name` property will always be set and available, for use in UI reflection.
   *
   * All other provided properties will be inherited.
   *
   * @type {TripPointAttributes}
   * @memberof TripPointProperties
   */
  attributes?: TripPointAttributes;

  /**
   * originGeometry will be normalized and set in this object.
   *
   * Float latitude and logitude will be available.
   *
   * All other provided properties will remain and be inherited into the `raw` object
   *
   * @type {TripPointGeometry}
   * @memberof TripPointProperties
   */
  geometry?: TripPointGeometry;
}

interface TripPointAttributesMaybeIdentifiable extends TripPointAttributes {
  Number?: string;
  BldgAbbr?: string;
}
