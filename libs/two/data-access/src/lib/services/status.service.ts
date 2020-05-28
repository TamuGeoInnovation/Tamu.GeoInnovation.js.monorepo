import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import date from 'date-and-time';

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
    return this.http.post<Array<Partial<IStatusResponse>>>(this.resource, dateHistory);
  }
}

export interface IStatusResponse {
  siteCode: string;
  success: string;
  failure: string;
  latest: string;
}

export interface IDateHistory {
  siteCode: string;
  dateRange: IHistoryRange[];
}

export interface IHistoryRange {
  upperDate: string;
  lowerDate: string;
}
