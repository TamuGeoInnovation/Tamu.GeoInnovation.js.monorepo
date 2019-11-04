import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISubmission } from '../entity/submission.entity';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  constructor(private http: HttpClient) { }

  public postSubmission(submission: FormData) {
    return this.http.post<any>("https://gisday.tamu.edu/Rest/Signage/Push/Submissions/", submission)
  }


}
