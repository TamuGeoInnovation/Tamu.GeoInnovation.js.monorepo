import { EntitySubscriberInterface, EventSubscriber, ObjectLiteral, UpdateEvent } from 'typeorm';

/**
 * Sets a row's `updated` to the moment of the update, in JavaScript, on every update of every GIS Day entity (#2584).
 *
 * typeorm otherwise writes `"updated" = CURRENT_TIMESTAMP`, the database server's local time with no offset, which a
 * `datetimeoffset` column stores as UTC: production's server runs in Central time, so every update read 5 or 6 hours early.
 * typeorm writes that whenever the update does not set `updated` itself, and gives no option to change it.
 *
 * A subscriber rather than an entity listener, because it also runs for `repository.update()`, which hands it the values
 * being set rather than an entity, as well as for `save()`. Inserts need nothing: they take the column's default,
 * `SYSDATETIMEOFFSET()`, which carries the server's real offset.
 *
 * Every data source that uses the GIS Day entities registers it, from `GISDAY_SUBSCRIBERS`. typeorm builds only the classes
 * listed there that carry `@EventSubscriber()`.
 */
@EventSubscriber()
export class UpdatedTimeSubscriber implements EntitySubscriberInterface {
  public beforeUpdate(event: UpdateEvent<ObjectLiteral>): void {
    const column = event.metadata.updateDateColumn;

    if (column && event.entity) {
      column.setEntityValue(event.entity, new Date());
    }
  }
}

export const GISDAY_SUBSCRIBERS = [UpdatedTimeSubscriber];
