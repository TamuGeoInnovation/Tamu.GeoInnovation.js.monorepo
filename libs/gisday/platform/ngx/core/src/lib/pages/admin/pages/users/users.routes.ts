import { Routes } from '@angular/router';

import { UsersComponent } from './users.component';
import { UserListComponent } from './pages/user-list/user-list.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        component: UserListComponent
      }
    ]
  }
];
