import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { LegendService } from './services/legend.service';
import { LegendComponent } from './components/legend/legend.component';
import { LegendElementComponent } from './components/legend-element/legend-element.component';
import { LegendCollectionComponent } from './components/legend-collection/legend-collection.component';

@NgModule({
  imports: [CommonModule, LegendComponent, LegendElementComponent, LegendCollectionComponent],
  providers: [LegendService],
  exports: [LegendComponent]
})
export class LegendModule {}
