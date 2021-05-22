import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Location } from '@tamu-gisc/ues/effluent/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private apiUrl: string;
  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.apiUrl = this.env.value('apiUrl') + '/locations';
  }

  public getLocations(): Observable<Array<Location>> {
    return this.http.get<Array<Location>>(this.apiUrl);
  }
}
