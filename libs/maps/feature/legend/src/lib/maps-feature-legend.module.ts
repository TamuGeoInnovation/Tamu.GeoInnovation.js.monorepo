import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegendService } from './services/legend.service';
import { LegendComponent } from './components/legend/legend.component';

@NgModule({
  imports: [CommonModule],
  providers: [LegendService],
  declarations: [LegendComponent],
  exports: [LegendComponent]
})
export class LegendModule {}
