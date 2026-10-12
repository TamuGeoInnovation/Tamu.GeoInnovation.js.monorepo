import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private environment = inject(EnvironmentService);

  private resource: string;

  constructor() {
    this.resource = `${this.environment.value(`api_url`)}/contact`;
  }

  public sendEmail(body: Partial<IMailroomEmailOutbound>);
  public sendEmail(body: FormData);
  public sendEmail(body: unknown) {
    return this.http.post(this.resource, body);
  }
}
