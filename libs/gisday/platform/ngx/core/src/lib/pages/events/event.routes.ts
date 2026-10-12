import { Routes } from '@angular/router';

import { EventComponent } from './event.component';

export const eventRoutes: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/event-view/event-view.routes').then((m) => m.eventViewRoutes)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/event-detail/event-detail.routes').then((m) => m.eventDetailRoutes)
      }
    ]
  }
];
