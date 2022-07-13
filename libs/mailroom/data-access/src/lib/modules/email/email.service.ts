import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MailroomEmail } from '@tamu-gisc/mailroom/common';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url');
  }

  public getEmailWithAttachment(guid: string) {
    return this.http.get<MailroomEmail>(`${this.resource}/${guid}`);
  }

  public getEmails() {
    return this.http.get<Array<MailroomEmail>>(`${this.resource}/all`);
  }

  public deleteEmail(emailId: number) {
    return this.http.delete(`${this.resource}/${emailId}`);
  }
}
