import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { validateOrReject, ValidationError } from 'class-validator';
import * as papa from 'papaparse';
import * as fs from 'fs';

import { WeatherfluxExpanded, EntryFailure } from '@tamu-gisc/two/common';

@Injectable()
export class IrgasonValidationService {
  public currentSiteCode: string;
  public numOfFailures = 0;
  constructor() {}

  public validateAndUpload(path: string) {
    const pathTokens = path.split('\\');
    const fileName = pathTokens[pathTokens.length - 1];
    const fileNameTokens = fileName.split('_');
    this.currentSiteCode = fileNameTokens[0];

    const file = fs.createReadStream(path);

    papa.parse(file, {
      header: true,
      beforeFirstChunk: (chunk: string) => {
        let chunkTokens = chunk.toLowerCase().split(',');
        chunkTokens = chunkTokens.slice(8, chunkTokens.length);
        const ret = chunkTokens.toString();

        return ret;
      },
      step: (row) => {
        const data = row.data;
        const weatherFlux: WeatherfluxExpanded = new WeatherfluxExpanded(data);
        weatherFlux.sitecode = this.currentSiteCode;

        validateOrReject(weatherFlux)
          .then((value) => {
            getConnection()
              .getRepository(WeatherfluxExpanded)
              .insert(weatherFlux)
              .then(() => {
                console.log('Success?');
              })
              .catch((typeOrmErr) => {
                throw typeOrmErr;
              });
          })
          .catch((validateErr) => {
            for (let i = 0; i < validateErr.length; i++) {
              const propValErr: ValidationError = validateErr[i];
              const errors: string[] = [];
              let timestamp: string = null;
              let record: string = null;

              if (propValErr.target.hasOwnProperty('timestamp')) {
                timestamp = propValErr.target['timestamp'];
              }

              if (propValErr.target.hasOwnProperty('record')) {
                record = propValErr.target['record'];
              }

              Object.keys(propValErr.constraints).forEach((key) => {
                errors.push(propValErr.constraints[key]);
              });

              const errData = {
                sitecode: this.currentSiteCode,
                record: record,
                property: propValErr.property,
                validationError: errors.toString(),
                timestamp: timestamp
              };

              const failure: EntryFailure = new EntryFailure(errData);

              getConnection()
                .getRepository(EntryFailure)
                .insert(failure)
                .catch((typeormErr) => {
                  throw typeormErr;
                });
            }
          });
      },
      error: (err) => {
        throw err;
      }
    });
  }
}
