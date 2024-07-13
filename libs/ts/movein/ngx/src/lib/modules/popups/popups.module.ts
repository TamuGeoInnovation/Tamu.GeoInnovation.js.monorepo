import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import {
  MoveInOutParkingSpacePopupComponent,
  ParkingLotLabelPipe
} from './move-in-out-parking-space-popup/move-in-out-parking-space-popup.component';
import { MoveInOutBuildingPopupComponent } from './move-in-out-building-popup/move-in-out-building-popup.component';

const popups = [MoveInOutParkingSpacePopupComponent, MoveInOutBuildingPopupComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [...popups, ParkingLotLabelPipe],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MoveInOutParkingSpacePopupComponent,
  MoveInOutBuildingPopupComponent
};
