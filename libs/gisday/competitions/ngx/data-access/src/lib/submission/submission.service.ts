import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  ICompetitionSubmission,
  ValidateSubmissionDto,
  SubmissionReviewDto,
  SubmissionMediaDto
} from '@tamu-gisc/gisday/competitions/data-api/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private env = inject(EnvironmentService);
  private http = inject(HttpClient);

  public resource: string;

  constructor() {
    this.resource = `${this.env.value('api_url')}/competitions/submissions`;
  }

  public postSubmission(submission: FormData) {
    const httpOptions = {
      headers: new HttpHeaders({
        'ngsw-bypass': ''
      })
    };

    // A failure is passed on as it is: the submission form says what went wrong and offers to try
    // again (#1784). Replacing it with a plain Error hid whether it was the connection, the sign-in or
    // the server.
    return this.http.post(`${this.resource}`, submission, {
      reportProgress: true,
      observe: 'events',
      headers: httpOptions.headers
    });
  }

  public getSubmissionDetails(submissionGuid: string) {
    return this.http.get<ICompetitionSubmission>(`${this.resource}/${submissionGuid}`);
  }

  public getImage(submissionGuid) {
    return this.http.get(`${this.resource}/${submissionGuid}/image`, { responseType: 'blob' });
  }

  /**
   * Starts publishing the active season's submissions to its ArcGIS Online layer again, on the server
   * (#2433, #2434 review).
   */
  public publishToArcgis() {
    return this.http.post<{ queued: number; configured?: false; alreadyRunning?: true }>(
      `${this.resource}/arcgis/publish`,
      {}
    );
  }

  public validateSubmission(params: ValidateSubmissionDto) {
    return this.http.post(`${this.resource}/validate`, params);
  }

  /**
   * The signed-in participant's own submissions (#1791).
   */
  public getMySubmissions(seasonGuid?: string) {
    const params = seasonGuid ? { seasonGuid } : {};
    return this.http.get<SubmissionReviewDto[]>(`${this.resource}/user/me`, { params });
  }

  public getUserSubmissions(userGuid: string, seasonGuid?: string) {
    const params = seasonGuid ? { seasonGuid } : {};
    return this.http.get<SubmissionReviewDto[]>(`${this.resource}/user/${userGuid}`, { params });
  }

  public getAdminSubmissions(seasonGuid?: string) {
    const params = seasonGuid ? { seasonGuid } : {};
    return this.http.get<SubmissionReviewDto[]>(`${this.resource}/admin`, { params });
  }

  public getSubmissionImages(submissionGuid: string) {
    return this.http.get<SubmissionMediaDto[]>(`${this.resource}/${submissionGuid}/images`);
  }
}
