/**
 * Simple SQL builder for use in Esri services.
 *
 * Includes a uppercase key transformation, as well as automatically uppercasing values.
 */
export function makeWhere(
  keys: string[],
  values: string[],
  operators: string[],
  wildcards?: string[],
  transformations?: string[]
) {
  // Wildcards container. This will either be generated in-function or be provided from the callee
  let wc;
  let ts;

  if (!keys || !values || !operators) {
    throw new Error('Input Parameter Missing');
  }

  // Set up SQL wildcards.
  // If none provided, they will be an array filled will `null`'s.
  // If provided, a check will be performed to determine if the correct number of wildcards is provided.
  if (wildcards) {
    wc = wildcards;

    if (wc.length !== operators.length) {
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

    if (ts.length !== keys.length) {
      throw new Error('Number of transformations does not equal the number of keys.');
    }
  } else {
    ts = Array(values.length).fill(null);
  }

  if (keys.length === values.length && keys.length === operators.length) {
    let str = '';

    // TODO: This could be simplified to co-apply transformattions to keys and values.
    const getValueDeclaration = (wildcard, value) => {
      if (wildcard === 'startsWith') {
        return `'${value}%'`.toUpperCase();
      } else if (wildcard === 'endsWith') {
        return `'%${value}'`.toUpperCase();
      } else if (wildcard === 'includes') {
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
      if (i > 0 && i !== a.length) {
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
