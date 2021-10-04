import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import {
  IStrapiPageResponse,
  StrapiSingleTypes,
  IStrapiStapleFooter,
  IStrapiStapleNavigation,
  IStrapiBugCount,
  GeoJSONFeatureCollection,
  IStrapiStapleFunder
} from '../types/types';

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

  public getFunder(type: StrapiSingleTypes = 'funder', locale: string = 'en') {
    return this.http.get<IStrapiStapleFunder>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getCountyLayer() {
    return this.http.get<GeoJSONFeatureCollection>('http://localhost:1337/uploads/counties20m_696b17e926.json');
  }

  public getAllBugData() {
    return this.http.get<IStrapiBugCount[]>(`${this.resource}/bug-submissions/all`);
  }

  public getBugData(speciesGuid: string, month: number) {
    return this.http.get<IStrapiBugCount[]>(`${this.resource}/bug-submissions/speciesByMonth/${speciesGuid}/${month}`);
  }

  public sendEmail(body: FormData) {
    return this.http.post(`${this.environment.value('email_server_url')}/`, body);
  }
}
