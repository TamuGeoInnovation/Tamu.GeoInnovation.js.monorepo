import { Routes } from '@angular/router';

import { AdminSponsorComponent } from './admin-sponsor.component';
import { SponsorListComponent } from './pages/sponsor-list/sponsor-list.component';
import { SponsorEditComponent } from './pages/sponsor-edit/sponsor-edit.component';
import { SponsorAddComponent } from './pages/sponsor-add/sponsor-add.component';

export const adminSponsorRoutes: Routes = [
  {
    path: '',
    component: AdminSponsorComponent,
    children: [
      {
        path: 'edit/:guid',
        component: SponsorEditComponent
      },
      {
        path: 'add',
        component: SponsorAddComponent
      },
      {
        path: '',
        component: SponsorListComponent
      }
    ]
  }
];
