import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UserSubmissionAddComponent } from './user-submission-add.component';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionAddComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UserSubmissionAddComponent],
  exports: [RouterModule]
})
export class UserSubmissionAddModule {}
