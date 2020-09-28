import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { MySubmissionsComponent } from './my-submissions.component';
import { AccoutHeaderComponent } from '../../../../modules/accout-header/accout-header.component';

const routes: Routes = [
  {
    path: '',
    component: MySubmissionsComponent
  }
];

@NgModule({
  declarations: [MySubmissionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class MySubmissionsModule {}
