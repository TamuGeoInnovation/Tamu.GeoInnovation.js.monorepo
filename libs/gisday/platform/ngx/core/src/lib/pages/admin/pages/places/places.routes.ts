import { Routes } from '@angular/router';

import { PlacesComponent } from './places.component';
import { PlaceAddComponent } from './pages/place-add/place-add.component';
import { PlaceEditComponent } from './pages/place-edit/place-edit.component';
import { PlaceListComponent } from './pages/place-list/place-list.component';

export const placesRoutes: Routes = [
  {
    path: '',
    component: PlacesComponent,
    children: [
      {
        path: 'edit/:guid',
        component: PlaceEditComponent
      },
      {
        path: 'add',
        component: PlaceAddComponent
      },
      {
        path: '',
        component: PlaceListComponent
      }
    ]
  }
];
