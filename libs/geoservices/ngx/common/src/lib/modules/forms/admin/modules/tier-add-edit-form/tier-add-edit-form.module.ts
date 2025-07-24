import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DragulaModule } from 'ng2-dragula';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { TierAddEditFormComponent } from './tier-add-edit-form.component';
import { TierCategoryAddEditFormModule } from '../tier-category-add-edit-form/tier-category-add-edit-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    TierCategoryAddEditFormModule,
    DragulaModule.forRoot()
  ],
  declarations: [TierAddEditFormComponent],
  exports: [TierAddEditFormComponent]
})
export class TierAddEditFormModule {}
