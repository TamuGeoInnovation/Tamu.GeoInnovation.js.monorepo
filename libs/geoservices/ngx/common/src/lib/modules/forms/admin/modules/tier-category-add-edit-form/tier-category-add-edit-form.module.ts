import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DragulaModule } from 'ng2-dragula';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { TierCategoryAddEditFormComponent } from './tier-category-add-edit-form.component';
import { CategoryBenefitAddEditFormModule } from '../category-benefit-add-edit-form/category-benefit-add-edit-form.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    DragulaModule.forRoot(),
    CategoryBenefitAddEditFormModule
  ],
  declarations: [TierCategoryAddEditFormComponent],
  exports: [TierCategoryAddEditFormComponent]
})
export class TierCategoryAddEditFormModule {}
