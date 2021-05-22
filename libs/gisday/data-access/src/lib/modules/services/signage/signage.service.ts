import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignageService {
  public withCredentials = false;

  constructor(private http: HttpClient) {}

  public getUrl(competition: string) {
    return `https://gisday.tamu.edu/rest/${competition}/Get/Submissions/?geoJSON=true`;
  }

  public getSignage() {
    return this.http.get(this.getUrl('Signage'), {
      withCredentials: this.withCredentials
    });
  }
}
