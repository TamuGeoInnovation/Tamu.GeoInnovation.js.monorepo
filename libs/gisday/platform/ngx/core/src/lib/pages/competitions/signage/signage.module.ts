import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';


import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SignageComponent } from './signage.component';

const routes: Routes = [
  {
    path: '',
    component: SignageComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, SignageComponent],
  exports: [RouterModule]
})
export class SignageModule {}
