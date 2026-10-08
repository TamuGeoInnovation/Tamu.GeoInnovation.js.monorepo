import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FeedbackComponent } from './feedback.component';

const routes: Routes = [
  {
    path: '',
    component: FeedbackComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), FeedbackComponent],
    exports: [RouterModule]
})
export class FeedbackModule {}
