import { Routes } from '@angular/router';

import { AdminUniversityComponent } from './admin-university.component';
import { UniversityEditComponent } from './pages/university-edit/university-edit.component';
import { UniversityAddComponent } from './pages/university-add/university-add.component';
import { UniversityListComponent } from './pages/university-list/university-list.component';

export const adminUniversityRoutes: Routes = [
  {
    path: '',
    component: AdminUniversityComponent,
    children: [
      {
        path: 'edit/:guid',
        component: UniversityEditComponent
      },
      {
        path: 'add',
        component: UniversityAddComponent
      },
      {
        path: '',
        component: UniversityListComponent
      }
    ]
  }
];
