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
        // What a session's check-in QR code opens (#3081).
        path: 'checkin/:guid',
        loadChildren: () => import('./pages/event-checkin/event-checkin.routes').then((m) => m.eventCheckinRoutes)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/event-detail/event-detail.routes').then((m) => m.eventDetailRoutes)
      }
    ]
  }
];
