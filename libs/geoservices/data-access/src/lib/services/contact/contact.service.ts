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
    this.resource = `${this.env.value('api_url')}/mail`;
  }

  public postFormMessage(message: ContactMessageDto) {
    const formData = new FormData();

    Object.keys(message).forEach((key) => {
      formData.append(key, message[key]);
    });

    return this.http.post(this.resource, formData);
  }
}
