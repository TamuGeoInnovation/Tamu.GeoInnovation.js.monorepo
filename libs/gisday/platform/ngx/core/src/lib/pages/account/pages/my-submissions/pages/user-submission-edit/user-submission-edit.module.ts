import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UserSubmissionEditComponent } from './user-submission-edit.component';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionEditComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UserSubmissionEditComponent],
  exports: [RouterModule]
})
export class UserSubmissionEditModule {}
