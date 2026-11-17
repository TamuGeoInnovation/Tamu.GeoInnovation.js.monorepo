import { Routes } from '@angular/router';

import { ResearchCompetitionComponent } from './research-competition.component';
import { ResearchCompetitionListComponent } from './pages/research-competition-list/research-competition-list.component';
import { ResearchCompetitionReviewComponent } from './pages/research-competition-review/research-competition-review.component';
import { RubricsComponent } from './pages/rubrics/rubrics.component';
import { JudgingResultsComponent } from './pages/judging-results/judging-results.component';

export const researchCompetitionRoutes: Routes = [
  {
    path: '',
    component: ResearchCompetitionComponent,
    children: [
      {
        path: 'review/:guid',
        component: ResearchCompetitionReviewComponent
      },
      // Judging the research competitions (#3183): the rubrics judges score against, and the results.
      {
        path: 'rubrics',
        component: RubricsComponent
      },
      {
        path: 'judging',
        component: JudgingResultsComponent
      },
      {
        path: '',
        component: ResearchCompetitionListComponent
      }
    ]
  }
];
