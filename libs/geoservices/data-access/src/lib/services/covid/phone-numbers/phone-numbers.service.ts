import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { County, EntityValue } from '@tamu-gisc/covid/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumbersService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'phone-numbers';
  }

  public setPhoneNumbersForCounty(numbers: Array<Partial<EntityValue>>, countyFips?: number) {
    return this.http.post<Partial<County>>(`${this.resource}/county`, { numbers, countyFips });
  }

  public getPhoneNumbersForCounty(countyFips: number) {
    return this.http.get<Partial<Array<EntityValue>>>(`${this.resource}/county/${countyFips}`);
  }

  public getPhoneNumbersForClaimInfo(guid: string) {
    return this.http.get<Array<EntityValue>>(`${this.resource}/claim/info/${guid}`);
  }
}
