import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = `${this.env.value('api_url')}/submission`;
  }

  public postSubmission(submission: FormData) {
    return this.http
      .post(`${this.resource}/upload`, submission, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        catchError((err) => {
          throw new Error(`Could not post submission: ${err.message}`);
        })
      );
  }
}
