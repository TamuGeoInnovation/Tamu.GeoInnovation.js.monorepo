import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';



import { FeedbackComponent } from './components/feedback.component';

const routes: Routes = [
  {
    path: '',
    component: FeedbackComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FeedbackComponent]
})
export class FeedbackModule {}
