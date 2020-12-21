import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationsService } from './locations/locations.service';
import { ResultsService } from './results/results.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [ResultsService, LocationsService]
})
export class DataAccessModule {}
