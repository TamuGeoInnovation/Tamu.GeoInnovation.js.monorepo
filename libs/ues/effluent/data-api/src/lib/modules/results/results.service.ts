import * as fs from 'fs';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as Papa from 'papaparse';

import { Result, Location } from '@tamu-gisc/ues/effluent/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ResultsService extends BaseService<Result> {
  constructor(
    @InjectRepository(Result) private repo: Repository<Result>,
    @InjectRepository(Location) private locationRepo: Repository<Location>
  ) {
    super(repo);
  }

  public handleFileUpload(filename: string) {
    let rowIndex = 0;

    // Create a readable stream that papaparse can understand.
    const readStream = fs.createReadStream(`../files/${filename}`);

    let locations: Array<Location>;

    // Do the parsing
    Papa.parse(readStream, {
      header: true,
      encoding: 'utf8',
      step: async (results, parser, c) => {
        parser.pause();

        if (rowIndex === 0) {
          rowIndex++;
          try {
            locations = await this.synchronizeLocations(results.meta.fields, parser);
          } catch (err) {
            throw new HttpException('Could not synchronize locations', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }

        try {
          await this.processDataRow(results, parser, locations);
        } catch (err) {
          throw new HttpException('Could not update at least one row from file.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        parser.resume();
      }
    });
  }

  private async processDataRow(row, parser, locations: Array<Location>) {
    // There is a weird issue with the CSV parser that requires the keys to be
    // lower-cased and trimmed for reliable access.
    const trimmed = Object.entries(row.data).reduce((acc, curr) => {
      const keyName = curr[0].toLowerCase().trim();

      acc[keyName] = curr[1];

      return acc;
    }, {});

    // From the parsed row, pluck out the parsed date string value and convert it to a Date object.
    const rowDate = new Date(trimmed['date']);

    const dataForRowDate = await this.getResultsForDate(rowDate);

    // If data exist for this date, attempt to update, otherwise all location values
    // for the current date.
    if (dataForRowDate.length > 0) {
      return await this.updateValuesForDate(dataForRowDate, trimmed);
    } else {
      return await this.addValuesForDate(rowDate, trimmed, locations);
    }
  }

  private async synchronizeLocations(locations: Array<string>, parser) {
    // Remove the first field. It is the date column.
    //
    // The remaining locations will be '-' concatenated arrays which need to be
    // prepared by transforming into tier and zone objects .
    const locationStrings = locations.slice(1, locations.length);

    const mappedLocationStrings = locationStrings.map((location) => {
      return {
        tier: parseInt(location.split('-')[0], 10),
        sample: parseInt(location.split('-')[1], 10)
      };
    });

    const existingLocations = await this.locationRepo.find({
      where: mappedLocationStrings
    });

    // Diff the list of entities that exist with the provided list. This list
    // will represent the locations that are not yet added to the db.
    //
    // If they have not been added, yet, they will be added.
    const nonExisting = mappedLocationStrings.filter((l) => {
      return (
        existingLocations.find((dbLocation) => {
          return dbLocation.tier === l.tier && dbLocation.sample === l.sample;
        }) === undefined
      );
    });

    if (nonExisting.length === 0) {
      return existingLocations;
    }

    // Cast location objects to Location entities.
    const entitiesFromNonExisting = nonExisting.map((nonExistingLocation) => {
      const entity = new Location();

      entity.tier = nonExistingLocation.tier;
      entity.sample = nonExistingLocation.sample;

      return entity;
    });

    await this.locationRepo.save(entitiesFromNonExisting);

    // Return a list of locations as they can be used by other parts of this service to
    // avoid unnecessary lookups.
    return this.locationRepo.find({
      where: mappedLocationStrings
    });
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
      .map(([key, value], index, arr) => {
        if (key === 'date') {
          return undefined;
        }

        const result = new Result();

        const tierZone = {
          tier: parseInt(key.split('-')[0], 10),
          sample: parseInt(key.split('-')[1], 10)
        };

        result.date = date;
        result.location = locations.find((l) => l.tier === tierZone.tier && l.sample === tierZone.sample);
        result.value = parseFloat(value);

        return result;
      })
      .filter((r) => r); // Filter undefined values (i.e. Date row)

    return this.repo.save(resultEntities);
  }

  private async updateValuesForDate(dbResults: Array<Result>, newResults: IParsedResultRow) {
    // Filter and update the value if any matching new value exists.
    const entitiesToUpdate = dbResults.reduce((acc, curr) => {
      const matchingNewResultRowValue = newResults[`${curr.location.tier}-${curr.location.sample}`];

      // Return early if there is no new value for the current db result entity.
      if (matchingNewResultRowValue === undefined) {
        return acc;
      }

      // Return early if the float parse results in not a real number
      if (parseFloat(matchingNewResultRowValue) === NaN) {
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
