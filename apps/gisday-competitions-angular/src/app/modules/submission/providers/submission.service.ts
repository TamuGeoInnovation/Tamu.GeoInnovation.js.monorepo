import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  constructor(private environment: EnvironmentService, private http: HttpClient) {}

  public postSubmission(submission: FormData) {
    return this.http.post<SubmissionResult>(this.environment.value('SubmissionsPostUrl'), submission, {
      reportProgress: true,
      observe: 'events'
    });
  }
}

export interface SubmissionResult {
  ResultCode: string;
}
