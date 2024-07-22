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
import { MoveInOutAccessibleParkingPopupComponent } from './move-in-out-accessible-parking-popup/move-in-out-accessible-parking-popup.component';
import { MoveInOutPersonalEngravingPopupComponent } from './move-in-out-personal-engraving-popup/move-in-out-personal-engraving-popup.component';
import { MoveInOutBusStopPopupComponent } from './move-in-out-bus-stop-popup/move-in-out-bus-stop-popup.component';

const popups = [
  MoveInOutParkingSpacePopupComponent,
  MoveInOutBuildingPopupComponent,
  MoveInOutStreetParkingPopupComponent,
  MoveInOutAccessibleParkingPopupComponent,
  MoveInOutPersonalEngravingPopupComponent,
  MoveInOutBusStopPopupComponent
];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [
    ...popups,
    ParkingLotLabelPipe,
    MoveInOutStreetParkingPopupComponent,
    MoveInOutAccessibleParkingPopupComponent,
    MoveInOutPersonalEngravingPopupComponent,
    MoveInOutBusStopPopupComponent
  ],
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MoveInOutParkingSpacePopupComponent,
  MoveInOutBuildingPopupComponent,
  MoveInOutStreetParkingPopupComponent,
  MoveInOutAccessibleParkingPopupComponent,
  MoveInOutPersonalEngravingPopupComponent,
  MoveInOutBusStopPopupComponent
};
