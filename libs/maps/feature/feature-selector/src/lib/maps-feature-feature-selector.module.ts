import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureSelectorService } from './services/selector.service';


@NgModule({
  imports: [CommonModule],
  providers: [FeatureSelectorService]
})
export class FeaetureSelectorModule {}
