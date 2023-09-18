import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeasonsRoutingModule } from './seasons-routing.module';
import { SeasonsComponent } from './seasons.component';

@NgModule({
  imports: [CommonModule, SeasonsRoutingModule],
  declarations: [
    SeasonsComponent
  ]
})
export class SeasonsModule {}

