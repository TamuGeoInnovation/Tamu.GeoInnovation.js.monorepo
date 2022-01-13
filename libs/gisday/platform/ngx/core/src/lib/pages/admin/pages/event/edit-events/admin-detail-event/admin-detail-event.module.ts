import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AdminDetailEventComponent } from './admin-detail-event.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailEventComponent
  }
];

@NgModule({
  declarations: [AdminDetailEventComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class AdminDetailEventModule {}
