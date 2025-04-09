import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IPayflowSecureTokenResponse } from '@tamu-gisc/geoservices/data-api';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  public resource: string;

  constructor(private readonly env: EnvironmentService, private http: HttpClient) {
    this.resource = `${this.env.value('api_url')}/payments`;
  }

  public initializeOrder(): Observable<IPayflowSecureTokenResponse> {
    return this.http.get<IPayflowSecureTokenResponse>(`${this.resource}/order`, {
      withCredentials: true
    });
  }
}
