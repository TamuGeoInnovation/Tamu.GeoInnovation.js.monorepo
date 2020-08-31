import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Result, Location } from '@tamu-gisc/ues/effluent/common/entities';
import { IAverageResponse } from '@tamu-gisc/ues/effluent/data-api';
import { Group } from '@tamu-gisc/common/utils/collection';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.apiUrl = this.env.value('apiUrl') + 'results';
  }

  public getResults() {
    return this.http.get<Array<Group<Result>>>(this.apiUrl);
  }

  public getResultsForSample(location: Partial<Location>) {
    return this.http.get<Array<Result>>(`${this.apiUrl}/latest/${location.tier}/${location.sample}`);
  }

  public getLatestResults() {
    return this.http.get<Array<Result>>(`${this.apiUrl}/latest`);
  }

  public getLatestResultsAverage() {
    return this.http.get<IAverageResponse>(`${this.apiUrl}/latest/average`);
  }

  public uploadData(data: FormData) {
    return this.http.post(`${this.apiUrl}/csv`, data, {
      reportProgress: true
    });
  }
}
