import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IPayflowExpressCheckoutTokenResponse, IPayflowPostbackResponse } from '@tamu-gisc/geoservices/data-api';
import { OnApproveData } from '@paypal/paypal-js';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  public resource: string;

  constructor(private readonly env: EnvironmentService, private http: HttpClient) {
    this.resource = `${this.env.value('api_url')}/payments`;
  }

  public initializeOrder(userGuid: string, email: string): Observable<IPayflowExpressCheckoutTokenResponse> {
    return this.http.post<IPayflowExpressCheckoutTokenResponse>(
      `${this.resource}/order`,
      {
        userGuid,
        email
      }
      //,
      // {
      //   withCredentials: true
      // }
    );
  }

  public captureOrder(postback: OnApproveData): Observable<IPayflowPostbackResponse> {
    return this.http.post<IPayflowPostbackResponse>(
      `${this.resource}/order/callback`,
      postback
      //,
      //   {
      //   withCredentials: true
      // }
    );
  }
}
