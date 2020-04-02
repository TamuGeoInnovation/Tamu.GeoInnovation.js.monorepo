import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PhoneNumberType } from '@tamu-gisc/covid/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberTypesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'phone-number-types';
  }

  public getPhoneNumberTypes() {
    return this.http.get<Array<Partial<PhoneNumberType>>>(this.resource);
  }
}
