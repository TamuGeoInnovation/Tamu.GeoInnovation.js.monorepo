import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { TYPE_PAGE, TypePage } from '@tamu-gisc/gisday/platform/ngx/common';
import { RsvpTypeService, SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { AdminTagComponent } from '../tag/admin-tag.component';
import { TypesAddComponent } from './pages/types-add/types-add.component';
import { TypesEditComponent } from './pages/types-edit/types-edit.component';
import { TypesListComponent } from './pages/types-list/types-list.component';

/**
 * One set of type pages, for every kind of type (#3328): the list, Add and Edit, on the current admin base classes, as
 * the tag pages are. `page` names the type and its service.
 */
function typeRoutes(page: () => TypePage): Routes {
  return [
    {
      path: '',
      // The plain frame every admin section draws its pages in.
      component: AdminTagComponent,
      providers: [{ provide: TYPE_PAGE, useFactory: page }],
      children: [
        { path: 'edit/:guid', component: TypesEditComponent },
        { path: 'add', component: TypesAddComponent },
        { path: '', component: TypesListComponent }
      ]
    }
  ];
}

export const rsvpTypeRoutes = typeRoutes(() => ({
  noun: 'RSVP type',
  title: 'RSVP Type',
  listTitle: 'RSVP Types',
  field: 'Type',
  list: '/admin/rsvp-types',
  service: inject(RsvpTypeService)
}));

export const submissionTypeRoutes = typeRoutes(() => ({
  noun: 'submission type',
  title: 'Submission Type',
  listTitle: 'Submission Types',
  field: 'Submission Type',
  list: '/admin/submission-types',
  service: inject(SubmissionTypeService)
}));
