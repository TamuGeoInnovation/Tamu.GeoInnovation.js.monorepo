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
        // A speaker editing their own profile through an emailed link (#2936).
        path: 'edit',
        loadChildren: () => import('./pages/people-edit/people-edit.routes').then((m) => m.peopleEditRoutes)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/people-details/people-details.routes').then((m) => m.peopleDetailsRoutes)
      }
    ]
  }
];
