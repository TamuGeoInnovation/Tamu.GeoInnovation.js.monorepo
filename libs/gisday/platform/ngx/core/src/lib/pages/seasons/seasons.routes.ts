import { Routes } from '@angular/router';

import { SeasonsComponent } from './seasons.component';

/**
 * The pages that change from year to year, under `seasons/:seasonYear`. Each is the current year's
 * page, reading its season from `SeasonService.viewedSeason$` (#1758).
 */
export const seasonsRoutes: Routes = [
  {
    path: '',
    component: SeasonsComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('../events/event.routes').then((m) => m.eventRoutes)
      },
      {
        path: 'presenters',
        loadChildren: () => import('../people/people.routes').then((m) => m.peopleRoutes)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('../sponsors/sponsors.routes').then((m) => m.sponsorsRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sessions'
      }
    ]
  }
];
