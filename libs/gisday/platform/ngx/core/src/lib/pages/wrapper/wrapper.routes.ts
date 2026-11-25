import { Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { RoleGuard } from '@tamu-gisc/common/ngx/auth';
import {
  ALREADY_SIGNED_IN_PATH,
  GISDayRoles,
  logOut,
  siteFeatureGuard,
  startSignIn
} from '@tamu-gisc/gisday/platform/ngx/common';

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
        // A past year's Sessions, Presenters and Sponsors, drawn from that year's season (#1758).
        path: 'seasons/:seasonYear',
        canActivate: [siteFeatureGuard('pastYears')],
        loadChildren: () => import('../seasons/seasons.routes').then((m) => m.seasonsRoutes)
      },
      {
        path: 'faq',
        canActivate: [siteFeatureGuard('faq')],
        loadChildren: () => import('../faq/faq.routes').then((m) => m.faqRoutes)
      },
      {
        path: 'sponsors',
        canActivate: [siteFeatureGuard('sponsors')],
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
        canActivate: [siteFeatureGuard('competitions')],
        loadChildren: () => import('../competitions/competitions.routes').then((m) => m.competitionsRoutes)
      },
      {
        // A judge's page, from the judging link emailed to them, with no account (#3183).
        path: 'judging',
        canActivate: [siteFeatureGuard('competitions')],
        loadChildren: () => import('../judging/judging.routes').then((m) => m.judgingRoutes)
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
        canActivate: [siteFeatureGuard('pastYears')],
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
      // `/login` and `/signup` start signing in, as the header's Login/Signup does (#3148). The FAQ page links to both;
      // `/signup` had no route, so it was not found, and `/login` drew an empty page. One Auth0 page does both.
      { path: 'login', canActivate: [startSignIn], children: [] },
      { path: 'signup', canActivate: [startSignIn], children: [] },
      {
        // Where `/login` and `/signup` send a visitor already signed in (#3154): Auth0 would have sent them straight back,
        // and the page they were on coming back looked like the link did nothing.
        path: ALREADY_SIGNED_IN_PATH,
        data: {
          title: 'Already signed in',
          heading: "You're already signed in",
          showSignedInAs: true,
          message: 'There is nothing more to sign in or sign up for. To use another account, log out first.',
          links: [
            { text: 'Continue to the site', to: '/' },
            { text: 'Log out', to: '/logout' }
          ]
        },
        loadChildren: () => import('../not-authed/not-authed.routes').then((m) => m.notAuthedRoutes)
      },
      // Logs out, as the header's Logout does (#3154); it used to render nothing (#1569).
      { path: 'logout', canActivate: [logOut], children: [] },
      {
        path: 'forbidden',
        loadChildren: () => import('../not-authed/not-authed.routes').then((m) => m.notAuthedRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('../landing/landing.routes').then((m) => m.landingRoutes)
      },
      {
        // Last: an address the site does not know says so inside the site, instead of failing the router, which went
        // to `/` and drew a blank white page (#1765). The address stays as typed.
        path: '**',
        data: {
          message: "We couldn't find that page.",
          links: [
            { text: 'Home page', to: '/' },
            { text: 'Sessions', to: '/sessions' }
          ]
        },
        loadChildren: () => import('../not-authed/not-authed.routes').then((m) => m.notAuthedRoutes)
      }
    ]
  }
];
