import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { State } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class StatesService {
  private resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'states';
  }

  public getStates() {
    return this.http.get<Array<Partial<State>>>(this.resource);
  }
}
