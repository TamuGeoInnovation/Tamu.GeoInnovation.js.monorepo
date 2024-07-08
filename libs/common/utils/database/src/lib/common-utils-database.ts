/**
 * Simple SQL builder for use in Esri services.
 *
 * Includes a uppercase key transformation, as well as automatically upper-casing values.
 */

export function makeWhere(
  keys: string[],
  values: string[],
  operators: (string | CompoundOperator)[],
  wildcards?: string[],
  transformations?: string[]
): string {
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
  // If provided, a check will be performed to determine if the correct number of transformations is provided.
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

    // TODO: This could be simplified to co-apply transformations to keys and values.
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

    const getOperator = (operator: string | CompoundOperator, type: 'logical' | 'comparison') => {
      if (typeof operator === 'string') {
        return operator;
      } else {
        if (type === 'comparison') {
          return operator.comparison;
        } else {
          return operator.logical;
        }
      }
    };

    keys.forEach((k, i, a) => {
      // Because logical operators are only used after the first expression, the logical operator that should join the current expression is the one before it.
      const currentOperator = operators[i];
      const previousOperator = operators[i - 1];

      // By default, the logical operator is 'OR' for when the current operator is a string type,
      // simply because this type cannot specify a logical operator. When the operator is a CompoundOperator,
      // the logical operator is specified and used.

      if (i > 0 && i !== a.length) {
        if (typeof previousOperator === 'string') {
          str += ' OR ';
        } else if (typeof previousOperator === 'object') {
          str += ` ${getOperator(previousOperator, 'logical')} `;
        } else {
          throw new Error('Invalid operator type.');
        }
      }

      const transformedKey = getKeyTransformation(ts[i], k);
      const operator = getOperator(currentOperator, 'comparison');
      const value = typeof values[i] === 'string' ? getValueDeclaration(wc[i], values[i]) : values[i];

      str += `${transformedKey} ${operator} ${value}`;
    });

    return str;
  } else {
    throw new Error('Keys, values, and operators are not of equal length.');
  }
}

export interface CompoundOperator {
  logical?: 'AND' | 'BETWEEN' | 'IN' | 'NOT IN' | 'LIKE' | 'NOT LIKE' | 'NOT' | 'OR';

  comparison?: 'IS NULL' | '=' | '>' | '>=' | '<=' | '<' | '!=';
}
