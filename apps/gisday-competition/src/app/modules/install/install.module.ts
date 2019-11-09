import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { InstallComponent } from './components/install/install.component';

const routes: Routes = [
  {
    path: '',
    component: InstallComponent
  }
];

@NgModule({
  declarations: [InstallComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class InstallModule {}
