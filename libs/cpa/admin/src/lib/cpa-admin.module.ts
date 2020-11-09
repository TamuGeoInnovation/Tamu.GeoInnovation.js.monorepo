import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CpaAdminComponent } from './cpa-admin.component';

const routes: Routes = [
  {
    path: '',
    component: CpaAdminComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [CpaAdminComponent]
})
export class CpaAdminModule {}
