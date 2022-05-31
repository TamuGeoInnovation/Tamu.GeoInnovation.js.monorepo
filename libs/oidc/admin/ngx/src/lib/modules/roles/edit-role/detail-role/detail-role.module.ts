import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DetailRoleComponent } from './detail-role.component';

const routes: Routes = [
  {
    path: '',
    component: DetailRoleComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [DetailRoleComponent],
  exports: [RouterModule]
})
export class DetailRoleModule {}
