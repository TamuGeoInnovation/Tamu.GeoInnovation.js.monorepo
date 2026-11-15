import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ReviewEmailPreview } from '../user-submissions/user-submissions.service';

/** The fields a speaker may change on their own profile (#2936). */
export interface SpeakerEditFields {
  description?: string | null;
  affiliation?: string | null;
  socialMedia?: string | null;
  graduationYear?: string | null;
  /** As the API shows it; a proposal sends the guid alone (#2953). */
  university?: { guid: string; name: string | null } | null;
}

/** What a speaker sends: the university by guid. */
export type SpeakerEditProposal = Omit<SpeakerEditFields, 'university'> & { university?: string | null };

/** What a speaker's edit link opens: their profile as it is, and anything they already proposed. */
export interface SpeakerEditPage {
  firstName: string;
  lastName: string;
  current: SpeakerEditFields;
  /** The organization the public page shows instead of the affiliation, when the speaker has one. */
  organization: string | null;
  photo: string | null;
  pending: (SpeakerEditFields & { photo: boolean; sent: string }) | null;
  expires: string;
  limits: { description: number; affiliation: number; socialMedia: number };
}

/** One edit waiting for an admin, with the speaker as they are now. */
export interface PendingSpeakerEdit {
  guid: string;
  sent: string;
  speaker: { guid: string; firstName: string; lastName: string };
  current: SpeakerEditFields;
  proposed: SpeakerEditFields;
  photo: boolean;
  /** The speaker's photo now, under the site's uploads, or null. */
  currentPhoto: string | null;
}

/** The profile email as the admin approved it (#3023): its subject and text, with their placeholders. */
export interface ProfileEmail {
  subject: string;
  template: string;
}

/** What sending edit links did, from the API. */
export interface SendEditLinksResult {
  sent: Array<string>;
  skipped: Array<{ name: string; reason: string }>;
  /**
   * Sent for competition submissions (#2958): each participant matched to no speaker record of the season, with their
   * submission's title, so the admin can add them.
   */
  unmatched?: Array<{ name: string; submission: string }>;
}

/**
 * The toast an admin sees after sending edit links, from the Speakers list, an event's page or Research Competitions
 * alike: who got one, and who did not and why (no email on their record, a mail failure, or no speaker record).
 */
export function sendEditLinksToast(result: SendEditLinksResult): { id: string; title: string; message: string } {
  const sent = result.sent.length === 1 ? `Sent to ${result.sent[0]}.` : `Sent to ${result.sent.length} speakers.`;
  const skipped = result.skipped.map((s) => `${s.name}: ${s.reason}`).join('; ');
  const unmatched = (result.unmatched ?? []).map((u) => `${u.name} (${u.submission})`).join('; ');

  return {
    id: 'speaker-edit-links',
    title: skipped || unmatched ? 'Some profile emails were not sent' : 'Profile emails sent',
    message: [
      result.sent.length ? sent : 'None were sent.',
      skipped ? `Not sent - ${skipped}.` : '',
      unmatched ? `No speaker record - ${unmatched}.` : ''
    ]
      .filter(Boolean)
      .join(' ')
  };
}

/**
 * Speakers editing their own presenter profile through an emailed link (#2936): the speaker's link pages, which need no
 * sign-in, and the admins' sending and review.
 */
@Injectable({ providedIn: 'root' })
export class SpeakerEditsService {
  private readonly http = inject(HttpClient);
  private readonly resource = inject(EnvironmentService).value('api_url') + '/speaker-edits';

  /** Emails each speaker their own link, in the subject and text the admin approved (#3023). */
  public send(speakerGuids: Array<string>, email?: ProfileEmail) {
    return this.http.post<SendEditLinksResult>(`${this.resource}/send`, {
      speakers: speakerGuids,
      ...(email ?? {})
    });
  }

  /** Emails the people of each competition submission who have a speaker record their own link (#2958, #3023). */
  public sendForSubmissions(submissionGuids: Array<string>, email?: ProfileEmail) {
    return this.http.post<SendEditLinksResult>(`${this.resource}/send-for-submissions`, {
      submissions: submissionGuids,
      ...(email ?? {})
    });
  }

  /** The email `send` would send, for the admin to read and edit first (#3023). */
  public preview(speakerGuids: Array<string>) {
    return this.http.post<ReviewEmailPreview>(`${this.resource}/send/preview`, { speakers: speakerGuids });
  }

  /** The email `sendForSubmissions` would send, for the admin to read and edit first (#3023). */
  public previewForSubmissions(submissionGuids: Array<string>) {
    return this.http.post<ReviewEmailPreview>(`${this.resource}/send-for-submissions/preview`, {
      submissions: submissionGuids
    });
  }

  /** A speaker asking for their own link by email address. */
  public request(email: string) {
    return this.http.post<{ message: string }>(`${this.resource}/request`, { email });
  }

  public forLink(token: string) {
    return this.http.get<SpeakerEditPage>(`${this.resource}/link/${encodeURIComponent(token)}`);
  }

  public propose(token: string, fields: SpeakerEditProposal, photo?: File | null) {
    const body = new FormData();

    for (const [key, value] of Object.entries(fields)) {
      body.append(key, value ?? '');
    }

    if (photo) {
      body.append('photo', photo, photo.name);
    }

    return this.http.post<{ received: boolean }>(`${this.resource}/link/${encodeURIComponent(token)}`, body);
  }

  public pending() {
    return this.http.get<Array<PendingSpeakerEdit>>(`${this.resource}/pending`);
  }

  public photo(editGuid: string) {
    return this.http.get(`${this.resource}/${editGuid}/photo`, { responseType: 'blob' });
  }

  public approve(editGuid: string) {
    return this.http.post<{ approved: boolean }>(`${this.resource}/${editGuid}/approve`, {});
  }

  public reject(editGuid: string) {
    return this.http.post<{ rejected: boolean }>(`${this.resource}/${editGuid}/reject`, {});
  }
}
