import { ContentChild, Directive, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';

import { PopupService } from '../../services/popup.service';
import { PopupComponent } from '../../containers/base/base.component';

/**
 * Keeps the sidebar it is placed on and the feature popup inside it in step.
 *
 * Every map that has a sidebar renders the feature popup *inside* it, on top of the panel's routed
 * view. So:
 *
 * - **A popup opening opens the sidebar.** Collapsing the panel takes the popup with it: the user
 *   clicks a building and nothing happens, with no indication that the answer is behind the panel
 *   they closed. See #1244.
 * - **Choosing a sidebar tab closes the popup.** Otherwise the tab changes the route underneath it and
 *   nothing visible happens: the URL says `/settings` and the details stay in front. It closes the
 *   popup as its [X] does, clearing the selection with it, and keeps the panel open, so choosing the
 *   tab already underneath shows that view instead of collapsing the panel. See #1806.
 *
 * A directive rather than something in the sidebar itself, because the sidebar is a generic component
 * with no business knowing what a map popup is, and because several maps each nest their own. It is
 * opt-in per sidebar, so a map that deliberately wants a closed panel is unaffected.
 *
 * Reacts to `opened` rather than to `show`, which starts out reporting `true`. Reacting to that would
 * have every one of these maps open its panel on load.
 */
@Directive({ selector: '[tamuGiscRevealSidebarOnPopup]' })
export class RevealSidebarOnPopupDirective implements OnInit, OnDestroy {
  private readonly sidebar = inject(SidebarComponent);
  private readonly popup = inject(PopupService);

  /** The popup panel rendered in this sidebar's content, whose [X] a tab click reuses. */
  @ContentChild(PopupComponent, { descendants: true })
  public popupPanel: PopupComponent | undefined;

  private _showing = false;

  private _subscription: Subscription | undefined;

  public ngOnInit(): void {
    this._subscription = this.popup.opened.subscribe(() => {
      // Only ever opens. Closing it here would fight the user, who may have closed it deliberately
      // while a popup was up.
      if (this.sidebar.visible !== true) {
        this.sidebar.visible = true;
      }
    });

    this._subscription.add(this.popup.show.subscribe((show) => (this._showing = show)));
  }

  /**
   * A click that bubbles up from one of the sidebar's tabs. The sidebar has handled it by now: it has
   * navigated to the tab's view, or collapsed the panel if that tab was the one already chosen.
   */
  @HostListener('click', ['$event.target'])
  public clicked(target: EventTarget | null): void {
    if (!this._showing || !(target instanceof Element) || target.closest('tamu-gisc-sidebar-tab') === null) {
      return;
    }

    this.popupPanel?.close();
    this.sidebar.visible = true;
  }

  public ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }
}
