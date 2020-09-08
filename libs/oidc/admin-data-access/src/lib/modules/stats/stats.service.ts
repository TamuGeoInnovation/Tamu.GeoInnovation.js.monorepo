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
    return this.http.get<number>(this.resource, {
      withCredentials: true
    });
  }

  public countOfUsersByClient() {
    return this.http
      .get<Partial<ICountOfUsersByClient>>(`${this.resource}/2`, {
        withCredentials: true
      })
      .pipe(
        map<ICountOfUsersByClient, IChartConfiguration[]>((value: Partial<ICountOfUsersByClient>, index: number) => {
          const configs: IChartConfiguration[] = [];
          const config: IChartConfiguration = {
            data: {
              datasets: [
                {
                  data: value.clientUsers
                }
              ],
              labels: value.clientNames
            },
            options: {
              cutoutPercentage: 50,
              title: {
                text: 'Count of users per client'
              }
            }
          };
          configs.push(config);

          return configs;
        })
      );
  }

  public totalLoginsPastMonth() {
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

  public countOfNewUsers() {
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

  public getServerErrorCount() {
    return this.http
      .get<Array<Partial<IStatResponse>>>(this.resource, {
        withCredentials: true
      })
      .pipe(
        map<IStatResponse[], IChartConfiguration[]>((value: Partial<IStatResponse[]>, index: number) => {
          return this.chartConfigurationMap();
        })
      );
  }

  private chartConfigurationMap() {
    const configs: IChartConfiguration[] = [];
    const config: IChartConfiguration = {
      data: {
        datasets: [{}]
      }
    };
    return configs;
  }
}

export interface IStatResponse {
  data: number[];
}

export interface ICountOfUsersByClient {
  clientNames: string[];
  clientUsers: number[];
}
