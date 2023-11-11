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
        loadChildren: () => import('../events/event.module').then((m) => m.EventModule)
      },
      {
        path: 'faq',
        loadChildren: () => import('../faq/faq.module').then((m) => m.FaqModule)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('../sponsors/sponsors.module').then((m) => m.SponsorsModule)
      },
      {
        path: 'presenters',
        loadChildren: () => import('../people/people.module').then((m) => m.PeopleModule)
      },
      {
        path: 'about',
        loadChildren: () => import('../about/about.module').then((m) => m.AboutModule)
      },
      {
        path: 'competitions',
        loadChildren: () => import('../competitions/competitions.module').then((m) => m.CompetitionsModule)
      },
      {
        path: 'contact',
        loadChildren: () => import('../contact/contact.module').then((m) => m.ContactModule)
      },
      {
        path: 'highschool',
        loadChildren: () => import('../highschool/highschool.module').then((m) => m.HighschoolModule)
      },
      {
        path: 'wayback',
        loadChildren: () => import('../wayback/wayback.module').then((m) => m.WaybackModule)
      },
      {
        path: 'admin',
        canActivate: [AuthGuard, RoleGuard],
        data: {
          requiredRoles: [GISDayRoles.ADMIN, GISDayRoles.MANAGER, GISDayRoles.ORGANIZER],
          redirectTo: '/forbidden'
        },
        loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule)
      },
      {
        path: 'account',
        canActivate: [AuthGuard],
        loadChildren: () => import('../account/account.module').then((m) => m.AccountModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../login/login.module').then((m) => m.LoginModule)
      },
      {
        path: 'logout',
        loadChildren: () => import('../logout/logout.module').then((m) => m.LogoutModule)
      },
      {
        path: 'forbidden',
        loadChildren: () => import('../not-authed/not-authed.module').then((m) => m.NotAuthedModule)
      },
      {
        path: 'callback',
        loadChildren: () => import('../callback/callback.module').then((m) => m.CallbackModule)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('../landing/landing.module').then((m) => m.LandingModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, GisdayPlatformNgxCommonModule, RouterModule.forChild(routes)],
  declarations: [WrapperComponent]
})
export class WrapperModule {}
