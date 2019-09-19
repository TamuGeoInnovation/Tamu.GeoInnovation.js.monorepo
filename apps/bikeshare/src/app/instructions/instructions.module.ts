import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SkeletonModule } from '../skeleton/skeleton.module';
import { InstructionsComponent } from './components/instructions.component';

const routes: Routes = [
  {
    path: '',
    component: InstructionsComponent
  }
];

@NgModule({
  declarations: [InstructionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule]
})
export class InstructionsModule {}
