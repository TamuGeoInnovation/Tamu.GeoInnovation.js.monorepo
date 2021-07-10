import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ValveIntervention, ValveInterventionAttributes } from '@tamu-gisc/ues/cold-water/data-api';``

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private url: string;
  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.url = this.env.value('apiUrl');
  }

  /**
   * Gets a specific intervention record by intervention id.
   */
  public getIntervention(id: number | string) {
    return this.http.get<Array<ValveInterventionAttributes>>(`${this.url}/interventions/${id}`).pipe(pluck('attributes'));
  }

  /**
   * Gets all of the intervention records for a given valve number.
   */
  public getInterventionsForValve(valveId: string | number) {
    return this.http.get<Array<ValveIntervention>>(`${this.url}/interventions/valve/${valveId}`);
  }

  /**
   * Submits an intervention record with the provided intervention details.
   */
  public addIntervention(attributes: ValveInterventionAttributes) {
    return this.http.post(`${this.url}/interventions/`, { intervention: attributes });
  }
}
