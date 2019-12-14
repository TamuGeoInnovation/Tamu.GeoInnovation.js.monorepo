import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopupsModule } from './modules/popups/popups.module';
import { ReferenceModule } from './modules/reference/reference.module';

@NgModule({
  imports: [CommonModule, PopupsModule, ReferenceModule],
  exports: [PopupsModule, ReferenceModule]
})
export class AggiemapModule {}
