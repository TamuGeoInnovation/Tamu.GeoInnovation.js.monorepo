import { Pipe, PipeTransform } from '@angular/core';
import { Group, groupBy } from '@tamu-gisc/common/utils/collection';

/**
 * Groups a collection of objects by a provided object key path.
 *
 * @param  collection Object collection
 * @param  path Object key path by which groups will be made. Supports dot notation.
 * @param categoryIdentifierKeyPath If provided, will append the resolved key path from
 * any ONE of the collection objects into the resulting grouped object. Supports dot onation.
 */
@Pipe({ name: 'groupBy' })
export class GroupByPipe<T extends object> implements PipeTransform {
  public transform(collection: Array<T>, path: string, categoryIdentifierKeyPath?: string): Array<Group<T>> | T {
    return groupBy(collection, path, categoryIdentifierKeyPath);
  }
}
