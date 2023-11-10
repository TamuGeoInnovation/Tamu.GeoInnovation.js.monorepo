import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { RoleGuard } from '@tamu-gisc/common/ngx/auth';
import { GISDayRoles, GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { WrapperComponent } from './wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: WrapperComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.EventModule)
      },
      {
        path: 'faq',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.FaqModule)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.SponsorsModule)
      },
      {
        path: 'presenters',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.PeopleModule)
      },
      {
        path: 'about',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AboutModule)
      },
      {
        path: 'competitions',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.CompetitionsModule)
      },
      {
        path: 'contact',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.ContactModule)
      },
      {
        path: 'highschool',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.HighschoolModule)
      },
      {
        path: 'wayback',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.WaybackModule)
      },
      {
        path: 'admin',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          requiredRoles: [GISDayRoles.ADMIN, GISDayRoles.MANAGER, GISDayRoles.ORGANIZER],
          redirectTo: '/forbidden'
        },
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AdminModule)
      },
      {
        path: 'account',
        canActivate: [AuthGuard],
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AccountModule)
      },
      {
        path: 'login',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LoginModule)
      },
      {
        path: 'logout',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LogoutModule)
      },
      {
        path: 'forbidden',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.NotAuthedModule)
      },
      {
        path: 'callback',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.CallbackModule)
      },
      {
        path: '',
        loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LandingModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, GisdayPlatformNgxCommonModule, RouterModule.forChild(routes)],
  declarations: [WrapperComponent]
})
export class WrapperModule {}

