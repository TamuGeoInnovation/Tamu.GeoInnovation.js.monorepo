import { Injectable } from '@nestjs/common';
import * as papa from 'papaparse';
import * as fs from 'fs';
// import * as date from 'date-and-time';
import { validate, validateOrReject, ValidationError } from 'class-validator';
import { getConnection } from 'typeorm';
import { WeatherfluxExpanded, EntryFailure } from '@tamu-gisc/two/common';
// import { EmailerService } from '../emailer/emailer.service';

@Injectable()
export class IrgasonValidationService {
  public currentSiteCode: string;
  public numOfFailures: number = 0;
  constructor() //   private readonly emailerService: EmailerService
  {}

  validateAndUpload(path: string) {
    const pathTokens = path.split('\\');
    const fileName = pathTokens[pathTokens.length - 1];
    const fileNameTokens = fileName.split('_');
    this.currentSiteCode = fileNameTokens[0];
    const file = fs.createReadStream(path);
    papa.parse(file, {
      header: true,
      beforeFirstChunk: (chunk: string) => {
        let chunkTokens = chunk.toLowerCase().split(",");
        chunkTokens = chunkTokens.slice(8, chunkTokens.length);
        const ret = chunkTokens.toString();
        return ret;
      },
      step: (row) => {
        const data = row.data;
        const weatherFlux: WeatherfluxExpanded = new WeatherfluxExpanded(data);
        weatherFlux.sitecode = this.currentSiteCode;
        validateOrReject(weatherFlux).then((value) => {
          getConnection()
          .getRepository(WeatherfluxExpanded)
          .insert(weatherFlux)
          .then(() => {
            console.log('Success?');
          }).catch((typeOrmErr) => {
            debugger
            throw typeOrmErr;
          })
        }).catch((validateErr) => {
          for(let i = 0; i < validateErr.length; i++) {
            const propValErr: ValidationError = validateErr[i];
            const errors: string[] = [];
            let timestamp: string = null;
            let record: string = null;
            if (propValErr.target.hasOwnProperty("timestamp")) {
              timestamp = propValErr.target["timestamp"];
            }
            if (propValErr.target.hasOwnProperty("record")) {
              record = propValErr.target["record"];
            }
            Object.keys(propValErr.constraints).forEach((key) => {
              errors.push(propValErr.constraints[key]);
            })
            const data = {
              sitecode: this.currentSiteCode,
              record: record,
              property: propValErr.property,
              validationError: errors.toString(),
              timestamp: timestamp
            }
            const failure: EntryFailure = new EntryFailure(data);
            getConnection().getRepository(EntryFailure).insert(failure).catch((typeormErr) => {
              throw typeormErr
            });
          }
        });
        // getConnection()
        //   .getRepository(WeatherfluxExpanded)
        //   .insert(weatherFlux)
        //   .then(() => {
        //     console.log('Success?');
        //   })
        //   .catch((typeormErr) => {
        //    try {
        //       if (typeormErr.name === 'QueryFailedError') {
        //         const failure: EntryFailure = new EntryFailure();
        //         failure.parseError = typeormErr.sqlMessage;
        //         if (typeormErr.parameters[0]) {
        //           // Gets the siteCode
        //           failure.sitecode = typeormErr.parameters[1];
        //         }
        //         if (typeormErr.parameters[13]) {
        //           // Gets the timestamp
        //           failure.timestamp = typeormErr.parameters[13];
        //         }
        //         getConnection().getRepository(EntryFailure).insert(failure);
        //       }
        //    } catch (error) {
        //      // threw an exception while trying to generate entry failure
        //      const failure = new EntryFailure;
        //      getConnection().getRepository(EntryFailure).insert(failure);
        //    }
        //   });
      },
      error: (err) => {
        // weatherFluxRepo.insert(weatherFlux).catch((err) => {
        //   if (err.name == 'QueryFailedError') {
        //     const failure: EntryFailure = new EntryFailure();
        //     failure.parseError = err.sqlMessage;
        //     if (err.parameters[1]) {
        //       // Gets the siteCode
        //       failure.sitecode = err.parameters[1];
        //     }
        //     if (err.parameters[13]) {
        //       // Gets the timestamp
        //       failure.timestamp = err.parameters[13];
        //     }
        //     entryFailureRepo.insert(failure);
        //   }
        // });
        this.numOfFailures++;
        // this.emailerService.sendFailureEmail(this.numOfFailures, fileName).then((email) => {
        //   console.log(email);
        // }).catch((err) => {
        //   throw err;
        // });
        throw err;
      }
    });
  }
}
