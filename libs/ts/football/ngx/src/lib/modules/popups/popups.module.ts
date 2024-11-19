import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { GameDayMarkdownWDirectionsComponent } from './game-day-markdown-w-directions/game-day-markdown-w-directions.component';
import { GameDayMarkdownComponent } from './game-day-markdown/game-day-markdown.component';

const popups = [GameDayMarkdownWDirectionsComponent, GameDayMarkdownComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [...popups],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  GameDayMarkdownWDirectionsComponent: GameDayMarkdownWDirectionsComponent,
  GameDayMarkdownComponent: GameDayMarkdownComponent
};
