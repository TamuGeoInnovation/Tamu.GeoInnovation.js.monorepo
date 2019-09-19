import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegendService } from './services/legend';

@NgModule({
  imports: [CommonModule],
  providers: [LegendService]
})
export class LegendModule {}
