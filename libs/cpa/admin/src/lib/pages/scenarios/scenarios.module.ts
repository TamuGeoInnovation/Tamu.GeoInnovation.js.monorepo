import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ScenariosComponent } from './scenarios.component';

const routes: Routes = [
  {
    path: '',
    component: ScenariosComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ScenariosComponent]
})
export class ScenariosModule {}
