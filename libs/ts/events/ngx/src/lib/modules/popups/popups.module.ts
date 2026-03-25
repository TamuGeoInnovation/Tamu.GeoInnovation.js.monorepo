import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { MarkdownWDirectionsPopupComponent } from './markdown-w-directions-popup/markdown-w-directions-popup.component';
import { MarkdownPopupComponent } from './markdown-popup/markdown-popup.component';
import { CampusStopsPopupComponent } from './campus-stops-popup/campus-stops-popup.component';

const popups = [MarkdownWDirectionsPopupComponent, MarkdownPopupComponent, CampusStopsPopupComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [...popups],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MarkdownWDirectionsPopupComponent: MarkdownWDirectionsPopupComponent,
  MarkdownPopupComponent: MarkdownPopupComponent,
  CampusStopsPopupComponent: CampusStopsPopupComponent
};
