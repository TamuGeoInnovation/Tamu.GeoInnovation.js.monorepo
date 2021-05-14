import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Location } from '@tamu-gisc/ues/recycling/common/entities';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.apiUrl = this.env.value('apiUrl') + 'locations';
  }

  public getLocations(): Observable<Array<Location>> {
    return this.http.get<Array<Location>>(this.apiUrl, { withCredentials: true });
  }

  public getLocationsResults(): Observable<Array<Location>> {
    return this.http.get<Array<Location>>(this.apiUrl + '/results', { withCredentials: true });
  }
}
