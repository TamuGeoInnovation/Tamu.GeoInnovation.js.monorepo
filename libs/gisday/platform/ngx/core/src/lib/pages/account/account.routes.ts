import { Routes } from '@angular/router';

import { siteFeatureGuard } from '@tamu-gisc/gisday/platform/ngx/common';

import { AccountComponent } from './account.component';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/my-details/my-details.routes').then((m) => m.myDetailsRoutes)
      },
      {
        path: 'classes',
        canActivate: [siteFeatureGuard('classes')],
        loadChildren: () => import('./pages/my-classes/my-classes.routes').then((m) => m.myClassesRoutes)
      },
      {
        path: 'checkins',
        canActivate: [siteFeatureGuard('checkIns')],
        loadChildren: () => import('./pages/my-checkins/my-checkins.routes').then((m) => m.myCheckinsRoutes)
      },
      {
        path: 'details',
        loadChildren: () => import('./pages/my-details/my-details.routes').then((m) => m.myDetailsRoutes)
      },
      {
        path: 'submissions',
        canActivate: [siteFeatureGuard('competitions')],
        loadChildren: () => import('./pages/my-submissions/my-submissions.routes').then((m) => m.mySubmissionsRoutes)
      },
      {
        path: 'vgi-submissions',
        canActivate: [siteFeatureGuard('competitions')],
        loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.userSubmissionsRoutes)
      },
      {
        path: 'initial-survey',
        loadChildren: () => import('./pages/initial-survey/initial-survey.routes').then((m) => m.initialSurveyRoutes)
      }
    ]
  }
];
