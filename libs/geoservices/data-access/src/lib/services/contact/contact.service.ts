import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContactMessageDto } from '@tamu-gisc/geoservices/data-api';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  private resource: string;

  constructor() {
    this.resource = `${this.env.value('api_url')}/contact`;
  }

  public postFormMessage(message: ContactMessageDto) {
    return this.http.post(this.resource, { ...message });
  }
}
