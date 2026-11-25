import { Component, input, output } from '@angular/core';

import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';

/**
 * The actions a popup offers for a place a visitor can go to: a link that reopens it, and "Directions To Here"
 * (#602, #1173).
 *
 * Every popup that had them wrote the same two lines by hand, so each one that lacked them had to be found and given
 * them one at a time. Here they are one piece, placed where the pair stood, inside the popup's own section:
 *
 * ```html
 * <tamu-gisc-popup-footer [shareUrl]="shareUrl" (startDirections)="startDirections()"></tamu-gisc-popup-footer>
 * ```
 *
 * The copy link is shown only when there is a link to copy. `BaseDirectionsComponent` gives `shareUrl` a value only
 * when a search source can open the feature again from it, so a popup passes its `shareUrl` whether or not it has one
 * yet, and gains the link the day its layer gains a search source with a `urlQueryParam`.
 *
 * Anything placed inside the element follows "Directions To Here", spaced as one more action (the bus stop's schedule
 * link).
 */
@Component({
  selector: 'tamu-gisc-popup-footer',
  templateUrl: './popup-footer.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, ActivateDirective],
  host: { style: 'display: block' }
})
export class PopupFooterComponent {
  /** The link that reopens this feature. With none, no copy link is offered: a link that reopens nothing is worse. */
  public readonly shareUrl = input<string | null | undefined>(undefined);

  /** "Directions To Here" was chosen. The popup plans the trip, since only it knows what to call the destination. */
  public readonly startDirections = output<void>();
}
