import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditUsersComponent } from './edit-users.component';

const routes: Routes = [
  {
    path: '',
    component: EditUsersComponent,
    pathMatch: 'full'
  },
  {
    path: ':userGuid',
    loadChildren: () => import('./detail-user/detail-user.module').then((m) => m.DetailUserModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditUsersComponent],
  exports: [RouterModule]
})
export class EditUsersModule {}
