import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureSelectorService } from './services/selector.service';
import { FeatureCollectorService } from './services/collector.service';


@NgModule({
  imports: [CommonModule],
  providers: [FeatureSelectorService, FeatureCollectorService]
})
export class FeaetureSelectorModule {}
