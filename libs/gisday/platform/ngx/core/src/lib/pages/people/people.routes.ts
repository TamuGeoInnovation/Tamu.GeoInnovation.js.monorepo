import { Routes } from '@angular/router';

import { PeopleComponent } from './people.component';

export const peopleRoutes: Routes = [
  {
    path: '',
    component: PeopleComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/people-view/people-view.routes').then((m) => m.peopleViewRoutes)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/people-details/people-details.routes').then((m) => m.peopleDetailsRoutes)
      }
    ]
  }
];
