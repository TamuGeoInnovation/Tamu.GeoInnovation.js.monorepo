import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import date from 'date-and-time';

import { IChartConfiguration } from '@tamu-gisc/ui-kits/ngx/charts';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('two_dashboard_api_url') + 'status';
  }

  public status() {
    return this.http.get<Array<Partial<IStatusResponse>>>(this.resource);
  }

  public siteHistory(siteCode: string, history: number) {
    const now = new Date();
    const dateRange = [];

    // there's a reason this is done backwards, I just can't remember why
    // since there's no array.mapBackwards() this will stay as is until I can remember why
    for (let i = history; i > 0; i--) {
      const lowerDate = date.addDays(now, -1 * i);
      const upperDate = date.addDays(now, -1 * (i - 1));
      dateRange.push({
        upperDate: date.format(upperDate, 'YYYY-MM-DD'),
        lowerDate: date.format(lowerDate, 'YYYY-MM-DD')
      });
    }

    const dateHistory: IDateHistory = {
      siteCode: siteCode,
      dateRange: dateRange
    };

    return this.http.post<Array<Partial<IStatusResponse>>>(this.resource, dateHistory).pipe(
      map<IStatusResponse[], IChartConfiguration[]>((value: Partial<IStatusResponse[]>, index: number) => {
        const configs: IChartConfiguration[] = value.map((val: IStatusResponse) => {
          return {
            data: {
              datasets: [
                {
                  data: [Number.parseInt(val.success, 10), Number.parseInt(val.failure, 10)]
                }
              ],
              labels: ['Successes', 'Failures']
            },
            options: {
              cutoutPercentage: 50,
              title: {
                text: val.date
              }
            }
          };
        });

        return configs;
      })
    );
  }

  public demoSiteHistory() {
    const dateRange = [
      {
        upperDate: '2018-05-16',
        lowerDate: '2018-05-15'
      },
      {
        upperDate: '2018-05-18',
        lowerDate: '2018-05-17'
      },
      {
        upperDate: '2018-05-20',
        lowerDate: '2018-05-19'
      }
    ];

    const dateHistory: IDateHistory = {
      siteCode: 'RFPr',
      dateRange: dateRange
    };
    return this.http.post<Array<Partial<IStatusResponse>>>(this.resource, dateHistory).pipe(
      map<IStatusResponse[], IChartConfiguration[]>((value: Partial<IStatusResponse[]>, index: number) => {
        const configs: IChartConfiguration[] = value.map((val: IStatusResponse) => {
          return {
            data: {
              datasets: [
                {
                  data: [Number.parseInt(val.success, 10), Number.parseInt(val.failure, 10)]
                }
              ],
              labels: ['Successes', 'Failures']
            },
            options: {
              cutoutPercentage: 50,
              title: {
                text: val.date
              }
            }
          };
        });

        return configs;
      })
    );
  }
}

export interface IStatusResponse {
  siteCode?: string;
  success?: string;
  failure?: string;
  latest?: string;
  date?: string;
}

export interface IDateHistory {
  siteCode: string;
  dateRange: IHistoryRange[];
}

export interface IHistoryRange {
  upperDate: string;
  lowerDate: string;
}
