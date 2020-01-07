import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { AccessiblePopupComponent } from './components/accessible/accessible.component';
import { GeneralDirectionsPopupComponent } from './components/base/base.popup.component';
import { BuildingPopupComponent } from './components/building/building-popup.component';
import { ConstructionPopupComponent } from './components/construction/construction.component';
import { LactationPopupComponent } from './components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from './components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from './components/parking-lot/parking-lot.component';
import { RestroomPopupComponent } from './components/restroom/restroom.component';
import { ReferenceModule } from '../reference/reference.module';
import { PoiPopupComponent } from './components/poi/poi.component';

const PopsArr = [
  AccessiblePopupComponent,
  GeneralDirectionsPopupComponent,
  BuildingPopupComponent,
  ConstructionPopupComponent,
  LactationPopupComponent,
  ParkingKioskPopupComponent,
  ParkingLotPopupComponent,
  RestroomPopupComponent,
  PoiPopupComponent
];

const PopsObj = {
  AccessiblePopupComponent,
  GeneralDirectionsPopupComponent,
  BuildingPopupComponent,
  ConstructionPopupComponent,
  LactationPopupComponent,
  ParkingKioskPopupComponent,
  ParkingLotPopupComponent,
  RestroomPopupComponent,
  PoiPopupComponent
};

@NgModule({
  imports: [CommonModule, UIClipboardModule, ReferenceModule],
  declarations: PopsArr,
  entryComponents: PopsArr
})
export class PopupsModule {}

export const Popups = PopsObj;
