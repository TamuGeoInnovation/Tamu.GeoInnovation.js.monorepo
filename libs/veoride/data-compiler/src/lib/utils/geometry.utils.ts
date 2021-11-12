export class FeatureCollection {
  public type;
  public features;

  constructor() {
    this.type = 'FeatureCollection';
    this.features = [];
  }
}

export class LineStringFeature {
  public type;
  public geometry;
  public properties;

  constructor() {
    this.type = 'Feature';
    this.geometry = {};
    this.geometry.type = 'LineString';
    this.geometry.coordinates = [];
    this.properties = {};
  }

  /**
   * Adds provided coordinates to the array;
   *
   * @param {[]} coords Coordinate pair array
   * @memberof LineStringFeature
   */
  public addCoordinates(coords) {
    this.geometry.coordinates.push(coords);
  }

  /**
   * Adds a named property and value to the properties object
   *
   * @param {String} name Name of the property
   * @param {any} value Value of the property
   * @memberof LineStringFeature
   */
  public addProperty(name, value) {
    this.properties[name] = value;
  }
}

export class GeoJSONPoint {
  public type = 'Feature';
  public geometry = { type: 'Point', coordinates: [0, 0] };
  public properties = {};

  // tslint:disable-next-line: no-any
  constructor(properties: { latitude: number; longitude: number; properties: any }) {
    this.latitude = properties.latitude;
    this.longitude = properties.longitude;
    this.properties = { ...this.properties, ...properties.properties };
  }

  /**
   * Sets the latitude of the point geojson feature
   *
   * @memberof PointFeature
   */
  public set latitude(latitude: number) {
    this.geometry.coordinates[1] = latitude;
  }

  /**
   * Sets the longitude of the point geojson feature
   *
   * @memberof PointFeature
   */
  public set longitude(longitude: number) {
    this.geometry.coordinates[0] = longitude;
  }

  /**
   * Gets the longitude value for the point feature
   * @type {number}
   * @memberof PointFeature
   */
  public get longitude(): number {
    return this.geometry.coordinates[0];
  }

  /**
   * Gets the latitude value for the point feature
   *
   * @type {number}
   * @memberof PointFeature
   */
  public get latitude(): number {
    return this.geometry.coordinates[1];
  }

  public removeProperty(property: string) {
    if (this.properties.hasOwnProperty(property)) {
      delete this.properties[property];
    }
  }

  public toString(): string {
    return JSON.stringify({
      type: this.type,
      geometry: this.geometry,
      properties: this.properties
    });
  }
}