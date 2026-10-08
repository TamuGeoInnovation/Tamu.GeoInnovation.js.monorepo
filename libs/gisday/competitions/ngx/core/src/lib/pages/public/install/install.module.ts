import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { InstallComponent } from './components/install/install.component';

const routes: Routes = [
  {
    path: '',
    component: InstallComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, InstallComponent]
})
export class InstallModule {}
