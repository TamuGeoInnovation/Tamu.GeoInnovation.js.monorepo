import { Routes } from '@angular/router';

import { AdminClassComponent } from './admin-class.component';
import { ClassListComponent } from './pages/class-list/class-list.component';
import { ClassEditComponent } from './pages/class-edit/class-edit.component';
import { ClassAddComponent } from './pages/class-add/class-add.component';

export const adminClassRoutes: Routes = [
  {
    path: '',
    component: AdminClassComponent,
    children: [
      {
        path: 'edit/:guid',
        component: ClassEditComponent
      },
      {
        path: 'add',
        component: ClassAddComponent
      },
      {
        path: '',
        component: ClassListComponent
      }
    ]
  }
];
