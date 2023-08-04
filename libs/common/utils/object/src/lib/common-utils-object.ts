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
 */
export function getPropertyValue<T>(lookup: object, property: string): T {
  if (!lookup || !property) {
    return undefined;
  }

  const path = property.split('.');
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
export function getObjectPropertyValues<T>(lookup: object, properties: string[], join?: false): T[];
export function getObjectPropertyValues(lookup: object, properties: string[], join?: true): string;
export function getObjectPropertyValues<T>(lookup: object, properties: string[], join?: boolean): string | T[] {
  const values = properties.map((property) => getPropertyValue<T>(lookup, property));

  if (join && values.every((value) => typeof value === 'string')) {
    return values.join(' ');
  } else {
    return values;
  }
}

export class FieldEnumerator<T extends Record<string, unknown>> {
  constructor(private _obj: T) {}

  public filter(type: 'include' | 'exclude', fields: Array<keyof Record<string, unknown>>): T {
    const filtered = Object.entries(this._obj).reduce((acc, [key, value]) => {
      if (type === 'include') {
        if (fields.includes(key)) {
          acc[key] = value;
        }
      } else {
        if (!fields.includes(key)) {
          acc[key] = value;
        }
      }

      return acc;
    }, {} as any);

    this._obj = filtered;

    return this._obj;
  }

  // Given a list of properties, return an array of key-value objects in the order of the properties array. The purpose is to preserve the order of the key-value objects. Name the function "order"
  public order(fields: Array<keyof Record<string, unknown>>): Array<{ key: keyof Record<string, unknown>; value: unknown }> {
    const ordered = fields.map((field) => {
      return { key: field, value: this._obj[field] };
    });

    return ordered;
  }
}

