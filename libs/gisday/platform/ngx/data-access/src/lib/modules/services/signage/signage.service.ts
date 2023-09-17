import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignageService {
  constructor(private http: HttpClient) {}

  public getUrl(competition: string) {
    // TODO: Update to a local url if possible; since this is an old competition maybe not
    return `https://gisday.tamu.edu/rest/${competition}/Get/Submissions/?geoJSON=true`;
  }

  public getSignage() {
    // TODO: Need to configure this resource endpoint with the correct audience (not the same as the master api)
    return this.http.get(this.getUrl('Signage'));
  }
}
