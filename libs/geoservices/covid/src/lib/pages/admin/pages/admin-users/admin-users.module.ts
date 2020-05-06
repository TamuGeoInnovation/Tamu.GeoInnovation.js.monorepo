import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AdminUsersComponent } from './admin-users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUsersComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [AdminUsersComponent]
})
export class AdminUsersModule {}
