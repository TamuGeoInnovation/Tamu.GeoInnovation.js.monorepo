import { Transform } from 'stream';

import * as Papa from 'papaparse';

import { GeoJSONPoint } from './geometry.utils';

export class Stringify extends Transform {
  public format: 'json' | 'csv' | 'geojson';
  private _index = 0;

  /**
   * Converts an object to a string.
   *
   * Supports output format as regular stringified JSON or CSV
   *
   * @export
   * @class Stringify
   * @extends {Transform}
   */
  constructor(format?: 'json' | 'csv') {
    super({ objectMode: true });

    // If no format specified, default to json
    this.format = format || 'json';
  }

  public _transform(chunk, encoding, callback) {
    if (this.format === 'json') {
      // Chunk JSON will be appended
      let json = '';

      // If the chunk item is the first, open the array.
      if (this._index === 0) {
        json += '[';
      }

      // Append a JSON object delimiter at the beginning of each stream chunk if
      // it's not the first chunk in the stream.
      if (this._index > 0) {
        json += ',';
      }

      // Append stringified JSON.
      json += JSON.stringify(chunk);
      this.push(json);
    } else if (this.format === 'geojson') {
      let json = '';
      // If the chunk item is the first, open the GeoJSON feature collection.
      if (this._index === 0) {
        json += `{
          "type": "FeatureCollection",
          "features": [`;
      }

      // Append a JSON object delimiter at the beginning of each stream chunk if
      // it's not the first chunk in the stream.
      if (this._index > 0) {
        json += ',';
      }

      const point = new GeoJSONPoint({
        latitude: chunk.lat,
        longitude: chunk.lon,
        properties: chunk
      });

      point.removeProperty('lat');
      point.removeProperty('lon');

      json += point.toString();

      this.push(json);
    } else if (this.format === 'csv') {
      // If chunk is an array, pass it in as is. If it is a single non-array item,
      // wrap it in an array.
      let csv = Papa.unparse(Array.isArray(chunk) ? chunk : [chunk], {
        newline: '\r\n',
        header: this._index === 0
      });

      // Papa parse will not insert a newline statement if the array length is less than or equal to 1.
      // Because of this, the CSV will be incorrectly formatted if all processed items meet the
      // aforementioned condition.
      //
      // If they are, append newline and carriage return characters.
      if (!Array.isArray(chunk)) {
        csv += '\r\n';
      }

      this.push(csv);
    }

    this._index++;
    callback();
  }

  public _final(callback) {
    // If the stream terminates before being allowed to insert the array opening bracket, add
    // it in order for the response to be valid json.
    if (this.format === 'json' && this._index === 0) {
      this.push('[');
    }

    if (this.format === 'geojson' && this._index === 0) {
      this.push(`{
        "type": "FeatureCollection",
        "features": [`);
    }

    // On the final element, close off the stream array.
    if (this.format === 'json') {
      this.push(']');
    }

    // On the final element, close off the stream array.
    if (this.format === 'geojson') {
      this.push(']}');
    }

    if (this.format === 'csv' && this._index === 0) {
      this.push('0 rows');
    }
    callback();
  }
}
