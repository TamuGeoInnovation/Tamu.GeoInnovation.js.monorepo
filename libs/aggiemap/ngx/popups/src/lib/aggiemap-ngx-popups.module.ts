import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { ReferenceModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { BasePopupComponent } from './components/base/base.popup.component';
import { BaseDirectionsComponent } from './components/base-directions/base-directions.component';
import { AccessiblePopupComponent } from './components/accessible/accessible.component';
import { BuildingPopupComponent } from './components/building/building-popup.component';
import { ConstructionPopupComponent } from './components/construction/construction.component';
import { LactationPopupComponent } from './components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from './components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from './components/parking-lot/parking-lot.component';
import { RestroomPopupComponent } from './components/restroom/restroom.component';
import { PoiPopupComponent } from './components/poi/poi.component';

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
  PoiPopupComponent
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
  PoiPopupComponent
};

@NgModule({
  imports: [CommonModule, UIClipboardModule, ReferenceModule],
  declarations: PopsArr,
  entryComponents: PopsArr
})
export class AggiemapNgxPopupsModule {}

export const Popups = PopsObj;
