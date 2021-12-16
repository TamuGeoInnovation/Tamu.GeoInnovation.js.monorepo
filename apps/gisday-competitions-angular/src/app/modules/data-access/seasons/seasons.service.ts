import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CompetitionSeason, SeasonStatisticsDto } from '@tamu-gisc/gisday/competitions';

@Injectable({
  providedIn: 'root'
})
export class SeasonsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = `${this.env.value('api_url')}/season`;
  }

  public getSeasons() {
    return this.http.get<Array<DeepPartial<CompetitionSeason>>>(`${this.resource}`);
  }

  public getSeason(guid: string) {
    return this.http.get<DeepPartial<CompetitionSeason>>(`${this.resource}/${guid}`);
  }

  public getSeasonStatistics(guid: string) {
    return this.http.get<SeasonStatisticsDto>(`${this.resource}/${guid}/statistics`);
  }
}
