import { Routes } from '@angular/router';

import { AdminEventComponent } from './admin-event.component';
import { EventAddComponent } from './pages/event-add/event-add.component';
import { EventEditComponent } from './pages/event-edit/event-edit.component';
import { EventListComponent } from './pages/event-list/event-list.component';

export const adminEventRoutes: Routes = [
  {
    path: '',
    component: AdminEventComponent,
    children: [
      {
        path: 'edit/:guid',
        component: EventEditComponent
      },
      {
        path: 'add',
        component: EventAddComponent
      },
      {
        path: '',
        component: EventListComponent
      }
    ]
  }
];
