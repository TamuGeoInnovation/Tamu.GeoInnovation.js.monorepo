import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ViewSubmissionComponent } from './view-submission.component';

const routes: Routes = [
  {
    path: '',
    component: ViewSubmissionComponent
  }
];

@NgModule({
  declarations: [ViewSubmissionComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class ViewSubmissionModule {}
