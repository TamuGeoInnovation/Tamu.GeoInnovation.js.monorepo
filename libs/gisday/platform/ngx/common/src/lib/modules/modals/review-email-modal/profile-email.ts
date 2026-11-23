import { Observable, filter, map, switchMap } from 'rxjs';

import {
  EMAIL_SENDER_KEY,
  JUDGING_EMAIL_KIND,
  JUDGING_EMAIL_PLACEHOLDERS,
  PROFILE_EMAIL_KIND,
  PROFILE_EMAIL_PLACEHOLDERS,
  SESSION_DETAILS_EMAIL_KIND,
  SESSION_DETAILS_EMAIL_PLACEHOLDERS,
  SLIDES_REQUEST_EMAIL_KIND,
  SLIDES_REQUEST_EMAIL_PLACEHOLDERS,
  withoutRecipients
} from '@tamu-gisc/gisday/common';
import { ProfileEmail, ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ReviewEmailModalComponent, ReviewEmailModalData, ReviewEmailModalResult } from './review-email-modal.component';

/**
 * Sends one kind of editable email to speakers, the way the profile email (#3023) and the session details email (#3092)
 * are both sent: shown first in the review emails' window, its subject and text editable, then `send` with them as the
 * admin left them, to the speakers ticked in the window, together or a copy each (#3104). Nothing is sent, and nothing
 * comes out, when the admin cancels.
 */
export function sendEditableEmail<R>(
  modals: ModalService,
  email: {
    verb: string;
    kind: string;
    placeholders: ReadonlyArray<string>;
    /** Never sent to them together, whatever the window returns (#3104): the profile email, each with its own link. */
    copyEachOnly?: boolean;
  },
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
    map((result) => {
      const { speakers, together, rest } = withoutRecipients(result);

      return {
        subject: rest[`${email.kind}:subject`],
        template: rest[email.kind],
        // The address chosen in the window's "Send as" box (#3100), when it had one.
        ...(rest[EMAIL_SENDER_KEY] ? { sender: rest[EMAIL_SENDER_KEY] } : {}),
        // The speakers ticked in the window, when it listed them, and together when chosen and allowed (#3104).
        ...(speakers ? { speakers } : {}),
        ...(together && !email.copyEachOnly ? { together } : {})
      };
    }),
    switchMap(send)
  );
}

/**
 * Sends the speaker profile email (#3023) the one way all three places send it, the Speakers list, an event and Research
 * Competitions: to the speakers ticked, always a copy each, as each carries that speaker's own edit link (#3104).
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
    {
      verb: 'Send profile email',
      kind: PROFILE_EMAIL_KIND,
      placeholders: PROFILE_EMAIL_PLACEHOLDERS,
      copyEachOnly: true
    },
    preview,
    send,
    note
  );
}

/**
 * Sends a session's speakers its details (#3092), prefilled from the session, in the profile email's window: to the
 * speakers ticked, together or a copy each (#3104).
 */
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

/**
 * Asks a session's speakers for their slides (#3113), prefilled from the session, in the same window: to the speakers
 * ticked, always a copy each, as each carries that speaker's own link to upload them (decided 1A).
 */
export function sendSlidesRequestEmail<R>(
  modals: ModalService,
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>
): Observable<R> {
  return sendEditableEmail(
    modals,
    {
      verb: 'Send slides request',
      kind: SLIDES_REQUEST_EMAIL_KIND,
      placeholders: SLIDES_REQUEST_EMAIL_PLACEHOLDERS,
      copyEachOnly: true
    },
    preview,
    send
  );
}

/**
 * Asks a session's judges to judge its competition (#3183), prefilled from the session, in the same window: to the judges
 * ticked, always a copy each, as each carries that judge's own judging link.
 */
export function sendJudgingEmail<R>(
  modals: ModalService,
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>
): Observable<R> {
  return sendEditableEmail(
    modals,
    {
      verb: 'Send judging emails',
      kind: JUDGING_EMAIL_KIND,
      placeholders: JUDGING_EMAIL_PLACEHOLDERS,
      copyEachOnly: true
    },
    preview,
    send
  );
}
