import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';
import { EmailSenderChoices } from '@tamu-gisc/gisday/common';

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

  /** The addresses the signed-in admin may send the email composer's emails as, their own first (#3100). */
  public senders() {
    return this.http.get<EmailSenderChoices>(`${this.environment.value('api_url')}/email-senders`);
  }
}
