import { Observable, filter, map, switchMap } from 'rxjs';

import {
  EMAIL_SENDER_KEY,
  PROFILE_EMAIL_KIND,
  PROFILE_EMAIL_PLACEHOLDERS,
  SESSION_DETAILS_EMAIL_KIND,
  SESSION_DETAILS_EMAIL_PLACEHOLDERS
} from '@tamu-gisc/gisday/common';
import { ProfileEmail, ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ReviewEmailModalComponent, ReviewEmailModalData, ReviewEmailModalResult } from './review-email-modal.component';

/**
 * Sends one kind of editable email to speakers, the way the profile email (#3023) and the session details email (#3092)
 * are both sent: shown first in the review emails' window, its subject and text editable, then `send` with them as the
 * admin left them. Nothing is sent, and nothing comes out, when the admin cancels.
 */
export function sendEditableEmail<R>(
  modals: ModalService,
  email: { verb: string; kind: string; placeholders: ReadonlyArray<string> },
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>,
  /** Anything the admin should know first, such as how many people it goes to. */
  note?: string
): Observable<R> {
  const data: ReviewEmailModalData = {
    verb: email.verb,
    editableSubject: true,
    placeholders: email.placeholders,
    note,
    preview
  };

  return modals.open<ReviewEmailModalResult>(ReviewEmailModalComponent, { data }).pipe(
    filter((result): result is Record<string, string> => !!result),
    map((result) => ({
      subject: result[`${email.kind}:subject`],
      template: result[email.kind],
      // The address chosen in the window's "Send as" box (#3100), when it had one.
      ...(result[EMAIL_SENDER_KEY] ? { sender: result[EMAIL_SENDER_KEY] } : {})
    })),
    switchMap(send)
  );
}

/**
 * Sends the speaker profile email (#3023) the one way all three places send it, the Speakers list, an event and Research
 * Competitions.
 */
export function sendProfileEmail<R>(
  modals: ModalService,
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>,
  /** Anything the admin should know first, such as how many people it goes to. */
  note?: string
): Observable<R> {
  return sendEditableEmail(
    modals,
    { verb: 'Send profile email', kind: PROFILE_EMAIL_KIND, placeholders: PROFILE_EMAIL_PLACEHOLDERS },
    preview,
    send,
    note
  );
}

/** Sends a session's speakers its details (#3092), prefilled from the session, in the profile email's window. */
export function sendSessionDetailsEmail<R>(
  modals: ModalService,
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>
): Observable<R> {
  return sendEditableEmail(
    modals,
    { verb: 'Send session details', kind: SESSION_DETAILS_EMAIL_KIND, placeholders: SESSION_DETAILS_EMAIL_PLACEHOLDERS },
    preview,
    send
  );
}
