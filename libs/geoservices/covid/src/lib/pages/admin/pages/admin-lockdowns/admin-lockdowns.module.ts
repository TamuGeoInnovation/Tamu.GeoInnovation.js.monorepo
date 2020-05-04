import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AdminLockdownsComponent } from './admin-lockdowns.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLockdownsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [AdminLockdownsComponent]
})
export class AdminLockdownsModule {}
