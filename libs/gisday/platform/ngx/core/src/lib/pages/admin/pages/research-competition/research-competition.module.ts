import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { ResearchCompetitionComponent } from './research-competition.component';
import { ResearchCompetitionListComponent } from './pages/research-competition-list/research-competition-list.component';
import { ResearchCompetitionReviewComponent } from './pages/research-competition-review/research-competition-review.component';

const routes: Routes = [
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

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule, PipesModule],
  declarations: [ResearchCompetitionComponent, ResearchCompetitionListComponent, ResearchCompetitionReviewComponent]
})
export class ResearchCompetitionModule {}
