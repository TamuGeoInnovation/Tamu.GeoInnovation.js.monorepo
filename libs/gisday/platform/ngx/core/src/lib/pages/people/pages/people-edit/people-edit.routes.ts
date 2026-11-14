import { Routes } from '@angular/router';

import { PeopleEditComponent } from './people-edit.component';

export const peopleEditRoutes: Routes = [
  { path: ':token', component: PeopleEditComponent },
  { path: '', component: PeopleEditComponent }
];
