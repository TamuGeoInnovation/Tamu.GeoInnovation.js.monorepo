import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';


@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) { 
    this.resource = this.env.value('two_dashboard_api_url') + 'status';
  }

  public status() {
    return this.http.get<Array<Partial<IStatusResponse>>>(this.resource);
  }
}

export interface IStatusResponse {
  siteCode: string;
  success: string;
  failure: string;
  latest: string;
}