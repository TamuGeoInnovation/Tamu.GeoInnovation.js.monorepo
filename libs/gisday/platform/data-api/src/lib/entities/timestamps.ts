import { ColumnOptions, EntitySubscriberInterface, EventSubscriber, ObjectLiteral, UpdateEvent } from 'typeorm';

/**
 * How every GIS Day table's `created` and `updated` columns are stored (#2926): a datetimeoffset, defaulting to
 * SYSDATETIMEOFFSET(), the server's clock with its offset.
 *
 * TypeORM's default on SQL Server is getdate(), the server's local wall-clock time with no offset, which a
 * datetimeoffset column stores as +00:00. On a server set to Central time a 5:00 PM submission was stored as 5:00 PM
 * UTC and shown as 11:00 AM. A server set to UTC hid it, which is why the local site never showed it.
 */
export const TIMESTAMP_COLUMN: ColumnOptions = { type: 'datetimeoffset', default: () => 'SYSDATETIMEOFFSET()' };

/**
 * Stamps `updated` with the moment of an update, from the API's clock, on every update through TypeORM (#2926).
 *
 * Without it TypeORM writes `updated = CURRENT_TIMESTAMP`, which on SQL Server is getdate() again: the server's
 * local time stored as UTC, whatever the column's default says. `save()` and `repository.update()` both pass
 * through here before their SQL is built, so setting the value means TypeORM does not add CURRENT_TIMESTAMP. A
 * JavaScript Date is an instant, and is stored as one.
 */
@EventSubscriber()
export class UpdatedTimestampSubscriber implements EntitySubscriberInterface {
  public beforeUpdate(event: UpdateEvent<ObjectLiteral>): void {
    const column = event.metadata?.updateDateColumn;

    if (column && event.entity) {
      event.entity[column.propertyName] = new Date();
    }
  }
}

/** The subscribers every connection to a GIS Day database registers. */
export const GISDAY_SUBSCRIBERS = [UpdatedTimestampSubscriber];
