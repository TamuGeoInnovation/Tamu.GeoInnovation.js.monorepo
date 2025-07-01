import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CancelComponent } from './cancel.component';

const routes: Routes = [
  {
    path: '',
    component: CancelComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CancelComponent]
})
export class CancelModule {}
