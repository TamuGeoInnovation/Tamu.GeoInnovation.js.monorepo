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
    this.resource = this.environment.value(`api_url`);
  }
  public sendEmailAsFormData(body: FormData) {
    return this.http.post(`${this.environment.value('email_server_url')}/`, body);
  }

  public sendEmail(body: IMailroomEmailOutbound) {
    return this.http.post(`${this.environment.value('email_server_url')}/`, body);
  }
}

