import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessiblePopupComponent } from './components/accessible/accessible.component';
import { GeneralDirectionsPopupComponent } from './components/base/base.popup.component';
import { BuildingPopupComponent } from './components/building/building-popup.component';
import { ConstructionPopupComponent } from './components/construction/construction.component';
import { LactationPopupComponent } from './components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from './components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from './components/parking-lot/parking-lot.component';
import { RestroomPopupComponent } from './components/restroom/restroom.component';

@NgModule({
  declarations: [
    AccessiblePopupComponent,
    GeneralDirectionsPopupComponent,
    BuildingPopupComponent,
    ConstructionPopupComponent,
    LactationPopupComponent,
    ParkingKioskPopupComponent,
    ParkingLotPopupComponent,
    RestroomPopupComponent
  ],
  imports: [CommonModule],
  entryComponents: [
    AccessiblePopupComponent,
    GeneralDirectionsPopupComponent,
    BuildingPopupComponent,
    ConstructionPopupComponent,
    LactationPopupComponent,
    ParkingKioskPopupComponent,
    ParkingLotPopupComponent,
    RestroomPopupComponent
  ]
})
export class PopupsModule {}
