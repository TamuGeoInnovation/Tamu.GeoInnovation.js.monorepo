import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  public getUserSubmissions(userGuid: string) {
    return this.http.get<any>("https://gisday.tamu.edu/Rest/Signage/Get/Submissions?userGuid=21062b5d-7063-46e0-9ea2-e5371ae4df11");
  }


}
