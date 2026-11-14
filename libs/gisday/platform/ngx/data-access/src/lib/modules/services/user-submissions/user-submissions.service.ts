import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PosterDto, Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SubmissionFileDto } from '@tamu-gisc/gisday/common';

import { BaseService } from '../_base/base.service';

/** What approving or rejecting several submissions did, from the API (#2958). */
export interface ReviewSubmissionsResult {
  /** The titles of those reviewed. */
  reviewed: Array<string>;
  /** Each that failed, or was reviewed but not emailed, by title, with why. */
  failed: Array<{ title: string; reason: string }>;
}

/**
 * The toast an admin sees after approving or rejecting the selected submissions (#2958): how many were done, and each
 * that failed, by title.
 */
export function reviewSubmissionsToast(
  result: ReviewSubmissionsResult,
  acceptance: boolean
): { id: string; title: string; message: string } {
  const done = acceptance ? 'Approved' : 'Rejected';
  const count = result.reviewed.length;
  // Only claimed when every one reviewed was emailed; otherwise the problems say which were not.
  const allEmailed = !result.failed.some((f) => result.reviewed.includes(f.title));
  const reviewed =
    count === 1
      ? `${done} "${result.reviewed[0]}"${allEmailed ? ' and emailed its submitter' : ''}.`
      : `${done} ${count} submissions${allEmailed ? ' and emailed their submitters' : ''}.`;
  const failed = result.failed.map((f) => `${f.title}: ${f.reason}`).join('; ');

  return {
    id: 'submission-review',
    title: failed
      ? `Some submissions were not ${done.toLowerCase()} or emailed`
      : `${count === 1 ? 'Submission' : 'Submissions'} ${done.toLowerCase()}`,
    message: [count ? reviewed : `None were ${done.toLowerCase()}.`, failed ? `Problems - ${failed}.` : '']
      .filter(Boolean)
      .join(' ')
  };
}

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

  /**
   * Approves or rejects the submissions at once, as Submit Review does one: each is recorded and its submitter emailed
   * (#2958). One request for the whole selection.
   */
  public review(submissionGuids: Array<string>, acceptance: boolean, message?: string) {
    return this.http1.post<ReviewSubmissionsResult>(`${this.resource}/review`, {
      submissions: submissionGuids,
      acceptance,
      ...(message?.trim() ? { message: message.trim() } : {})
    });
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
