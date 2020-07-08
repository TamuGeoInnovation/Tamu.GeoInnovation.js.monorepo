import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { FeedbackComponent } from './components/feedback.component';

const routes: Routes = [
  {
    path: '',
    component: FeedbackComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule],
  declarations: [FeedbackComponent]
})
export class FeedbackModule {}
