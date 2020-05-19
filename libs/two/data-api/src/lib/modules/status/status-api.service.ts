import { Injectable } from '@nestjs/common';
import { Repository, getConnection } from 'typeorm';

@Injectable()
export class StatusAPIService {
    constructor() {}
    public async getStatus() {
        const statQuery = `SELECT A.siteCode, COUNT(A.siteCode) as success, (SELECT COUNT(siteCode) FROM TWO.Entry_failure WHERE siteCode = A.siteCode) as failure, (SELECT max(\`Timestamp\`) as latest from TWO.WeatherFlux_Test WHERE siteCode = A.siteCode GROUP BY siteCode) as latest FROM TWO.WeatherFlux_Test A WHERE A.\`Timestamp\` <= CAST('2020-03-10' AS DATE) AND A.\`Timestamp\` > CAST('2017-01-01' AS DATE) GROUP BY A.siteCode`;
        return getConnection().query(statQuery).then((result) => {
            return result;
        }).catch((typeormErr) => {
            throw typeormErr;
        });
    }
}
