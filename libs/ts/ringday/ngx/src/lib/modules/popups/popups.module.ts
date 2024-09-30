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
import { MoveInOutDiningPopupComponent } from './move-in-out-dining-popup/move-in-out-dining-popup.component';
import { MoveInOutInformationPopupComponent } from './move-in-out-information-popup/move-in-out-information-popup.component';
import { MoveInOutRecyclePopupComponent } from './move-in-out-recycle-popup/move-in-out-recycle-popup.component';
import { MoveInOutNoParkingPopupComponent } from './move-in-out-no-parking-popup/move-in-out-no-parking-popup.component';

const popups = [
  MoveInOutParkingSpacePopupComponent,
  MoveInOutBuildingPopupComponent,
  MoveInOutStreetParkingPopupComponent,
  MoveInOutAccessibleParkingPopupComponent,
  MoveInOutPersonalEngravingPopupComponent,
  MoveInOutBusStopPopupComponent,
  MoveInOutDiningPopupComponent,
  MoveInOutInformationPopupComponent,
  MoveInOutRecyclePopupComponent,
  MoveInOutNoParkingPopupComponent
];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule, UIClipboardModule],
  declarations: [
    ...popups,
    ParkingLotLabelPipe,
    MoveInOutStreetParkingPopupComponent,
    MoveInOutAccessibleParkingPopupComponent,
    MoveInOutPersonalEngravingPopupComponent,
    MoveInOutBusStopPopupComponent,
    MoveInOutDiningPopupComponent,
    MoveInOutInformationPopupComponent,
    MoveInOutRecyclePopupComponent,
    MoveInOutNoParkingPopupComponent
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
  MoveInOutBusStopPopupComponent,
  MoveInOutDiningPopupComponent,
  MoveInOutInformationPopupComponent,
  MoveInOutRecyclePopupComponent,
  MoveInOutNoParkingPopupComponent
};
