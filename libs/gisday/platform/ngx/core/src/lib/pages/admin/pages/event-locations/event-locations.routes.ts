import { Routes } from '@angular/router';

import { EventLocationsComponent } from './event-locations.component';
import { EventLocationAddComponent } from './pages/event-location-add/event-location-add.component';
import { EventLocationEditComponent } from './pages/event-location-edit/event-location-edit.component';
import { EventLocationListComponent } from './pages/event-location-list/event-location-list.component';

export const eventLocationsRoutes: Routes = [
  {
    path: '',
    component: EventLocationsComponent,
    children: [
      {
        path: 'edit/:guid',
        component: EventLocationEditComponent
      },
      {
        path: 'add',
        component: EventLocationAddComponent
      },
      {
        path: '',
        component: EventLocationListComponent
      }
    ]
  }
];
