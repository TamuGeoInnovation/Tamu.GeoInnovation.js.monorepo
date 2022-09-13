import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContactMessageDto } from '@tamu-gisc/geoservices/data-api';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private resource: string;

  constructor(private readonly http: HttpClient, private readonly env: EnvironmentService) {
    this.resource = `${this.env.value('api_url')}/contact`;
  }

  public postFormMessage(message: ContactMessageDto) {
    return this.http.post(this.resource, message);
  }
}
