import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';

import { PopupService } from '../../services/popup.service';

/**
 * Opens the sidebar it is placed on whenever a feature popup is opened.
 *
 * Every map that has a sidebar renders the feature popup *inside* it, so collapsing the panel takes
 * the popup with it: the user clicks a building and nothing happens, with no indication that the
 * answer is behind the panel they closed. See #1244.
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
  private _subscription: Subscription | undefined;

  constructor(
    private readonly sidebar: SidebarComponent,
    private readonly popup: PopupService
  ) {}

  public ngOnInit(): void {
    this._subscription = this.popup.opened.subscribe(() => {
      // Only ever opens. Closing it here would fight the user, who may have closed it deliberately
      // while a popup was up.
      if (this.sidebar.visible !== true) {
        this.sidebar.visible = true;
      }
    });
  }

  public ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }
}
