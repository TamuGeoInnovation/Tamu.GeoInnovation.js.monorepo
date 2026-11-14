import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PosterDto, Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SubmissionFileDto } from '@tamu-gisc/gisday/common';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService extends BaseService<Submission> {
  private http1 = inject(HttpClient);

  public withCredentials = true;
  public resource: string;

  constructor() {
    super('user-submissions');
  }

  public getPresentationsForActiveSeason() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/me`);
  }

  public getPosters(season?: string) {
    return this.http1.get<Array<PosterDto>>(`${this.resource}/posters`, { params: season ? { season } : {} });
  }

  /** The files attached to a submission (#2933). */
  public getFiles(submissionGuid: string) {
    return this.http1.get<Array<SubmissionFileDto>>(`${this.resource}/${submissionGuid}/files`);
  }

  /** Attaches a file, reporting the upload's progress as it goes. */
  public addFile(submissionGuid: string, file: File): Observable<HttpEvent<SubmissionFileDto>> {
    const body = new FormData();

    body.append('file', file, file.name);

    return this.http1.post<SubmissionFileDto>(`${this.resource}/${submissionGuid}/files`, body, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public deleteFile(submissionGuid: string, fileGuid: string) {
    return this.http1.delete<void>(`${this.resource}/${submissionGuid}/files/${fileGuid}`);
  }

  /** One file's contents, to save under its own name. */
  public getFileContents(submissionGuid: string, fileGuid: string) {
    return this.http1.get(`${this.resource}/${submissionGuid}/files/${fileGuid}`, { responseType: 'blob' });
  }

  /** Every file of a season's submissions as one zip, for the admins. */
  public getSeasonFilesZip(seasonGuid: string) {
    return this.http1.get(`${this.resource}/season/${seasonGuid}/files.zip`, { responseType: 'blob' });
  }
}
