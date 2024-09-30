import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { RingDayMarkdownWDirectionsComponent } from './ring-day-markdown-w-directions/ring-day-markdown-w-directions.component';
import { RingDayMarkdownComponent } from './ring-day-markdown/ring-day-markdown.component';

const popups = [RingDayMarkdownWDirectionsComponent, RingDayMarkdownComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [...popups],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  RingDayMarkdownWDirectionsComponent,
  RingDayMarkdownComponent
};
