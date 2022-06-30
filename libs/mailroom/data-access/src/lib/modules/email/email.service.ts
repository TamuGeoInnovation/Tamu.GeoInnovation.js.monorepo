import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  public resource = 'http://localhost:4005';

  constructor(private http: HttpClient) {}

  // constructor(private env: EnvironmentService, private http: HttpClient) {
  //   this.resource = this.env.value('api_url') + '/email';
  // }

  public getEmail(guid: string) {
    return this.http.get(`${this.resource}/${guid}`);
  }

  public getEmailWithAttachment(guid: string) {
    return this.http.get(`${this.resource}/${guid}/attachment`);
  }

  public getEmails() {
    return this.http.get(`${this.resource}/all`);
  }
}
