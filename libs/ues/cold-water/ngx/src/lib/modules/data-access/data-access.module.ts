import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ColdWaterValvesService } from './cold-water-valves/cold-water-valves.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [ColdWaterValvesService]
})
export class DataAccessModule {}
