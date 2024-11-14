import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CurbCutsComponent } from './curb-cuts.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: CurbCutsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CurbCutsComponent]
})
export class CurbCutsModule {}
