import { Routes } from '@angular/router';

import { OrganizationsComponent } from './organizations.component';
import { OrganizationListComponent } from './pages/organization-list/organization-list.component';
import { OrganizationAddComponent } from './pages/organization-add/organization-add.component';
import { OrganizationEditComponent } from './pages/organization-edit/organization-edit.component';

export const organizationsRoutes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    children: [
      {
        path: '',
        component: OrganizationListComponent
      },
      {
        path: 'add',
        component: OrganizationAddComponent
      },
      {
        path: 'edit/:guid',
        component: OrganizationEditComponent
      }
    ]
  }
];
