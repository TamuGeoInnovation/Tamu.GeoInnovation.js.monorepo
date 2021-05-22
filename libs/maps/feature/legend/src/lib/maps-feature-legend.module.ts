import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';

import { LegendService } from './services/legend.service';
import { LegendComponent } from './components/legend/legend.component';
import { LegendElementComponent } from './components/legend-element/legend-element.component';
import { LegendCollectionComponent } from './components/legend-collection/legend-collection.component';

@NgModule({
  imports: [CommonModule, UIStructuralLayoutModule],
  providers: [LegendService],
  declarations: [LegendComponent, LegendElementComponent, LegendCollectionComponent],
  exports: [LegendComponent]
})
export class LegendModule {}
