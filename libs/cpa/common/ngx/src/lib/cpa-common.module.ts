import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CPAFormsModule } from './modules/forms/cpaForms.module';
import { CpaViewerModule } from './modules/viewer/viewer.module';

@NgModule({
  imports: [CommonModule, CPAFormsModule, CpaViewerModule],
  exports: [CPAFormsModule, CpaViewerModule]
})
export class CpaCommonModule {}
