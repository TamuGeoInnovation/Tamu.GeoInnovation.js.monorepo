import { Injectable } from '@nestjs/common';

import { getConnection } from 'typeorm';

import { IDateHistory, IHistoryRange } from '@tamu-gisc/two/data-access';

@Injectable()
export class StatusAPIService {
  constructor() {}
  public async getStatus() {
    const statQuery = `SELECT A.siteCode, COUNT(A.siteCode) as success, (SELECT COUNT(siteCode) FROM TWO.Entry_failure WHERE siteCode = A.siteCode) as failure, (SELECT max(\`Timestamp\`) as latest from TWO.WeatherFlux_Test WHERE siteCode = A.siteCode GROUP BY siteCode) as latest FROM TWO.WeatherFlux_Test A WHERE A.\`Timestamp\` <= CAST('2020-03-10' AS DATE) AND A.\`Timestamp\` > CAST('2017-01-01' AS DATE) GROUP BY A.siteCode`;
    return getConnection()
      .query(statQuery)
      .then((result) => {
        return result;
      })
      .catch((typeormErr) => {
        throw typeormErr;
      });
  }

  public async getHistoryForSite(dateHistory: IDateHistory) {
    const results = dateHistory.dateRange.map(async (val: IHistoryRange) => {
      const result = await this.getHistoryForSiteSingleDay(dateHistory.siteCode, val);
      return {
        ...result[0],
        date: val.lowerDate
      };
    });

    return results;
  }

  private async getHistoryForSiteSingleDay(siteCode: string, singleDay: IHistoryRange) {
    const statQuery = `SELECT A.siteCode, COUNT(A.siteCode) as success, (SELECT COUNT(siteCode) FROM TWO.Entry_failure WHERE siteCode = A.siteCode AND A.\`Timestamp\` < CAST('${singleDay.upperDate}' AS DATE) AND A.\`Timestamp\` >= CAST('${singleDay.lowerDate}' AS DATE))  as failure FROM TWO.WeatherFlux_Test A WHERE A.\`Timestamp\` < CAST('${singleDay.upperDate}' AS DATE) AND A.\`Timestamp\` >= CAST('${singleDay.lowerDate}' AS DATE) AND A.siteCode LIKE '${siteCode}' GROUP BY A.siteCode`;
    return getConnection().query(statQuery);
  }
}
