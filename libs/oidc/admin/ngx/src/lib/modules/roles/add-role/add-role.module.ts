import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AddRoleComponent } from './add-role.component';

const routes: Routes = [
  {
    path: '',
    component: AddRoleComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [AddRoleComponent],
  exports: [RouterModule]
})
export class AddRoleModule {}
