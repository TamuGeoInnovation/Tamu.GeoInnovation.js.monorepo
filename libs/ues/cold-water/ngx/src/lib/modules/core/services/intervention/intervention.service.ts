import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private url: string;
  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.url = this.env.value('interventionApiUrl');
  }

  /**
   * Gets a specific intervention record by intervention id.
   */
  public getIntervention(id: number | string) {
    return this.http
      .get<ValveIntervention[]>(`${this.url}/query`, {
        params: {
          where: `OBJECTID = ${id}`,
          outFields: '*',
          f: 'pjson'
        },
        withCredentials: true
      })
      .pipe(pluck('features'));
  }

  /**
   * Gets all of the intervention records for a given valve number.
   */
  public getInterventionsForValve(valveId: string | number) {
    return this.http.get<Array<ValveIntervention>>(`${this.url}/query`, {
      params: {
        where: `ValveNumber = ${valveId}`,
        outFields: '*',
        f: 'pjson'
      }
    });
  }

  /**
   * Submits an intervention record with the provided intervention details.
   */
  public addIntervention(intervention: ValveIntervention) {
    return this.http.post(`${this.url}/applyEdits`, {
      params: {
        adds: [
          {
            attributes: intervention
          }
        ]
      }
    });
  }
}

export interface ValveIntervention {
  ValveNumber: number;
  SubmittedBy: string;
  Date: Date;
  OperatorName: string;
  LocationDescription: string;
  Reason: string;
  AffectedBuildings: string;
  EstimatedRestoration: Date;
  YellowLidPlaced: string;
  LockoutTagePlaced: string;
  DoesMapNeedUpdate: string;
  WorkOrder: string;
}
