import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { UserSubmissionEditComponent } from './user-submission-edit.component';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionEditComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [UserSubmissionEditComponent],
  exports: [RouterModule]
})
export class UserSubmissionEditModule {}
