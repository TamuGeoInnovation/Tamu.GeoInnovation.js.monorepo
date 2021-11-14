import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private readonly ns: NotificationService) {
    this.resource = `${this.env.value('api_url')}/submission`;
  }

  public postSubmission(submission: FormData) {
    const httpOptions = {
      headers: new HttpHeaders({
        'ngsw-bypass': ''
      })
    };

    return this.http
      .post(`${this.resource}/upload`, submission, {
        reportProgress: true,
        observe: 'events',
        headers: httpOptions.headers
      })
      .pipe(
        catchError((err) => {
          this.ns.toast({
            id: 'submission-upload-failure',
            title: 'Server Error Uploading Submission',
            message: `The server experienced an error processing your submission. Please try again later. (${err.status})`
          });

          throw new Error(`Failed uploading submission.`);
        })
      );
  }
}
