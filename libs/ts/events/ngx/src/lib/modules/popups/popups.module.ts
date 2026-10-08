import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';

import { MarkdownWDirectionsPopupComponent } from './markdown-w-directions-popup/markdown-w-directions-popup.component';
import { MarkdownPopupComponent } from './markdown-popup/markdown-popup.component';
import { CampusBuildingPopupComponent } from './campus-building-popup/campus-building-popup.component';

const popups = [MarkdownWDirectionsPopupComponent, MarkdownPopupComponent, CampusBuildingPopupComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, ...popups],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MarkdownWDirectionsPopupComponent: MarkdownWDirectionsPopupComponent,
  MarkdownPopupComponent: MarkdownPopupComponent,
  CampusBuildingPopupComponent: CampusBuildingPopupComponent
};
