import { Observable, filter, map, switchMap } from 'rxjs';

import { PROFILE_EMAIL_KIND, PROFILE_EMAIL_PLACEHOLDERS } from '@tamu-gisc/gisday/common';
import { ProfileEmail, ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ReviewEmailModalComponent, ReviewEmailModalData, ReviewEmailModalResult } from './review-email-modal.component';

/**
 * Sends the speaker profile email (#3023) the one way all three places send it, the Speakers list, an event and Research
 * Competitions: the email shown first in the review emails' window, its subject and text editable, then `send` with
 * them as the admin left them. Nothing is sent, and nothing comes out, when the admin cancels.
 */
export function sendProfileEmail<R>(
  modals: ModalService,
  preview: Observable<ReviewEmailPreview>,
  send: (email: ProfileEmail) => Observable<R>,
  /** Anything the admin should know first, such as how many people it goes to. */
  note?: string
): Observable<R> {
  const data: ReviewEmailModalData = {
    verb: 'Send profile email',
    editableSubject: true,
    placeholders: PROFILE_EMAIL_PLACEHOLDERS,
    note,
    preview
  };

  return modals.open<ReviewEmailModalResult>(ReviewEmailModalComponent, { data }).pipe(
    filter((result): result is Record<string, string> => !!result),
    map((result) => ({ subject: result[`${PROFILE_EMAIL_KIND}:subject`], template: result[PROFILE_EMAIL_KIND] })),
    switchMap(send)
  );
}
