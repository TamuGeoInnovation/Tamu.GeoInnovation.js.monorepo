import { Routes } from '@angular/router';

import { ResearchCompetitionComponent } from './research-competition.component';
import { ResearchCompetitionListComponent } from './pages/research-competition-list/research-competition-list.component';
import { ResearchCompetitionReviewComponent } from './pages/research-competition-review/research-competition-review.component';

export const researchCompetitionRoutes: Routes = [
  {
    path: '',
    component: ResearchCompetitionComponent,
    children: [
      {
        path: 'review/:guid',
        component: ResearchCompetitionReviewComponent
      },
      {
        path: '',
        component: ResearchCompetitionListComponent
      }
    ]
  }
];
