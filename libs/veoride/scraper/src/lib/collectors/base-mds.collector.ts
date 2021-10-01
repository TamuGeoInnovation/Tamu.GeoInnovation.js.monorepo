import { BaseEntity } from 'typeorm';

import {
  Log,
  LogType,
  PersistanceRecord,
  dateDifferenceGreaterThan,
  mdsTimeHourToDate
} from '@tamu-gisc/veoride/common/entities';

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
    const entityProperty = dtoPrimaryKeys as Array<string>;

    // First convert all dto records into entities. This will normalize the data types for
    // comparison below.
    const dtoEntities: Array<E> = dtoRecords.map((t) => {
      return this.dtoToEntity(t);
    });

    // Since an entity can have a compound primary key we need to provide all the keys that make up that key.
    const dtoIds: Array<Partial<E>> = dtoEntities.map((dto) => {
      return dtoPrimaryKeys.reduce((obj, key) => {
        // This constructed object will be used as the where parameters in the query.
        obj[`${key}`] = dto[`${key}`];

        return obj;
      }, {});
    });

    const batched = this.batchParameters(dtoIds, 2000 / dtoPrimaryKeys.length);

    const existingDbEntities = await (
      await Promise.all(
        batched.map((batch) => {
          return entity.find({
            where: [...batch]
          }) as Promise<Array<E>>;
        })
      )
    ).reduce((merged, batch) => {
      return [...merged, ...batch];
    }, []);

    const categorizedDtoEntities = dtoEntities.reduce(
      (acc, curr) => {
        const duplicateExists = acc.uniques.find((au) => {
          return dtoPrimaryKeys.every((prop) => {
            return au[`${prop}`] === curr[`${prop}`];
          });
        });

        if (duplicateExists) {
          acc.duplicates = [...acc.duplicates, curr];
        } else {
          acc.uniques = [...acc.uniques, curr];
        }

        return acc;
      },
      {
        duplicates: [],
        uniques: []
      } as { duplicates: Array<E>; uniques: Array<E> }
    );

    // Filter out existing db records. Only the resulting dto's will be inserted.
    const newRecords = categorizedDtoEntities.uniques.filter((dtoEntity) => {
      const matchingDbEntity = existingDbEntities.find((existing) => {
        return dtoPrimaryKeys.every((prop) => {
          return existing[`${prop}`] === dtoEntity[`${prop}`];
        });
      });

      return matchingDbEntity === undefined;
    });

    if (categorizedDtoEntities.duplicates.length > 0) {
      console.log(
        `${this.headingResourceName}: Found ${categorizedDtoEntities.duplicates.length} entity duplicates in scrape job`,
        categorizedDtoEntities.duplicates
      );
      Log.record({
        resource: this.params.resourceName,
        type: LogType.WARNING,
        category: 'scrape-duplicate',
        count: categorizedDtoEntities.duplicates.length,
        details: categorizedDtoEntities.duplicates
      });
    }

    return newRecords;
  }

  // tslint:disable-next-line: no-any
  public dtoToEntity<E extends BaseEntity, D>(dto: D): any {
    throw new Error(`${this.headingResourceName}: Method not implemented.`);
  }

  /**
   * Updates the persistent value for the provided resource, recording the last scraped time.
   */
  public async updateLastCollected(collectedDateTime: string) {
    const last = mdsTimeHourToDate(collectedDateTime, true);

    // If the difference between now and the last scraped date time is greater than 1 hour, there is no need to re-check
    // that interval. In that case, we can set the last collected date time to be the provided timestamp so that
    // the next scraping cycle checks for the next interval.
    //
    // If the difference is not greater than an hour, do not update the last checked date time so that date time can be checked
    // again for recent resource.
    if (dateDifferenceGreaterThan(new Date(), last, 1, 'hours')) {
      return PersistanceRecord.update(this.params.persistanceKey, { value: collectedDateTime });
    } else {
      return;
    }
  }

  /**
   * Return the persistance record for resource. Used to resume scraping on application start or on timed scrape cycle.
   */
  public getLastCollected(value: string) {
    return PersistanceRecord.findOrCreate(this.params.persistanceKey, value);
  }

  private batchParameters<C>(entityLikeCollection: Array<C>, maxBatchSize: number) {
    const batchRatio = maxBatchSize / entityLikeCollection.length;
    const batchSize = Math.floor(entityLikeCollection.length * batchRatio);

    const batches = entityLikeCollection.reduce((acc, curr, index, arr) => {
      if (index % batchSize === 0) {
        return [...acc, arr.slice(index, index + batchSize)];
      } else {
        return acc;
      }
    }, []);

    return batches;
  }
}
