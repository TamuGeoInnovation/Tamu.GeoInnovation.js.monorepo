import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Result, Location } from '@tamu-gisc/ues/recycling/common/entities';
import { IAverageResponse } from '@tamu-gisc/ues/recycling/data-api';
import { Group } from '@tamu-gisc/common/utils/collection';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.apiUrl = this.env.value('apiUrl') + 'results';
  }

  public getResults() {
    return this.http.get<Array<Group<Result>>>(this.apiUrl, { withCredentials: true });
  }

  public getResultsForLocation(location: Partial<Location>) {
    return this.http.get<Array<Result>>(`${this.apiUrl}/latest/${location.id}`, {
      withCredentials: true
    });
  }

  public getResultsForLocationForDays(location: Partial<Location>, days: number) {
    return this.http.get<Array<Result>>(`${this.apiUrl}/latest/${location.id}/${days}`, {
      withCredentials: true
    });
  }

  public getLatestResults() {
    return this.http.get<Array<Result>>(`${this.apiUrl}/latest`, { withCredentials: true });
  }

  public getLatestResultsAverage() {
    return this.http.get<IAverageResponse>(`${this.apiUrl}/latest/average`, { withCredentials: true });
  }

  public uploadData(data: FormData) {
    return this.http.post(`${this.apiUrl}/csv`, data, {
      reportProgress: true,
      withCredentials: true
    });
  }
}
