import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectionSummaryComponent } from './components/summary/summary.component';

import { FeatureSelectorService } from './services/selector.service';
import { FeatureCollectorService } from './services/collector.service';

@NgModule({
  imports: [CommonModule],
  providers: [FeatureSelectorService, FeatureCollectorService],
  declarations: [SelectionSummaryComponent],
  exports: [SelectionSummaryComponent]
})
export class FeaetureSelectorModule {}
