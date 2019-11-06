import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {

  constructor(private http: HttpClient) { }

  public getUserSubmissions(userGuid: string) {
    // const url = "https://gisday.tamu.edu/Rest/Signage/Get/Submissions?userGuid=21062b5d-7063-46e0-9ea2-e5371ae4df11";
    const url = "http://localhost/gisday.tamu.edu/Rest/Signage/Get/Submissions?&geoJSON=true";
    return this.http.get<any>(url);
  }

  public generateFakeMapData() {
    const fakeData: IPoint[] = [
      {
        type: "point",
        latitude: 30.61149,
        longitude: -96.34680
      },
      {
        type: "point",
        latitude: 30.61270,
        longitude: -96.34682
      },
      {
        type: "point",
        latitude: 30.61300,
        longitude: -96.34608
      },
      {
        type: "point",
        latitude: 30.61268,
        longitude: -96.34534
      },
      {
        type: "point",
        latitude: 30.61339,
        longitude: -96.34351
      },
      {
        type: "point",
        latitude: 30.61103,
        longitude: -96.34328
      },
      {
        type: "point",
        latitude: 30.60947,
        longitude: -96.34245
      },
      {
        type: "point",
        latitude: 30.60979,
        longitude: -96.33723
      },
      {
        type: "point",
        latitude: 30.61076,
        longitude: -96.33881
      },
    ]
    return fakeData;


  }

}

interface IPoint {
  type: string,
  latitude: number,
  longitude: number,
}
