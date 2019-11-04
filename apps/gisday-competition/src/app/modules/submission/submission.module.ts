import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms'

import { SubmissionComponent } from './components/submission.component';
import { LocationService } from './providers/location.service';

const routes: Routes = [{
  path: '', component: SubmissionComponent
}]

@NgModule({
  declarations: [SubmissionComponent],
  exports: [SubmissionComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    UIFormsModule
  ],
  providers: [LocationService]
})
export class SubmissionModule { }
