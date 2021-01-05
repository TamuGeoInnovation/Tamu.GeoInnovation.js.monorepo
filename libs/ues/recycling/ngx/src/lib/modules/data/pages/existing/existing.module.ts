import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ExistingComponent } from './existing.component';

const routes: Routes = [
  {
    path: '',
    component: ExistingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ExistingComponent]
})
export class ExistingModule {}
