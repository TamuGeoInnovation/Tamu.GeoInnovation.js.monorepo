import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AdminCountyClaimsComponent } from './admin-county-claims.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCountyClaimsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [AdminCountyClaimsComponent]
})
export class AdminCountyClaimsModule {}
