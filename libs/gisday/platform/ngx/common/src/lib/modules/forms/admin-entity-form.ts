import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { serverMessage } from '../../utils/server-message';
import { injectBackToList } from './admin-details-page';

/** What an admin add/edit form does with its record. */
export type AdminEntityAction = 'create' | 'update' | 'delete';

const WORDS: Record<AdminEntityAction, { verb: string; done: string; doing: string }> = {
  create: { verb: 'Create', done: 'created', doing: 'creating' },
  update: { verb: 'Update', done: 'updated', doing: 'updating' },
  delete: { verb: 'Delete', done: 'deleted', doing: 'deleting' }
};

/**
 * The save and delete of an admin add/edit form (#3340): each form wrote its own, with three toasts each whose ids,
 * titles and wording disagreed from form to form. Called in a component's field initializer with the record's name in
 * title case ('Event Location') and the list the form returns to.
 */
export function adminEntityForm(noun: string, list: string) {
  const notifications = inject(NotificationService);
  const backToList = injectBackToList(list);

  const slug = noun.toLowerCase().replace(/\s+/g, '-');
  const lower = noun.toLowerCase();
  const sentence = noun.charAt(0) + noun.slice(1).toLowerCase();

  return {
    /** Returns to the list the page was opened from (#2965), for a form's own flow. */
    back: backToList,

    /**
     * Sends `request`. When it works, says so and returns to the list the page was opened from (#2965); when it is
     * refused, says why, in the API's words where it gave any.
     */
    save(action: AdminEntityAction, request: Observable<unknown>) {
      const { verb, done, doing } = WORDS[action];
      const title = `${verb} ${noun}`;

      request.subscribe({
        next: () => {
          notifications.toast({ id: `${slug}-${action}-success`, title, message: `${sentence} was successfully ${done}.` });
          backToList();
        },
        error: (err) => {
          notifications.toast({
            id: `${slug}-${action}-failed`,
            title,
            message: serverMessage(err, `Error ${doing} ${lower}: ${err?.status}`)
          });
        }
      });
    }
  };
}
