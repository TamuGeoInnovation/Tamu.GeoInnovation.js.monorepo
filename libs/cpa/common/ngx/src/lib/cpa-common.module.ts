import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CPAFormsModule } from './modules/forms/cpaForms.module';

@NgModule({
  imports: [CommonModule, CPAFormsModule],
  exports: [CPAFormsModule]
})
export class CpaCommonModule {}
