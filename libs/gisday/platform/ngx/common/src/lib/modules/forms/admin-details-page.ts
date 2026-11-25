import { forwardRef, inject, Provider, Type } from '@angular/core';
import { Router } from '@angular/router';

/**
 * The admin details page a form is on (#2965): an entity's add or edit page, or a submission's review. Each is a
 * BaseAdminDetailsPageComponent, in gisday/platform/ngx/core, and provides itself as this, so the shared add-and-edit
 * forms here, which cannot import that library, can send the admin back the way the page does.
 *
 * Angular does not pass a base component's providers on to the components that extend it, so each page names itself:
 * `providers: [provideAdminDetailsPage(() => TagsEditComponent)]`. A spec in core checks that every page does.
 */
export abstract class AdminDetailsPage {
  /**
   * Back to the list the page was opened from, as the browser's Back button would, so the list keeps its season (in
   * its address) and its search (in its history entry); to the list when the page was opened from somewhere else.
   */
  public abstract backToList(): void;
}

/** Provides an admin details page as the AdminDetailsPage its forms go back through. */
export function provideAdminDetailsPage(page: () => Type<AdminDetailsPage>): Provider {
  return { provide: AdminDetailsPage, useExisting: forwardRef(page) };
}

/**
 * For a form: what Save, Create and Delete call once they have worked, to leave for the list. On an admin details page
 * that is the page's backToList(); a form used anywhere else goes to `list`, as every form did before #2965.
 *
 * Called while the form is being created, as inject() is.
 */
export function injectBackToList(list: string): () => void {
  const page = inject(AdminDetailsPage, { optional: true });
  const router = inject(Router);

  return () => {
    if (page) {
      page.backToList();
    } else {
      router.navigate([list]);
    }
  };
}
