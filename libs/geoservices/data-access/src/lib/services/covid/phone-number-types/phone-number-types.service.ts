import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FieldCategory } from '@tamu-gisc/covid/common/entities';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberTypesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'field-categories';
  }

  public getPhoneNumberTypes() {
    return this.http.get<Partial<FieldCategory>>(`${this.resource}/types/${CATEGORY.PHONE_NUMBERS}`);
  }
}
