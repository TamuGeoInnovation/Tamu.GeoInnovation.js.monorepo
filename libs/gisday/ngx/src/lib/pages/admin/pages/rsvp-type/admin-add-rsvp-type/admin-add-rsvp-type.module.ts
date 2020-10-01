import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { AdminAddRsvpTypeComponent } from './admin-add-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddRsvpTypeComponent
  }
];

@NgModule({
  declarations: [AdminAddRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class AdminAddRsvpTypeModule {}
