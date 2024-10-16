import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ValveIntervention, ValveInterventionAttributes } from '@tamu-gisc/ues/cold-water/data-api';

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
    return this.http.get<ValveIntervention>(`${this.url}/interventions/${id}`, { withCredentials: true }).pipe(
      map((intervention) => {
        return intervention.attributes;
      })
    );
  }

  /**
   * Gets all of the intervention records for a given valve number.
   */
  public getInterventionsForValve(valveId: string | number) {
    return this.http.get<Array<ValveIntervention>>(`${this.url}/interventions/valve/${valveId}`, { withCredentials: true });
  }

  /**
   * Submits an intervention record with the provided intervention details.
   */
  public addIntervention(attributes: ValveInterventionAttributes) {
    return this.http.post(`${this.url}/interventions/`, { intervention: attributes }, { withCredentials: true });
  }

  /**
   * Submits an intervention record update with the provided updated intervention details.
   */
  public updateIntervention(attributes: ValveInterventionAttributes) {
    return this.http.put(`${this.url}/interventions/`, { intervention: attributes }, { withCredentials: true });
  }

  /**
   * Submits an intervention record for deletion.
   */
  public deleteIntervention(attributes: ValveInterventionAttributes) {
    return this.http.delete(`${this.url}/interventions/${attributes.OBJECTID}`, {
      withCredentials: true
    });
  }
}
