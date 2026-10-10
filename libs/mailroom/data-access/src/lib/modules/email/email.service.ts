import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MailroomEmail } from '@tamu-gisc/mailroom/common';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private env = inject(EnvironmentService);
  private http = inject(HttpClient);

  public resource: string;

  constructor() {
    this.resource = this.env.value('api_url');
  }

  public getEmailWithAttachment(guid: string) {
    return this.http.get<MailroomEmail>(`${this.resource}/${guid}`);
  }

  public getEmails() {
    return this.http.get<Array<MailroomEmail>>(`${this.resource}/all`);
  }

  public deleteEmail(emailId: number) {
    return this.http.delete<boolean>(`${this.resource}/${emailId}`);
  }
}
