import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import {
  IStrapiPageResponse,
  StrapiSingleTypes,
  IStrapiStapleFooter,
  IStrapiStapleNavigation,
  IStrapiBugRecord
} from '../types/types';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`);
  }

  public getPage(type: StrapiSingleTypes, locale: string = 'en') {
    return this.http.get<IStrapiPageResponse>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getNavigation(type: StrapiSingleTypes = 'navigation', locale: string = 'en') {
    return this.http.get<IStrapiStapleNavigation>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getFooter(type: StrapiSingleTypes = 'footer', locale: string = 'en') {
    return this.http.get<IStrapiStapleFooter>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getData() {
    // https://kissingbug.tamu.edu/REST/GET/SpeciesByMonth/?speciesGuid=&month=0&_=1630915441326
    // ${this.resource}/bug-submissions?_countyFips=48061&_month=July
    return this.http.get<IStrapiBugRecord>(`${this.resource}/bug-submissions`).pipe(
      groupBy((record) => record.countyFips),
      mergeMap((group) => group.pipe(toArray()))
    );
  }
}
