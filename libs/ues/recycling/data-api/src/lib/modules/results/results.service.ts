import * as fs from 'fs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as Papa from 'papaparse';

import { Result, Location } from '@tamu-gisc/ues/recycling/common/entities';
import { groupBy } from '@tamu-gisc/common/utils/collection';

import { BaseService } from '../base/base.service';

@Injectable()
export class ResultsService extends BaseService<Result> {
  constructor(
    @InjectRepository(Result) private repo: Repository<Result>,
    @InjectRepository(Location) private locationRepo: Repository<Location>
  ) {
    super(repo);
  }

  public async getResults(args: IResultsQueryArgs) {
    const query = this.repo.createQueryBuilder('result').innerJoinAndSelect('result.location', 'location');

    // Apply conditions
    if (args && args.limiters) {
      if (args.limiters.id) {
        query.andWhere(`location.id = ${args.limiters.id}`);
      }
    }

    // Apply ordering
    query.orderBy('location.id', 'ASC').addOrderBy('result.date', 'DESC');

    const ret = await query.getMany();

    if (args && args.options) {
      if (args.options.groupByDate) {
        return groupBy<Result>(ret, 'date', 'date');
      }
    }

    return ret;
  }

  /**
   * For each location, returns the latest n recorded values.
   */
  public async getLatestNValuesForLocation(id: string, days?: number | string) {
    const locationsQuery = await this.locationRepo.createQueryBuilder('locations');

    if (id !== undefined) {
      locationsQuery.andWhere(`id = '${id}'`);
    }

    const locations = await locationsQuery.orderBy('id', 'ASC').getMany();

    const queries = locations.map((l) => {
      const query = this.repo
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.location', 'location')
        .where(`location.id = '${l.id}'`)
        .orderBy('date', 'DESC');

      if (days !== undefined) {
        query.limit(typeof days === 'string' ? parseInt(days, 10) : days);
      }

      return query.getMany();
    });

    const resolved = await Promise.all(queries);

    return resolved.reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);
  }

  public async getLatestNValueAverageForLocation(id?: string, days?: number | string): Promise<IAverageResponse> {
    const results = await this.getLatestNValuesForLocation(id, days);

    const average =
      results.reduce((acc, curr) => {
        return acc + curr.value;
      }, 0) / results.length;

    return {
      average,
      results
    };
  }

  /**
   * Parses an input file and inserts/updates into database.
   *
   * Synchronizes locations based on the delimited file header.
   *
   * Updates values wherever an existing value for a given location exists.
   */
  public handleFileUpload(filename: string): Promise<unknown> {
    try {
      return new Promise((r, rj) => {
        let rowIndex = 0;

        // Calling papaparse abort() doesn't seem to terminate the stream with the error callback,
        // and instead calls complete() which should only be reached if everything completed successfully.
        let isError = false;

        // Create a readable stream that papaparse can understand.
        const readStream = fs.createReadStream(`../files/${filename}`);

        let locations: Array<Location>;

        // Do the parsing
        Papa.parse(readStream, {
          header: true,
          encoding: 'utf8',
          step: async (results, parser) => {
            parser.pause();

            if (rowIndex === 0) {
              rowIndex++;

              try {
                locations = await this.synchronizeLocations(results.meta.fields);
              } catch (err) {
                isError = true;
                rj(err);
                parser.abort();
              }
            }

            if (isError === false) {
              try {
                await this.processDataRow(results, parser, locations);
                parser.resume();
              } catch (err) {
                rj(err);

                parser.abort();
              }
            }
          },
          error: async (error) => {
            rj(error);
          },
          complete: async () => {
            r({ status: HttpStatus.OK, message: 'File processed successfully' });
          }
        });
      });
    } catch (err) {
      throw new HttpException('is this returned?', HttpStatus.BAD_REQUEST);
    }
  }

  private async processDataRow(row, parser, locations: Array<Location>) {
    try {
      // There is a weird issue with the CSV parser that requires the keys to be
      // lower-cased and trimmed for reliable access.
      const trimmed = Object.entries(row.data).reduce((acc, [key, value]) => {
        // Handle empty headers, which cause errors when assigning values.
        if (key === '') {
          return acc;
        }

        const keyName = key.toLowerCase().trim();

        acc[keyName] = value;

        return acc;
      }, {});

      // From the parsed row, pluck out the parsed date string value and convert it to a Date object.
      const rowDate = new Date(trimmed['weeks']);

      const dataForRowDate = await this.getResultsForDate(rowDate);

      // If data exist for this date, attempt to update, otherwise all location values
      // for the current date.
      if (dataForRowDate.length > 0) {
        return await this.updateValuesForDate(dataForRowDate, trimmed);
      } else {
        return await this.addValuesForDate(rowDate, trimmed, locations);
      }
    } catch (err) {
      throw new HttpException('Could not update at least one row from file.', HttpStatus.BAD_REQUEST);
    }
  }

  private async synchronizeLocations(locations: Array<string>) {
    try {
      // Remove the first field. It is the date column.
      //
      // The remaining locations will be '-' concatenated arrays which need to be
      // prepared by transforming into tier and zone objects .
      const locationStrings = locations.slice(1, locations.length).filter((header) => {
        // Filters out any empty headers
        return header !== '';
      });

      const mappedLocationStrings = locationStrings.map((location) => {
        return {
          id: location
        };
      });

      const existingLocations = await this.locationRepo.find({
        where: mappedLocationStrings
      });

      // Diff the list of entities that exist with the provided list. This list
      // will represent the locations that are not yet added to the db.
      //
      // If they have not been added, yet, they will be added.
      const nonExisting = locationStrings.filter((l) => {
        return (
          existingLocations.find((dbLocation) => {
            return dbLocation.id === l;
          }) === undefined
        );
      });

      if (nonExisting.length === 0) {
        return existingLocations;
      }

      // Cast location objects to Location entities.
      const entitiesFromNonExisting = nonExisting.map((nonExistingLocation) => {
        const entity = new Location();

        entity.id = nonExistingLocation;

        return entity;
      });

      await this.locationRepo.save(entitiesFromNonExisting);

      // Return a list of locations as they can be used by other parts of this service to
      // avoid unnecessary lookups.
      return this.locationRepo.find({
        where: mappedLocationStrings
      });
    } catch (err) {
      throw new HttpException('Could not synchronize locations', HttpStatus.BAD_REQUEST);
    }
  }

  private async getResultsForDate(date: Date) {
    return this.repo.find({
      where: {
        date: date
      },
      relations: ['location']
    });
  }

  private async addValuesForDate(date: Date, results: IParsedResultRow, locations: Array<Location>) {
    const resultEntities = Object.entries(results)
      .map(([key, value]) => {
        if (key === 'weeks') {
          return undefined;
        }

        const result = new Result();

        result.date = date;
        result.location = locations.find((l) => l.id.toLowerCase().trim() === key);
        result.value = parseFloat(value);

        return result;
      })
      .filter((r) => r); // Filter undefined values (i.e. Date row)

    return this.repo.save(resultEntities);
  }

  private async updateValuesForDate(dbResults: Array<Result>, newResults: IParsedResultRow) {
    // Filter and update the value if any matching new value exists.
    const entitiesToUpdate = dbResults.reduce((acc, curr) => {
      const matchingNewResultRowValue = newResults[`${curr.location.id.trim().toLowerCase()}`];

      // Return early if there is no new value for the current db result entity.
      if (matchingNewResultRowValue === undefined) {
        return acc;
      }

      // Return early if the float parse results in not a real number
      if (isNaN(parseFloat(matchingNewResultRowValue))) {
        return acc;
      }

      const parsedMatchingValue = parseFloat(matchingNewResultRowValue);

      // Do not update the entity if the value is the same
      if (parsedMatchingValue === curr.value) {
        return acc;
      }

      curr.value = parsedMatchingValue;

      return [...acc, curr];
    }, []);

    return this.repo.save(entitiesToUpdate);
  }
}

export interface IParsedResultRow {
  [key: string]: string;
}

export interface IResultsQueryArgs {
  limiters?: {
    id?: number | string;
  };
  options?: {
    groupByDate?: boolean;
  };
}

export interface IAverageResponse {
  average: number;
  results: Result[];
}
