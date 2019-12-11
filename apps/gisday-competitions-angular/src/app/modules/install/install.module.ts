import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { InstallComponent } from './components/install/install.component';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

const routes: Routes = [
  {
    path: '',
    component: InstallComponent
  }
];

@NgModule({
  declarations: [InstallComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule]
})
export class InstallModule {}
