import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PosterDto, Submission } from '@tamu-gisc/gisday/platform/data-api';
import {
  EmailRecipient,
  ReminderSkipReason,
  SubmissionFileDto,
  reminderSkipSummary,
  withoutSender,
  EmailDesign
} from '@tamu-gisc/gisday/common';

import { BaseService } from '../_base/base.service';

/** The email a review would send, before it is sent (#2981): one group per kind of email in the selection. */
export interface ReviewEmailPreview {
  groups: Array<{
    kind: string;
    label: string;
    count: number;
    subject: string;
    template: string;
    /** What the window needs to show the whole email as it will arrive, in Texas A&M's design (#3114). */
    design?: EmailDesign;
    example: { title: string; to: string; cc: string; values: Record<string, string> };
  }>;
  /** Those that get no email, with why: a final reminder's that already have a file or were not accepted (#3017). */
  skipped?: Array<{ title: string; reason: ReminderSkipReason }>;
  /** People on the submissions who will not be emailed, having no speaker record (#3046, the profile email). */
  notEmailed?: Array<{ name: string; submission: string }>;
  /** A session's speakers with no email address on their record, by name, who will not be emailed (#3092). */
  noAddress?: Array<string>;
  /** The speakers it can go to, each with an address, for the window's tick boxes (#3104). */
  recipients?: Array<EmailRecipient>;
  /** Why it may only go as a copy each, when it may not go to them together (#3104). */
  copyEachReason?: string;
}

/** What sending the final reminder to several submissions did, from the API (#3017). */
export interface FinalRemindersResult {
  sent: Array<string>;
  /** Those that got none, with why: a file already, or not accepted. */
  skipped: Array<{ title: string; reason: ReminderSkipReason }>;
  failed: Array<{ title: string; reason: string }>;
}

/**
 * The toast an admin sees after sending the final reminder (#3017): how many were reminded, how many were skipped and
 * why, and each that failed, by title.
 */
export function finalRemindersToast(result: FinalRemindersResult): { id: string; title: string; message: string } {
  const count = result.sent.length;
  const sent =
    count === 0 ? 'None were reminded.' : count === 1 ? `Reminded "${result.sent[0]}".` : `Reminded ${count} submissions.`;
  const skippedText = result.skipped.length ? `Skipped ${reminderSkipSummary(result.skipped)}.` : '';
  const failed = result.failed.map((f) => `${f.title}: ${f.reason}`).join('; ');

  return {
    id: 'final-reminder',
    title: failed ? 'Some final reminders were not sent' : 'Final reminders sent',
    message: [sent, skippedText, failed ? `Problems - ${failed}.` : ''].filter(Boolean).join(' ')
  };
}

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
  public review(
    submissionGuids: Array<string>,
    acceptance: boolean,
    message?: string,
    /** The email text the reviewer saw and approved, by kind (#2981), and the sender they chose in it (#3100). */
    templates?: Record<string, string>
  ) {
    const { sender, texts } = withoutSender(templates);

    return this.http1.post<ReviewSubmissionsResult>(`${this.resource}/review`, {
      submissions: submissionGuids,
      acceptance,
      ...(message?.trim() ? { message: message.trim() } : {}),
      ...(templates ? { templates: texts } : {}),
      ...(sender ? { sender } : {})
    });
  }

  /**
   * The email approving or rejecting the submissions would send, to read and edit before anything is sent (#2981).
   * Nothing is recorded or sent.
   */
  public previewReview(submissionGuids: Array<string>, acceptance: boolean, message?: string) {
    return this.http1.post<ReviewEmailPreview>(`${this.resource}/review/preview`, {
      submissions: submissionGuids,
      acceptance,
      ...(message?.trim() ? { message: message.trim() } : {})
    });
  }

  /** The final reminder the selected submissions would get, for the reviewer to read and edit first (#3017). */
  public previewReminders(submissionGuids: Array<string>) {
    return this.http1.post<ReviewEmailPreview>(`${this.resource}/remind/preview`, { submissions: submissionGuids });
  }

  /**
   * Sends the final reminder to the selected accepted submissions that have no file yet, in the text approved (#3017), as
   * the sender chosen in the window (#3100).
   */
  public remind(submissionGuids: Array<string>, templates: Record<string, string>) {
    const { sender, texts } = withoutSender(templates);

    return this.http1.post<FinalRemindersResult>(`${this.resource}/remind`, {
      submissions: submissionGuids,
      templates: texts,
      ...(sender ? { sender } : {})
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

  /** Every file of a season's submissions as one zip, for the admins; with `submissions`, only those (#3174). */
  public getSeasonFilesZip(seasonGuid: string, submissions?: ReadonlyArray<string>) {
    const only = submissions?.length ? `?submissions=${submissions.map(encodeURIComponent).join(',')}` : '';

    return this.http1.get(`${this.resource}/season/${seasonGuid}/files.zip${only}`, { responseType: 'blob' });
  }
}
