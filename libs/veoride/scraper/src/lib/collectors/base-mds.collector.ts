import { BaseEntity } from 'typeorm';

import { Log, LogType, dateDifferenceGreaterThan, mdsTimeHourToDate } from '@tamu-gisc/veoride/common/entities';

import { AbstractMdsCollector, AnyPromise, EntityAlias } from './abstract-mds.collector';
import { BaseMdsCollectorConstructorProperties, BaseRequestParams } from '../types/types';

export abstract class BaseMdsCollector<
  S extends BaseMdsCollectorConstructorProperties,
  T extends BaseRequestParams
> extends AbstractMdsCollector<S, T> {
  constructor(params: S) {
    super(params);
  }

  public init() {
    setTimeout(async () => {
      this.scrape();
    }, 3000);

    setInterval(async () => {
      this.scrape();
    }, this.params.interval * 60 * 1000);
  }

  public abstract scrape(): AnyPromise;

  public async processRecords<E extends BaseEntity, D>(
    dtoRecords: Array<D>,
    dtoPrimaryKeys: Array<keyof D>,
    entity: EntityAlias
  ): Promise<Array<E>> {
    // First convert all dto records into entities. This will normalize the data types for
    // comparison below.
    const dtoEntities: Array<E> = dtoRecords.map((t) => {
      return this.dtoToEntity(t);
    });

    return dtoEntities;
  }

  // tslint:disable-next-line: no-any
  public dtoToEntity<E extends BaseEntity, D>(dto: D): any {
    throw new Error(`${this.headingResourceName}: Method not implemented.`);
  }

  /**
   * Updates the persistent value for the provided resource, recording the last scraped time.
   */
  public async updateLastCollected(collectedDateTime: string, insertedRows: number) {
    const last = mdsTimeHourToDate(collectedDateTime, true);

    // If the difference between now and the last scraped date time is greater than 1 hour, there is no need to re-check
    // that interval. In that case, we can set the last collected date time to be the provided timestamp so that
    // the next scraping cycle checks for the next interval.
    //
    // If the difference is not greater than an hour, do not update the last checked date time so that date time can be checked
    // again for recent resource.
    if (dateDifferenceGreaterThan(new Date(), last, 1, 'hours')) {
      // return PersistanceRecord.update(this.params.persistanceKey, { value: collectedDateTime });
      return Log.record({
        resource: this.params.resourceName,
        type: LogType.INFO,
        category: 'scrape-complete',
        collectedTime: last.getTime(),
        count: insertedRows,
        details: {
          mdsTimestamp: collectedDateTime
        }
      });
    } else {
      return;
    }
  }

  /**
   * Return the persistance record for resource. Used to resume scraping on application start or on timed scrape cycle.
   */
  public getLastCollected(resource: string): Promise<Log> {
    return Log.findOne({
      where: {
        resource: resource,
        category: 'scrape-complete'
      },
      order: {
        collectedTime: 'DESC'
      }
    });
  }
}
