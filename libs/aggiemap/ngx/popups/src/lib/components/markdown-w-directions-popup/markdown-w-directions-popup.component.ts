import { Component } from '@angular/core';

import { MarkdownPopupComponent } from '../markdown-popup/markdown-popup.component';
import { PopupFooterComponent } from '../footer/popup-footer.component';

/**
 * The markdown popup, ending with the shared footer: "Directions To Here" and the copy link (#602, #3486).
 *
 * Its title is the feature's `name`, as the plain popup's is. AggieMap's copy used to read `title`, and the one layer
 * that set it (the UES Operations map's campus stops, through `popupData`) now sets `name`.
 */
@Component({
  selector: 'tamu-gisc-markdown-w-directions-popup',
  templateUrl: './markdown-w-directions-popup.component.html',
  styleUrls: ['./markdown-w-directions-popup.component.scss'],
  imports: [PopupFooterComponent]
})
export class MarkdownWDirectionsPopupComponent extends MarkdownPopupComponent {
  public override startDirections() {
    super.startDirections(`${this.data.attributes.OBJECTID}`);
  }
}
