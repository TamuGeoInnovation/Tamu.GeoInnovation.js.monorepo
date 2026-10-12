import { Routes } from '@angular/router';

import { BroadcastsComponent } from './broadcasts.component';
import { BroadcastListComponent } from './pages/broadcast-list/broadcast-list.component';
import { BroadcastAddComponent } from './pages/broadcast-add/broadcast-add.component';
import { BroadcastEditComponent } from './pages/broadcast-edit/broadcast-edit.component';

export const broadcastsRoutes: Routes = [
  {
    path: '',
    component: BroadcastsComponent,
    children: [
      {
        path: 'edit/:guid',
        component: BroadcastEditComponent
      },
      {
        path: 'add',
        component: BroadcastAddComponent
      },
      {
        path: '',
        component: BroadcastListComponent
      }
    ]
  }
];
