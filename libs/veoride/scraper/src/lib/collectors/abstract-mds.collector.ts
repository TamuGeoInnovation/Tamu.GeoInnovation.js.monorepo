import { URLSearchParams } from 'url';
import got from 'got';

import { AbstractCollectorConstructorProperties, BaseRequestParams, MDSResponse } from '../types/types';
import { BaseEntity } from 'typeorm';

export abstract class AbstractMdsCollector<S extends AbstractCollectorConstructorProperties, T extends BaseRequestParams> {
  public acceptHeader = 'application/vnd.mds+json;version=1.1';
  public params: S;
  public processing = false;
  /**
   * Formatted plural resource name used in the log entries.
   */
  public headingResourceName: string;

  /**
   * Collector initialization function that schedules scraping at a provided interval.
   */

  constructor(params: S) {
    this.params = params;
    this.headingResourceName = `${(params.resourceName + 'S').toUpperCase()}`;
  }
  public abstract init(): void;

  public async resource<TR>(parameters?: T): Promise<MDSResponse<TR>> {
    if (parameters) {
      console.log(`${this.headingResourceName}: Scraping with ${JSON.stringify(parameters)}`);
    } else {
      console.log(`${this.headingResourceName}: Scraping with no parameters`);
    }

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
        throw new Error(
          `${this.headingResourceName}: Requested parameters ${JSON.stringify(
            parameters
          )} do not yet exist. Aborting scraping job.`
        );
      } else if (err.response.statusCode === 401) {
        throw new Error(`${this.headingResourceName}: Authentication token invalid.`);
      } else {
        throw new Error(`${this.headingResourceName}: Error requesting resource`);
      }
    }
  }

  // tslint:disable-next-line: no-any
  public abstract scrape(params?: any): AnyPromise;

  public async saveEntities<C extends BaseEntity>(entity: EntityAlias, entities: Array<C>): Promise<Array<C>> {
    // Parameter limit per query is ~2000. Batch the entry submissions to not exceed that parameter limit.
    const chunk = 2000 / Object.entries(entities[0]).length;
    const savedRecords = await entity.save(entities, { chunk });

    return (savedRecords as unknown) as Array<C>;
  }
}

// tslint:disable-next-line: no-any
export type AnyPromise = Promise<void> | Promise<unknown> | Promise<any>;

export type EntityAlias = typeof BaseEntity;
