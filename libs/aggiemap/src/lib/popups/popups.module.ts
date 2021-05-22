import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { BasePopupComponent } from './components/base/base.popup.component';
import { BaseDirectionsComponent } from './components/base-directions/base-directions.component';
import { AccessiblePopupComponent } from './components/accessible/accessible.component';
import { BuildingPopupComponent } from './components/building/building-popup.component';
import { ConstructionPopupComponent } from './components/construction/construction.component';
import { LactationPopupComponent } from './components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from './components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from './components/parking-lot/parking-lot.component';
import { RestroomPopupComponent } from './components/restroom/restroom.component';
import { ReferenceModule } from '../reference/reference.module';
import { PoiPopupComponent } from './components/poi/poi.component';
import { TentZonePopupComponent } from './components/tent-zone/tent-zone.component';

const PopsArr = [
  BasePopupComponent,
  BaseDirectionsComponent,
  AccessiblePopupComponent,
  BuildingPopupComponent,
  ConstructionPopupComponent,
  LactationPopupComponent,
  ParkingKioskPopupComponent,
  ParkingLotPopupComponent,
  RestroomPopupComponent,
  PoiPopupComponent,
  TentZonePopupComponent
];

const PopsObj = {
  BasePopupComponent,
  BaseDirectionsComponent,
  AccessiblePopupComponent,
  BuildingPopupComponent,
  ConstructionPopupComponent,
  LactationPopupComponent,
  ParkingKioskPopupComponent,
  ParkingLotPopupComponent,
  RestroomPopupComponent,
  PoiPopupComponent,
  TentZonePopupComponent
};

@NgModule({
  imports: [CommonModule, UIClipboardModule, ReferenceModule],
  declarations: PopsArr,
  entryComponents: PopsArr
})
export class PopupsModule {}

export const Popups = PopsObj;
