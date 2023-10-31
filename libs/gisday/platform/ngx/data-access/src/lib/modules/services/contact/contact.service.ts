import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = `${this.environment.value(`api_url`)}/contact`;
  }

  public sendEmail(body: Partial<IMailroomEmailOutbound>);
  public sendEmail(body: FormData);
  public sendEmail(body: unknown) {
    return this.http.post(this.resource, body);
  }
}
