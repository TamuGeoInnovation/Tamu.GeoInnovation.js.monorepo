import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminCountyClaimsComponent } from './admin-county-claims.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCountyClaimsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminCountyClaimsComponent]
})
export class AdminCountyClaimsModule {}
