import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private url: string;
  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.url = this.env.value('interventionApiUrl');
  }

  public getIntervention(id: number | string) {
    return this.http.get<ValveIntervention[]>(this.url).pipe(pluck(0));
  }

  public addIntervention(intervention: ValveIntervention) {
    return this.http.post(this.url, { params: intervention });
  }
}

export interface ValveIntervention {
  ValveNumber: number;
  SubmittedBy: string;
  Date: Date;
  OperatorName: string;
  LocationDescription: string;
  EstimatedRestoration: Date;
  YellowLidPlaced: string;
  LockoutTagePlaced: string;
  DoesMapNeedUpdate: string;
  WorkOrder: string;
}
