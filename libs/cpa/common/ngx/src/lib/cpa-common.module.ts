import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CPAFormsModule } from './modules/forms/cpaForms.module';
import { CpaCreateModule } from './modules/create/create.module';
import { CpaViewerModule } from './modules/viewer/viewer.module';

@NgModule({
  imports: [CommonModule, CPAFormsModule, CpaCreateModule, CpaViewerModule],
  exports: [CPAFormsModule, CpaCreateModule, CpaViewerModule]
})
export class CpaCommonModule {}
