import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InteractiveComponent } from './interactive.component';

const routes: Routes = [
  {
    path: '',
    component: InteractiveComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [InteractiveComponent]
})
export class InteractiveModule {}

