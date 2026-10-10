import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CompetitionSeason, SeasonStatisticsDto } from '@tamu-gisc/gisday/competitions/data-api';

@Injectable({
  providedIn: 'root'
})
export class SeasonsService {
  private env = inject(EnvironmentService);
  private http = inject(HttpClient);

  public resource: string;

  constructor() {
    this.resource = `${this.env.value('api_url')}/competitions/seasons`;
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
