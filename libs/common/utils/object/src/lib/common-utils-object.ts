/**
 * Attempts to find if a property exists in an object.
 *
 * If value exists, return it. Otherwise, return undefined
 *
 * Supports dot notation.
 *
 * @export
 * @param lookup Source object
 * @param property Dot notation string representing the location of the property
 * @param isFlatPath If true, the property string is treated as a flat path and not split by '.'
 */
export function getPropertyValue<T>(lookup: object, property: string, isFlatPath = false): T | undefined {
  if (!lookup || !property) {
    return undefined;
  }

  const path = isFlatPath ? [property] : property.split('.');
  let value = JSON.parse(JSON.stringify(lookup));

  // Recursively test if the next item in the properties array exists in the lookup object.
  // If the property exists, replace the current value and repeat until all path keys are
  // exhausted or until the key no longer exists.
  path.forEach((prop) => {
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
 */
export function getObjectPropertyValues<T>(lookup: object, properties: string[], join?: false): (T | undefined)[];
export function getObjectPropertyValues(lookup: object, properties: string[], join?: true): string;
export function getObjectPropertyValues<T>(lookup: object, properties: string[], join?: boolean): string | (T | undefined)[] {
  const values = properties.map((property) => getPropertyValue<T>(lookup, property));

  if (join && values.every((value) => typeof value === 'string')) {
    return values.join(' ');
  } else {
    return values;
  }
}
