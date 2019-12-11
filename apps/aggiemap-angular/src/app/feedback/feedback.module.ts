import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SkeletonModule } from '../skeleton/skeleton.module';
import { FeedbackComponent } from './components/feedback.component';

const routes: Routes = [
  {
    path: '',
    component: FeedbackComponent
  }
];

@NgModule({
  declarations: [FeedbackComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SkeletonModule]
})
export class FeedbackModule {}
