import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GISDayPipesModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { UserSubmissionListComponent } from './user-submission-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionListComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GISDayPipesModule],
  declarations: [UserSubmissionListComponent],
  exports: [RouterModule]
})
export class UserSubmissionListModule {}
