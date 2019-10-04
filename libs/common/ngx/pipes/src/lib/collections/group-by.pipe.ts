import { Pipe, PipeTransform } from '@angular/core';

/**
 * Groups a collection of objects by a provided object key path.
 *
 * @param  collection Object collection
 * @param  path Object key path by which groups will be made. Supports dot notation.
 * @param categoryIdentifierKeyPath If provided, will append the resolved key path from
 * any ONE of the collection objects into the resulting grouped object. Supports dot onation.
 */
@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  public transform<T extends object>(
    collection: Array<T>,
    path: string,
    categoryIdentifierKeyPath?: string
  ): Array<T | { items?: T; identity?: T }> {
    // Return early if no collection
    if (!collection || collection.length === 0) {
      return collection;
    }

    const groupedObj = collection.reduce((acc, curr) => {
      const propValue = getObjectPropertyValue(curr, path);
      if (acc[propValue]) {
        acc[propValue] = [...acc[propValue], curr];
      } else {
        acc[propValue] = [curr];
      }

      return acc;
    }, {});
    return Object.keys(groupedObj).map((g) => {
      if (categoryIdentifierKeyPath) {
        const identity = getObjectPropertyValue(groupedObj[g][0], categoryIdentifierKeyPath);

        if (identity) {
          return {
            identity,
            items: groupedObj[g]
          };
        }
      }

      // Default return
      return {
        items: groupedObj[g]
      };
    });
  }
}

export function getObjectPropertyValue(lookup: object, property: string): any {
  if (!lookup || !property) {
    return undefined;
  }

  const path = property.split('.');
  let value = JSON.parse(JSON.stringify(lookup));

  if (path.length === 0) {
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
