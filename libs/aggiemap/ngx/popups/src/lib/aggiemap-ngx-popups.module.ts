import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LightgalleryModule } from 'lightgallery/angular/13';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { ReferenceModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

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
import { BonfirePopupComponent } from './components/bonfire/bonfire.component';
import { DiningPopupComponent } from './components/dining/dining.component';
import { MarkdownPopupComponent } from './components/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from './components/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { BusStopPopupComponent } from './components/bus-stop/bus-stop.component';

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
  BonfirePopupComponent,
  DiningPopupComponent,
  MarkdownPopupComponent,
  MarkdownWDirectionsPopupComponent,
  BusStopPopupComponent
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
  BonfirePopupComponent,
  DiningPopupComponent,
  MarkdownPopupComponent,
  MarkdownWDirectionsPopupComponent,
  BusStopPopupComponent
};

@NgModule({
  imports: [CommonModule, UIClipboardModule, PipesModule, ReferenceModule, LightgalleryModule, UILayoutModule],
  declarations: PopsArr,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AggiemapNgxPopupsModule {}

export const Popups = PopsObj;
