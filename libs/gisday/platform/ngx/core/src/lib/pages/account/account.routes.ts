import { Routes } from '@angular/router';

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
        loadChildren: () => import('./pages/my-classes/my-classes.routes').then((m) => m.myClassesRoutes)
      },
      {
        path: 'checkins',
        loadChildren: () => import('./pages/my-checkins/my-checkins.routes').then((m) => m.myCheckinsRoutes)
      },
      {
        path: 'details',
        loadChildren: () => import('./pages/my-details/my-details.routes').then((m) => m.myDetailsRoutes)
      },
      {
        path: 'submissions',
        loadChildren: () => import('./pages/my-submissions/my-submissions.routes').then((m) => m.mySubmissionsRoutes)
      },
      {
        path: 'vgi-submissions',
        loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.userSubmissionsRoutes)
      },
      {
        path: 'initial-survey',
        loadChildren: () => import('./pages/initial-survey/initial-survey.routes').then((m) => m.initialSurveyRoutes)
      }
    ]
  }
];
