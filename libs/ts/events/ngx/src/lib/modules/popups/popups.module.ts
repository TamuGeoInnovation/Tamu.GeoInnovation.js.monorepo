import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { MarkdownWDirectionsPopupComponent } from './markdown-w-directions-popup/markdown-w-directions-popup.component';
import { MarkdownPopupComponent } from './markdown-popup/markdown-popup.component';

const popups = [MarkdownWDirectionsPopupComponent, MarkdownPopupComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule, PipesModule],
  declarations: [...popups],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MarkdownWDirectionsPopupComponent: MarkdownWDirectionsPopupComponent,
  MarkdownPopupComponent: MarkdownPopupComponent
};
