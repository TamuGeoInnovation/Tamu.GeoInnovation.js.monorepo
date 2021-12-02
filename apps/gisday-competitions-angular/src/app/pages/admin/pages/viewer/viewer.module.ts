import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ViewerComponent } from './viewer.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./modules/season-list/season-list.module').then((m) => m.SeasonListModule)
      },
      {
        path: 'review',
        loadChildren: () =>
          import('./modules/submission-review/submission-review.module').then((m) => m.SubmissionReviewModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), EsriMapModule, UILayoutModule],
  declarations: [ViewerComponent]
})
export class ViewerModule {}
