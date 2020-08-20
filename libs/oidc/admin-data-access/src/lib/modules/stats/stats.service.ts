import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, reduce } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IChartConfiguration } from '@tamu-gisc/charts';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/stats';
  }

  public getCountOfLoggedInUsers() {
    return this.http
      .get<Array<Partial<IStatResponse>>>(this.resource, {
        withCredentials: true
      })
      .pipe(
        map<IStatResponse[], IChartConfiguration[]>((value: Partial<IStatResponse[]>, index: number) => {
          const configs: IChartConfiguration[] = [];
          const config: IChartConfiguration = {
            data: {
              datasets: [{}]
            }
          };
          return configs;
        })
      );
  }

  public getClientsByCountOfUsers() {}

  public getLoginsPastMonth() {}

  public getRegistrationsPastMonth() {}

  public getServerErrorCount() {}
}

export interface IStatResponse {}
