import { Injectable } from '@nestjs/common';
import * as papa from 'papaparse';
import * as fs from 'fs';
// import * as date from 'date-and-time';
import { validate, validateOrReject } from 'class-validator';
import { getConnection } from 'typeorm';
import { WeatherfluxExpanded } from '@tamu-gisc/two/common';
// import { EmailerService } from '../emailer/emailer.service';

@Injectable()
export class IrgasonValidationService {
  public currentSiteCode: string;
  public numOfFailures: number = 0;
  constructor( 
    //   private readonly emailerService: EmailerService
    ) { }

  validateAndUpload(path: string) {
    const pathTokens = path.split("\\");
    const fileName = pathTokens[pathTokens.length - 1];
    const fileNameTokens = fileName.split("_");
    this.currentSiteCode = fileNameTokens[0];
    const file = fs.createReadStream(path);
    const timestamps: string[] = [];
    const otrTimestamps = {};
    papa.parse(file, {
      header: true,
      step: (row) => {
        const data = row.data;
        const weatherFlux: WeatherfluxExpanded = new WeatherfluxExpanded(data);
        weatherFlux.sitecode = this.currentSiteCode;
        getConnection().getRepository(WeatherfluxExpanded).insert(weatherFlux).then(() => {
          console.log("Success?");
        });
      },
      complete: () => {
        console.log('done');
      },
      error: (err) => {
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
