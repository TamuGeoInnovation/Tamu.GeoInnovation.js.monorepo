import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IScenariosRequestPayload } from '@tamu-gisc/cpa/data-api';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'scenarios';
  }

  public createScenario(scenario: IScenariosRequestPayload) {
    return this.http.post(this.resource, scenario);
  }

  public getScenarios() {
    return this.http.get(this.resource);
  }
}
