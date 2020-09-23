import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { CompetitionsComponent } from './competitions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PapersComponent } from './papers/papers.component';
import { PostersComponent } from './posters/posters.component';
import { VgiComponent } from './vgi/vgi.component';

const routes: Routes = [
  {
    path: '',
    component: CompetitionsComponent
  },
  {
    path: 'feedback',
    component: FeedbackComponent
  }
  // {
  //   path: 'papers',
  //   component: PapersComponent
  // },
  // {
  //   path: 'posters',
  //   component: PostersComponent
  // },
  // {
  //   path: 'vgi',
  //   component: VgiComponent
  // }
];

@NgModule({
  declarations: [CompetitionsComponent, FeedbackComponent, PapersComponent, PostersComponent, VgiComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitionsModule {}
