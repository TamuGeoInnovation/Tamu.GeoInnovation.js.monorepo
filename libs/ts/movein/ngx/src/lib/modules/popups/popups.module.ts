import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import {
  MoveInOutParkingSpacePopupComponent,
  ParkingLotLabelPipe
} from './move-in-out-parking-space-popup/move-in-out-parking-space-popup.component';
import { MoveInOutBuildingPopupComponent } from './move-in-out-building-popup/move-in-out-building-popup.component';
import { MoveInOutStreetParkingPopupComponent } from './move-in-out-street-parking-popup/move-in-out-street-parking-popup.component';

const popups = [MoveInOutParkingSpacePopupComponent, MoveInOutBuildingPopupComponent, MoveInOutStreetParkingPopupComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [...popups, ParkingLotLabelPipe, MoveInOutStreetParkingPopupComponent],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MoveInOutParkingSpacePopupComponent,
  MoveInOutBuildingPopupComponent,
  MoveInOutStreetParkingPopupComponent
};
