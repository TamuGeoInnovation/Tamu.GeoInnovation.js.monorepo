import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DataSecurityPolicyComponent } from './data-security-policy.component';

const routes: Routes = [
  {
    path: '',
    component: DataSecurityPolicyComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DataSecurityPolicyComponent]
})
export class DataSecurityPolicyModule {}
