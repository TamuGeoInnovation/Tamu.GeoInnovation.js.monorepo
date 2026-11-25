import { Component, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';

import { AdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

/**
 * What every admin details page shares (#2942), as the admin lists share BaseAdminListComponent: an event's, a
 * speaker's, a sponsor's edit page, a submission's review and the rest, and the add pages a list opens.
 *
 * **Escape goes back to the list**, as closing a dialog does: to the list the page was opened from, as the browser's
 * Back button would, so the list keeps its season (in its address) and its search (in its history entry, see
 * BaseAdminListComponent). A page not opened from its list goes to the list.
 *
 * **Changes are not thrown away silently.** A page whose form has changes asks "Leave without saving?" first, in the
 * page: the site cannot use the browser's confirm().
 *
 * **An Escape something else used is left to it**: an open drop-down, search list, date picker or modal. Those claim
 * the Escape they use (preventDefault), and a modal is open; either way this does nothing. The decision is made when
 * the key comes up, after every handler of its keydown has run, whichever order they were added in. It is the keyup,
 * too, that would close a modal opened on the keydown, so the question asked here could never be read.
 *
 * **Save, Create and Delete go back the same way** (#2965), once they have worked: a page that saves itself calls
 * `backToList()`; the shared add-and-edit forms in gisday/platform/ngx/common reach it through AdminDetailsPage. Leaving
 * that way never asks "Leave without saving?": what was on the page has been saved. A create that stays on its page,
 * as Create Class does with the sections it could not add, does not call it.
 *
 * A page adopts it by extending it, providing itself as the AdminDetailsPage its form goes back through, and, if it has
 * a form, naming it in `detailsForm()`:
 *
 * ```ts
 * @Component({ ..., providers: [provideAdminDetailsPage(() => TagsEditComponent)] })
 * export class TagsEditComponent extends BaseAdminDetailsPageComponent { ... }
 * ```
 *
 * The provider cannot be given here: Angular does not pass a base component's providers on to those extending it.
 */
@Component({
  selector: 'tamu-gisc-base-admin-details-page',
  template: '',
  standalone: false
})
export abstract class BaseAdminDetailsPageComponent implements AdminDetailsPage {
  private readonly detailsRouter = inject(Router);
  private readonly detailsRoute = inject(ActivatedRoute);
  private readonly detailsLocation = inject(Location);
  private readonly detailsModal = inject(ModalService);

  private readonly modalOpen = toSignal(this.detailsModal.isOpen, { initialValue: false });

  /**
   * Where the page was opened from: the navigation before the one that is creating this page. Read here, while that
   * navigation is still under way.
   */
  private readonly openedFrom: UrlTree | undefined = this.detailsRouter.currentNavigation()?.previousNavigation?.finalUrl;

  /** The Escape whose key is down, unless something else used it. */
  private escapeDown: KeyboardEvent | null = null;

  /** Whether the question is on screen, so a second Escape does not ask it twice. */
  private asking = false;

  /**
   * The page's form, if it has one: while it has changes, Escape asks before leaving. A page whose form is in a child
   * component names that component's form.
   */
  protected detailsForm(): AbstractControl | null | undefined {
    return null;
  }

  @HostListener('document:keydown', ['$event'])
  public onDetailsKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !event.isComposing) {
      this.escapeDown = this.modalOpen() || this.asking ? null : event;
    }
  }

  @HostListener('document:keyup', ['$event'])
  public onDetailsKeyup(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    const down = this.escapeDown;
    this.escapeDown = null;

    if (!down || down.defaultPrevented) {
      return;
    }

    if (this.detailsForm()?.dirty) {
      this.askThenLeave();
    } else {
      this.backToList();
    }
  }

  /** Back to the list the page was opened from, or to the list when it was opened from somewhere else. */
  public backToList() {
    const list = this.detailsRouter.createUrlTree(['./'], { relativeTo: this.detailsRoute.parent });

    if (this.openedFrom && this.pathOf(this.openedFrom) === this.pathOf(list)) {
      this.detailsLocation.back();
    } else {
      this.detailsRouter.navigateByUrl(list);
    }
  }

  private askThenLeave() {
    this.asking = true;

    const question: AlertModalData = {
      title: 'Leave without saving?',
      message: 'The changes on this page have not been saved. Leave, and they are lost.',
      primaryText: 'Leave without saving',
      secondaryText: 'Keep editing'
    };

    this.detailsModal.open<boolean>(AlertModalComponent, { data: question }).subscribe({
      next: (leave) => {
        if (leave === true) {
          this.backToList();
        }
      },
      complete: () => (this.asking = false)
    });
  }

  /** An address without its query string or fragment. */
  private pathOf(tree: UrlTree): string {
    return this.detailsRouter.serializeUrl(tree).split(/[?#]/)[0];
  }
}
