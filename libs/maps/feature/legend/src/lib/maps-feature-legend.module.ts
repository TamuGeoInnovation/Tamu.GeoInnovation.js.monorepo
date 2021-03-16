import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';

import { LegendService } from './services/legend.service';
import { LegendComponent } from './components/legend/legend.component';

@NgModule({
  imports: [CommonModule, UIStructuralLayoutModule],
  providers: [LegendService],
  declarations: [LegendComponent],
  exports: [LegendComponent]
})
export class LegendModule {}
