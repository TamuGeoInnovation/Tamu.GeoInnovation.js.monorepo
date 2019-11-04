import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISubmission } from '../entity/submission.entity';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  constructor(private http: HttpClient) { }

  public postSubmission(submission: ISubmission) {
    return this.http.post<any>("https://gisday.tamu.edu/Rest/Signage/Push/Submissions/", {
      UserGuid: submission.userGuid,
      SignType: submission.signType,
      Description: submission.description,
      Lat: submission.local.lat,
      Lon: submission.local.lon,
      Accuracy: submission.local.accuracy,
      Timestamp: submission.local.timestamp,
      Heading: submission.local.heading,
      Altitude: submission.local.altitude,
      Speed: submission.local.speed,
    }, {
      withCredentials: true,
    })
  }


}
