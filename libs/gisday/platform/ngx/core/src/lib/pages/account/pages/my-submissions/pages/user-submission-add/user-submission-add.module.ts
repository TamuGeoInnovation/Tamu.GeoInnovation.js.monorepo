import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { UserSubmissionAddComponent } from './user-submission-add.component';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionAddComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [UserSubmissionAddComponent],
  exports: [RouterModule]
})
export class UserSubmissionAddModule {}
