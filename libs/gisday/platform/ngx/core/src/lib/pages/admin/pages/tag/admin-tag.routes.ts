import { Routes } from '@angular/router';

import { AdminTagComponent } from './admin-tag.component';
import { TagsListComponent } from './pages/tags-list/tags-list.component';
import { TagsEditComponent } from './pages/tags-edit/tags-edit.component';
import { TagsAddComponent } from './pages/tags-add/tags-add.component';

export const adminTagRoutes: Routes = [
  {
    path: '',
    component: AdminTagComponent,
    children: [
      {
        path: 'edit/:guid',
        component: TagsEditComponent
      },
      {
        path: 'add',
        component: TagsAddComponent
      },
      {
        path: '',
        component: TagsListComponent
      }
    ]
  }
];
