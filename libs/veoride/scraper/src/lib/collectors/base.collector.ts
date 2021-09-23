import { URLSearchParams } from 'url';
import { BaseEntity, In } from 'typeorm';

import got from 'got';

import { PersistanceRecord } from '@tamu-gisc/veoride/common/entities';

import { AbstractCollector, AnyPromise } from './abstract.collector';
import { dateDifferenceGreaterThan, mdsTimeHourToDate } from '../utilities/time.utils';
import { BaseCollectorConstructorProperties, BaseRequestParams, MDSResponse } from '../types/types';

export class BaseCollector<
  S extends BaseCollectorConstructorProperties,
  T extends BaseRequestParams
> extends AbstractCollector {
  public acceptHeader = 'application/vnd.mds+json;version=1.1';
  public params: S;

  public processing = false;

  constructor(params: S) {
    super();
    this.params = params;
  }

  public async resource<TR>(parameters: T): Promise<MDSResponse<TR>> {
    try {
      const res = (await got
        .get(this.params.url, {
          headers: {
            Accept: this.acceptHeader,
            Authorization: `Bearer ${this.params.token}`
          },
          searchParams: new URLSearchParams(parameters)
        })
        .json()) as MDSResponse<TR>;

      return res;
    } catch (err) {
      if (err.response.statusCode === 404) {
        throw new Error(`Requested date time ${JSON.stringify(parameters)} does not yet exist. Aborting scraping cycle.`);
      } else if (err.response.statusCode === 401) {
        throw new Error(`Authentication token invalid.`);
      } else {
        throw new Error('Error requesting trips resource');
      }
    }
  }

  public init() {
    console.log('Initializing trip collector....');

    setTimeout(async () => {
      this.scrape();
    }, 3000);

    setInterval(async () => {
      this.scrape();
    }, this.params.interval * 60 * 1000);
  }

  // tslint:disable-next-line: no-any
  public scrape(): AnyPromise {
    throw new Error('Method not implemented.');
  }

  public async processRecords<E extends BaseEntity, D>(
    dtoRecords: Array<D>,
    dtoProperty: keyof D,
    entity: EntityAlias
  ): Promise<Array<E>> {
    // Filter out the id's to check against database for existing rows.
    const apiRecordIds = dtoRecords.map((t) => t[dtoProperty]);
    const entityProperty = dtoProperty as string;

    const existingDbEntity = (await entity.find({
      where: {
        trip_id: In(apiRecordIds)
      }
    })) as Array<E>;

    // Filter out existing db records. Only the resulting dto's will be inserted.
    const newRecords = dtoRecords
      .filter((t) => {
        return existingDbEntity.findIndex((dbet) => dbet[entityProperty] === t[dtoProperty]) === -1;
      })
      .map((t) => this.dtoToEntity<E, D>(t));

    return newRecords;
  }

  // tslint:disable-next-line: no-any
  public dtoToEntity<E extends BaseEntity, D>(dto: D): any {
    throw new Error('Method not implemented.');
  }

  /**
   * Updates the persistent value for the trips resource, recording the last scraped time.
   */
  public async updateLastCollected(collectedDateTime: string) {
    const last = mdsTimeHourToDate(collectedDateTime, true);

    // If the difference between now and the last scraped date time is greater than 1 hour, there is no need to re-check
    // that interval. In that case, we can set the last collected date time to be the provided timestamp so that
    // the next scraping cycle checks for the next interval.
    //
    // If the difference is not greater than an hour, do not update the last checked date time so that date time can be checked
    // again for recent trips.
    if (dateDifferenceGreaterThan(new Date(), last, 1, 'hours')) {
      return PersistanceRecord.update(this.params.persistanceKey, { value: collectedDateTime });
    } else {
      return;
    }
  }

  /**
   * Return the persistance record for trips. Used to resume scraping on application start or on timed scrape cycle.
   */
  public getLastCollected(value: string) {
    return PersistanceRecord.findOrCreate(this.params.persistanceKey, value);
  }

  public async saveEntities<C extends BaseEntity>(entity: EntityAlias, entities: Array<C>): Promise<Array<C>> {
    // Parameter limit per query is ~2000. Batch the entry submissions to not exceed that parameter limit.
    const chunk = Object.entries(entities[0]).length / 2000;
    const savedTrips = await entity.save(entities, { chunk });

    return (savedTrips as unknown) as Array<C>;
  }
}

type EntityAlias = typeof BaseEntity;
