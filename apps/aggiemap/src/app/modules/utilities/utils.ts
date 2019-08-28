import { Observable, from } from 'rxjs';
import { default as tCentroid } from '@turf/centroid';
import { polygon as tPolygon } from '@turf/helpers';

import { TripPointGeometry } from '../services/trip-planner/core/trip-planner-core';
import { TemplateRendererOptions, Point } from '../../types/types';
import { ActivatedRouteSnapshot } from '@angular/router';

import * as gju from 'geojson-utils';
import esri = __esri;

/**
 * Determines whether the supplied number is even.
 *
 * @param {number} number Non-float number
 * @returns {boolean} True if is even, false if is odd
 */
export function isEven(number: number): boolean {
  return number % 2 == 0;
}

/**
 * Gets a random number between two numbers, including them.
 *
 * @export
 * @param {number} min Minimum value
 * @param {number} max Maximum value
 * @returns Random number
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Tracks focus within an element. Used in dialogs which view visibility is true only
 * if any of children elements have focus. The parent element receives a class and visibility
 * is set with CSS.
 *
 * Disables focus altogether with SPACE, ENTER, and ESCAPE keys
 *
 * @param {*} e Event object
 * @param {*} target HTMLElement property. In most cases, it is 'parentElement'
 */
export function trackFocus(e, target) {
  // Set the target element
  const el = e.currentTarget[target];

  // Add class to input parent element to show results dropdown
  el.classList.add('focusing');

  const removeFocus = () => {
    el.classList.remove('focusing');
    clearTimeout(timer);
  };

  // Every 100ms check if the currently focused element exists within the parent element "el".
  // If it does not, remove focus from dialog, hiding it
  const timer = setInterval(() => {
    const focusedElement = document.activeElement;
    if (!el.contains(focusedElement)) {
      removeFocus();
    }
  }, 100);

  // Add tracking classes to keep track of added event listener to prevent adding duplicates
  if (!el.classList.contains('keydown-listen')) {
    // If a selection is made with ENTER or SPACE OR ESCAPE key is pressed, remove focus
    el.addEventListener('keydown', (event) => {
      const dismissKeyCodes = [13, 32, 27];

      if (dismissKeyCodes.includes(event.keyCode)) {
        if (event.target != e.target) {
          removeFocus();
        }
      }
    });

    el.classList.add('keydown-listen');
  }

  // Add tracking classes to keep track of added event listener to prevent adding duplicates
  if (!el.classList.contains('mousedown-listen')) {
    // If left-mouse click on a dropdown suggestion, remove focus from dialog, hiding it
    el.addEventListener('mousedown', (event) => {
      if (event.button == 0) {
        if (event.target != e.target) {
          removeFocus();
        }
      }
    });

    el.classList.add('mousedown-listen');
  }
}

/**
 * Adds arrow key navigation to non-native select-option elements. Focuses next or previous based on key pressed
 *
 * @param {*} e Event object
 * @param {*} action Action to take place. Only 'focus' is currently supported
 * @param {*} target DOM selector for which the action should happen
 */
export function arrowKeyControl(e: KeyboardEvent, action: string, target: string): void {
  // Catch up and down arrow keys
  if ([38, 40].includes(e.keyCode)) {
    if (action == 'focus') {
      const elementList = Array.from((<HTMLElement>e.currentTarget).parentElement.querySelectorAll(target));

      const indexOfFocused = elementList.findIndex((element) => {
        return element == document.activeElement;
      });

      if (indexOfFocused > -1) {
        if (e.keyCode == 40) {
          if (indexOfFocused < elementList.length - 1) {
            (<any>elementList[indexOfFocused + 1]).focus({ preventScroll: false });
          }
        } else if (e.keyCode == 38) {
          if (indexOfFocused > 0) {
            (<any>elementList[indexOfFocused - 1]).focus({ preventScroll: false });
          } else {
            (<HTMLElement>(<HTMLElement>e.currentTarget).parentElement.querySelector('.input-action-container input')).focus(
              { preventScroll: false }
            );
          }
        }
      } else if (elementList.length > 0 && e.keyCode == 40) {
        (<any>elementList[0]).focus({ preventScroll: false });
      }
    }
  }
}

/**
 * Determine geometry type based on geometry properties
 *
 * Possible return values:
 *
 * - Point
 * - Multipoint
 * - Polygon
 * - Polyline
 *
 * @export
 * @param {esri.Geometry} geometry String representing geometry type.
 * @returns {string}
 */
export function getEsriGeometryType(geometry: esri.Geometry): string;
export function getEsriGeometryType(geometry: any): any {
  if (geometry) {
    if ((geometry.latitude && geometry.longitude) || (geometry.y && geometry.x)) {
      return 'point';
    } else if (geometry.points) {
      return 'multipoint';
    } else if (geometry.rings) {
      return 'polygon';
    } else if (geometry.paths) {
      return 'polyline';
    } else {
      throw new Error('Could not resolve geometry type.');
    }
  } else {
    throw new Error('Could not determine geometry type because geometry was not provided.');
  }
}

/**
 * Gets user geolocation if user allows.
 *
 * @returns {Promise < Coordinates > | Observable <Coordinates>}
 */
export function getGeolocation(asObservable?: false): Promise<Coordinates>;
export function getGeolocation(asObservable?: true): Observable<Coordinates>;
export function getGeolocation(asObservable?: any): Promise<any> | Observable<any> {
  const promise: Promise<Coordinates> = new Promise((r, rj) => {
    window.navigator.geolocation.getCurrentPosition(
      (e) => {
        r(e.coords);
      },
      (err) => {
        rj(err);
      }
    );
  });

  if (asObservable) {
    return from(promise);
  } else {
    return promise;
  }
}

/**
 * Attempts to determine a singular point (latitude and longitude) utilizing
 * a provided TripPoint raw geometry object.
 *
 * @export
 * @param {esri.Geometry} feature Esri geometry
 * @returns {Point}
 */
export function centroidFromEsriGeometry(
  feature: esri.Geometry | esri.Polygon | esri.Multipoint | esri.Point | esri.Polyline
): Point;
export function centroidFromEsriGeometry(feature: any): Point {
  if (feature.rings) {
    // If geometry is polygon
    return centroidFromEsriPolygonGeometry(feature);
  } else if (feature.points) {
    // If geometry is a multipoint set
    return pointFromEsriMultiPointGeometry(feature);
  } else if ((feature.x && feature.y) || (feature.latitude && feature.longitude)) {
    return pointFromEsriPointGeometry(feature);
  } else if (feature.paths) {
    return pointFromEsriPolylineGeometry(feature);
  } else {
    throw new Error('Could not get centroid from search geometry because type could not be identified.');
  }
}

/**
 * Using Turf.js, attempts to calculate the centroid from an esri query feature set graphic.
 *
 * This is due tot he fact that esri query feature set graphics only contain rings, for polygons.
 *
 * @export
 * @param {esri.Graphic} feature
 * @returns {Point}
 */
export function centroidFromEsriPolygonGeometry(feature: esri.Polygon): Point {
  if (feature.centroid && feature.centroid.latitude && feature.centroid.longitude) {
    return {
      latitude: feature.centroid.latitude,
      longitude: feature.centroid.longitude
    };
  } else if (feature.rings) {
    // Result type is a Turf Point
    const p: any = tCentroid(tPolygon([...(<esri.Polygon>feature).rings]));

    if (p && p.geometry && p.geometry.coordinates) {
      return {
        latitude: p.geometry.coordinates[1],
        longitude: p.geometry.coordinates[0]
      };
    } else {
      return undefined;
    }
  } else {
    throw new Error('Feature provided does not contain rings.');
  }
}

export function pointFromEsriMultiPointGeometry(feature: esri.Multipoint): Point {
  if (feature.points && feature.points.length > 0) {
    // Get the first point in the feature
    const p: any = feature.points[0];

    return {
      latitude: p[1],
      longitude: p[0]
    };
  } else {
    throw new Error('Feature provided does not contain points.');
  }
}

export function pointFromEsriPointGeometry(feature: esri.Point): Point {
  if (feature && feature.x && feature.y) {
    return {
      latitude: feature.y,
      longitude: feature.x
    };
  } else if (feature && feature.longitude && feature.latitude) {
    return {
      latitude: feature.latitude,
      longitude: feature.longitude
    };
  } else {
    throw new Error('Feature provided does not have x or y.');
  }
}

export function pointFromEsriPolylineGeometry(feature: esri.Polyline): Point {
  if (feature && feature.paths) {
    return {
      latitude: feature.extent.center.latitude,
      longitude: feature.extent.center.longitude
    };
  } else {
    throw new Error('Feature provided does not contain paths.');
  }
}

/**
 * Calculates the relative distance of a collection of points relative to a reference.
 *
 * @export
 * @param {Point} reference Reference point used to calculated distance fromt/to
 * @param {any[]} points Collection of points.
 * @returns {number[]} Calculated distances.
 */
export function relativeDistance(reference: Point, points: any[]): number[] {
  const distances = points.reduce((acc, curr, index) => {
    const ret = { ...curr } as any;

    const currGeometry = centroidFromEsriGeometry(curr.geometry);

    const distance = gju.pointDistance(
      { type: 'Point', coordinates: [reference.longitude, reference.latitude] },
      { type: 'Point', coordinates: [currGeometry.longitude, currGeometry.latitude] }
    );

    return [...acc, distance];
  }, []);

  return distances;
}

/**
 * Returns the index of the smallest value from a collection of numbers.
 *
 * @export
 * @param {number[]} numbers
 * @returns {number}
 */
export function getSmallestIndex(numbers: number[]): number {
  // Get the smallest number in the provided collection.
  const smallest = Math.min(...numbers);

  // Find the index of the first ocurrence of the smallest number in the provided
  // collection.
  const index = numbers.findIndex((n) => n == smallest);

  return index;
}

/**
 * Determines the index of the nearest feature to a static reference from a collection of centroid points.
 *
 * @export
 * @param {Point} reference
 * @param {{ geometry: Point }[]} centroids
 * @returns {esri.Graphic}
 */
export function findNearestIndex(reference: Point, centroids: { geometry: Point }[]): number {
  const distances = relativeDistance(
    {
      latitude: reference.latitude,
      longitude: reference.longitude
    },
    centroids
  );

  return getSmallestIndex(distances);
}

/**
 * Attempts to find if a property exists in an object.
 *
 * If value exists, return it. Otherwise, return undefined
 *
 * Supports dot notation.
 *
 * @export
 * @param {object} lookup Source object
 * @param {string} property Dot notation string representing the location of the property
 * @returns {*}
 */
export function getObjectPropertyValue(lookup: object, property: string): any {
  if (!lookup || !property) {
    return undefined;
  }

  const path = property.split('.');
  let value = JSON.parse(JSON.stringify(lookup));

  if (path.length == 0) {
    return undefined;
  }

  // Recursively test if the next item in the properties array exists in the lookup object.
  // If the property exists, replace the current value and repeat until all path keys are
  // exhausted or until the key no longer exists.
  path.forEach((prop, index) => {
    if (!value) {
      return value;
    }

    if (value[prop] !== undefined) {
      value = value[prop];
    } else {
      value = undefined;
    }
  });

  return value;
}

/**
 * Accepts and array of dot notation object properties and retrieves the values from the obj.
 *
 * Returns either a string array of values if `join` is not provided or false.
 *
 * Returns a concatenated value string if `join` is provided AND is true.
 *
 * @export
 * @param {object} lookup
 * @param {string[]} properties
 * @param {boolean} [join]
 * @returns {string}
 */
export function getObjectPropertyValues(lookup: object, properties: string[], join?: false): string[];
export function getObjectPropertyValues(lookup: object, properties: string[], join?: true): string;
export function getObjectPropertyValues(lookup: any, properties: any, join?: any): any {
  const values = properties.map((property) => getObjectPropertyValue(lookup, property));

  if (join) {
    return values.join(' ');
  } else {
    return values;
  }
}

/**
 * Rendering class able to accept a single string and replace values between and including double curly
 * braces {{ }} with provided value.
 *
 * Also capable of rendering a template string based on a provided object property.
 *
 * @export
 * @class TemplateRenderer
 */
export class TemplateRenderer {
  public template: TemplateRendererOptions['template'];
  public lookup: TemplateRendererOptions['lookup'];
  public replacement: TemplateRendererOptions['replacement'];

  /**
   * Creates an instance of TemplateRenderer.
   *
   * Rendering class able to accept a single string and replace values between and including double curly
   * braces {{ }} with provided value.
   *
   * Also capable of rendering a template string based on a provided object property.
   *
   * @param {TemplateRendererOptions} props
   * @memberof TemplateRenderer
   */
  constructor(props: TemplateRendererOptions) {
    this.template = props.template || undefined;
    this.lookup = props.lookup || undefined;
    this.replacement = props.replacement || undefined;
  }

  /**
   * Evaluates and returns an evaluated template string based on provided options.
   *
   * @returns {string}
   * @memberof TemplateRenderer
   */
  public render(): string {
    if (this.template && this.replacement) {
      return this.template.replace(/\{{.*?\}}/g, (match: string, index: number, orig: string) => {
        // Replace captured block with the provided replacement string.
        return this.replacement;
      });
    } else if (this.template && this.lookup) {
      return this.template.replace(/\{{.*?\}}/g, (match: string, index: number, orig: string) => {
        // Remove template braces before setting value from lookup object.
        return getObjectPropertyValue(this.lookup, match.replace('{{', '').replace('}}', ''));
      });
    }
  }
}

/**
 * Returns a string segment array representing the current path route from the app root.
 *
 * @param {ActivatedRouteSnapshot} snapshot
 * @returns {string}
 */
export function getPathFromRouteSnapshot(snapshot: ActivatedRouteSnapshot): string[] {
  return snapshot.pathFromRoot
    .map((route) => {
      return route.routeConfig && route.routeConfig.path ? route.routeConfig.path : undefined;
    })
    .filter((segment) => segment);
}

/**
 * Returns a new array with a substituted matched path segment, if it exists, from a path string segment array..
 *
 * Example:
 *
 * `/map/d/trip` => `/map/m/trip`
 *
 * @param {Array < string >} list Path segment array
 * @param {string} match Matching path segment
 * @param {string} substitution Substitute path segment if match is found
 * @returns
 */
export function routeSubstitute(list: Array<string>, match: string, substitution: string) {
  const l = [...list];
  const matchIndex = list.findIndex((listItem) => listItem == match);

  if (matchIndex > -1) {
    l[matchIndex] = substitution;
    return l;
  } else {
    return l;
  }
}

/**
 * Tests if a given search input string is a coordinate pair.
 *
 * @private
 * @param {string} input Input string
 * @returns {boolean} True if string is coordinate pair, false if not
 * @memberof SearchComponent
 */
export function isStringCoordinates(input: string): boolean {
  let ret = false;

  if (input.includes(',')) {
    const set = input.split(',');

    if (set.length != 2) {
      return;
    }

    ret = !isNaN(parseFloat(set[0].trim())) && !isNaN(parseFloat(set[1].trim()));
  }

  return ret;
}

/**
 * Converts a coordindate string into TripPointGeometry.
 *
 * First number is assumed latitude.
 *
 * Second number is assumed longitude.
 *
 * @export
 * @param {string} input Coordinate pair string
 * @returns {TripPointGeometry}
 */
export function coordinatesFromString(input: string): TripPointGeometry {
  return {
    latitude: parseFloat(input.split(',')[0].trim()),
    longitude: parseFloat(input.split(',')[1].trim())
  };
}

/**
 * Simple SQL builder for use in Esri services.
 *
 * Includes a uppercase key transformation, as well as automatically uppercasing values.
 *
 * @export
 * @param {string[]} keys
 * @param {string[]} values
 * @param {string[]} operators
 * @param {string[]} wildcards
 * @returns
 */
export function makeWhereClause(
  keys: string[],
  values: string[],
  operators: string[],
  wildcards?: string[],
  transformations?: string[]
) {
  // Wildcards container. This will either be generated in-function or be provided from the callee
  let wc, ts;

  if (!keys || !values || !operators) {
    throw new Error('Input Parameter Missing');
  }

  // Set up SQL wildcards.
  // If none provided, they will be an array filled will `null`'s.
  // If provided, a check will be performed to determine if the correct number of wildcards is provided.
  if (wildcards) {
    wc = wildcards;

    if (wc.length != operators.length) {
      throw new Error('Number of wildcards does not equal the number of operators.');
    }
  } else {
    wc = Array(operators.length).fill(null);
  }

  // Set up key transformation functions.
  // If none provided, they will be null-filled array.
  // If provided, a check will be perkformed to determine if the correct number of transformations is provided.
  if (transformations) {
    ts = transformations;

    if (ts.length != keys.length) {
      throw new Error('Number of transformations does not equal the number of keys.');
    }
  } else {
    ts = Array(values.length).fill(null);
  }

  if (keys.length == values.length && keys.length == operators.length) {
    let str = '';

    // TODO: This could be simplified to co-apply transformattions to keys and values.
    const getValueDeclaration = (wildcard, value) => {
      if (wildcard == 'startsWith') {
        return `'${value}%'`.toUpperCase();
      } else if (wildcard == 'endsWith') {
        return `'%${value}'`.toUpperCase();
      } else if (wildcard == 'includes') {
        return `'%${value}%'`.toUpperCase();
      } else {
        return `'${value}'`.toUpperCase();
      }
    };

    const getKeyTransformation = (transformation, key) => {
      if (transformation !== null) {
        return `${transformation.toUpperCase()}(${key})`;
      } else {
        return key;
      }
    };

    keys.forEach((k, i, a) => {
      // If item is not first or last, prefix the current statement with 'AND'.
      if (i > 0 && i != a.length) {
        str += ' OR ';
      }

      str += `${getKeyTransformation(ts[i], k)} ${operators[i]} ${
        typeof values[i] === 'string' ? getValueDeclaration(wc[i], values[i]) : values[i]
      }`;
    });

    return str;
  } else {
    throw new Error('Keys, values, and operators are not of equal length.');
  }
}

export function makeUrlParamsFromObject(params: object, encode: boolean, prefix?: string) {
  if (!params) {
    throw new Error('Could not make URL params because no params were provided.');
  }

  const segments = Object.keys(params)
    .map(
      (k, i, a): string => {
        // Return a simple "key=value" string
        return `${k}=${params[k]}`;
      }
    )
    .join('&');

  // Encode URL params if set to true
  if (encode) {
    if (prefix) {
      return encodeURI(`${prefix}?${segments}`);
    } else {
      return encodeURI(`?${segments}`);
    }
  }

  // If a prefix is supplied, pre-pend it
  if (prefix) {
    return `${prefix}?${segments}`;
  } else {
    return `?${segments}`;
  }
}

export function dateForTimeString(time: string, baseDate?: Date): Date {
  const tilde_offset = time.startsWith('~') ? 1 : 0;
  const hours = parseInt(time.substr(tilde_offset, 2));
  const minutes = parseInt(time.substr(tilde_offset + 3, 2));
  const is_afternoon = time.substr(tilde_offset + 6) == 'PM';
  const date = baseDate == null ? new Date() : new Date(baseDate);
  date.setHours(hours + (is_afternoon && hours !== 12 ? 12 : 0), minutes, 0);
  return date;
}

export function timeStringForDate(date: Date): string {
  let hours = date.getHours();
  let ampm = 'AM';
  if (hours > 12) {
    hours -= 12;
    ampm = 'PM';
  }
  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}

/**
 * Accepts a collection of items and returns a collection of overlapping pair groups.
 *
 * Input: ['a', 'b', 'c', 'd']
 *
 * Output: [['a', 'b'], ['b', 'c'], ['c', 'd']]
 *
 * @export
 * @param {any[]} elements
 * @returns {any[]}
 */
export function pairwiseOverlap(elements: any[]): any[] {
  return elements.reduce((pairs, current, index, arr) => {
    if (arr.length <= 1) {
      throw new Error(`Insufficient elements to pair.`);
    }

    // Last item will have already been covered by the previous iteration.
    if (index == arr.length - 1) {
      return pairs;
    }

    // Return the current array item and the next one.
    return [...pairs, [arr[index], arr[index + 1]]];
  }, []);
}
