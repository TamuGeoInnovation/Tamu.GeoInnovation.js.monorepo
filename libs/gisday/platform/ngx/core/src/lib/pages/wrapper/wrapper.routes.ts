import { Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { RoleGuard } from '@tamu-gisc/common/ngx/auth';
import { GISDayRoles } from '@tamu-gisc/gisday/platform/ngx/common';

import { WrapperComponent } from './wrapper.component';

export const wrapperRoutes: Routes = [
  {
    path: '',
    component: WrapperComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('../events/event.routes').then((m) => m.eventRoutes)
      },
      {
        path: 'faq',
        loadChildren: () => import('../faq/faq.routes').then((m) => m.faqRoutes)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('../sponsors/sponsors.routes').then((m) => m.sponsorsRoutes)
      },
      {
        path: 'presenters',
        loadChildren: () => import('../people/people.routes').then((m) => m.peopleRoutes)
      },
      {
        path: 'about',
        loadChildren: () => import('../about/about.routes').then((m) => m.aboutRoutes)
      },
      {
        path: 'competitions',
        loadChildren: () => import('../competitions/competitions.routes').then((m) => m.competitionsRoutes)
      },
      {
        path: 'contact',
        loadChildren: () => import('../contact/contact.routes').then((m) => m.contactRoutes)
      },
      {
        path: 'highschool',
        loadChildren: () => import('../highschool/highschool.routes').then((m) => m.highschoolRoutes)
      },
      {
        path: 'wayback',
        loadChildren: () => import('../wayback/wayback.routes').then((m) => m.waybackRoutes)
      },
      {
        path: 'admin',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          requiredRoles: [GISDayRoles.ADMIN, GISDayRoles.MANAGER, GISDayRoles.ORGANIZER],
          redirectTo: '/forbidden'
        },
        loadChildren: () => import('../admin/admin.routes').then((m) => m.adminRoutes)
      },
      {
        path: 'account',
        canActivate: [AuthGuard],
        loadChildren: () => import('../account/account.routes').then((m) => m.accountRoutes)
      },
      // Both render nothing inside the wrapper: each used to lazy-load an empty NgModule with no routes
      // of its own, and an empty `children` is the same route without the module (#1569).
      { path: 'login', children: [] },
      { path: 'logout', children: [] },
      {
        path: 'forbidden',
        loadChildren: () => import('../not-authed/not-authed.routes').then((m) => m.notAuthedRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('../landing/landing.routes').then((m) => m.landingRoutes)
      }
    ]
  }
];
