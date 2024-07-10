import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';

import { MoveInOutParkingSpaceComponent } from './move-in-out-parking-space/move-in-out-parking-space.component';

const popups = [MoveInOutParkingSpaceComponent];

@NgModule({
  imports: [CommonModule, AggiemapNgxPopupsModule],
  declarations: popups,
  exports: popups
})
export class PopupsModule {}

export const Popups = {
  MoveInOutParkingSpaceComponent
};
