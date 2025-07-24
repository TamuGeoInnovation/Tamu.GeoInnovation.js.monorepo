import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { CategoryBenefitAddEditFormComponent } from './category-benefit-add-edit-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [CategoryBenefitAddEditFormComponent],
  exports: [CategoryBenefitAddEditFormComponent]
})
export class CategoryBenefitAddEditFormModule {}
