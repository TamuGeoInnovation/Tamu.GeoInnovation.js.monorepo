import { Routes } from '@angular/router';

import { AdminComponent } from './admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'broadcasts',
        loadChildren: () => import('./pages/broadcasts/broadcasts.routes').then((m) => m.broadcastsRoutes)
      },
      {
        path: 'classes',
        loadChildren: () => import('./pages/class/admin-class.routes').then((m) => m.adminClassRoutes)
      },
      {
        path: 'competitions',
        children: [
          {
            path: 'designer',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.designerRoutes)
          },
          {
            path: 'leaderboard',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.leaderboardRoutes)
          },
          {
            path: 'map',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.mapRoutes)
          },
          {
            path: 'submissions',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.adminSubmissionsRoutes)
          },
          {
            path: '',
            redirectTo: 'designer',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'events',
        loadChildren: () => import('./pages/event/admin-event.routes').then((m) => m.adminEventRoutes)
      },
      {
        path: 'event-locations',
        loadChildren: () => import('./pages/event-locations/event-locations.routes').then((m) => m.eventLocationsRoutes)
      },
      {
        path: 'organizations',
        loadChildren: () => import('./pages/organizations/organizations.routes').then((m) => m.organizationsRoutes)
      },
      {
        path: 'rsvp-types',
        loadChildren: () => import('./pages/rsvp-type/admin-rsvp-type.routes').then((m) => m.adminRsvpTypeRoutes)
      },
      {
        path: 'research-competition',
        loadChildren: () =>
          import('./pages/research-competition/research-competition.routes').then((m) => m.researchCompetitionRoutes)
      },
      {
        path: 'places',
        loadChildren: () => import('./pages/places/places.routes').then((m) => m.placesRoutes)
      },
      {
        path: 'speakers',
        loadChildren: () => import('./pages/speaker/admin-speaker.routes').then((m) => m.adminSpeakerRoutes)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('./pages/sponsor/admin-sponsor.routes').then((m) => m.adminSponsorRoutes)
      },
      {
        path: 'seasons',
        loadChildren: () => import('./pages/seasons/seasons.routes').then((m) => m.seasonsRoutes)
      },
      {
        path: 'submission-types',
        loadChildren: () =>
          import('./pages/submission-type/admin-submission-type.routes').then((m) => m.adminSubmissionTypeRoutes)
      },
      {
        path: 'tags',
        loadChildren: () => import('./pages/tag/admin-tag.routes').then((m) => m.adminTagRoutes)
      },
      {
        path: 'universities',
        loadChildren: () => import('./pages/university/admin-university.routes').then((m) => m.adminUniversityRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.routes').then((m) => m.usersRoutes)
      },
      {
        path: '',
        redirectTo: 'seasons',
        pathMatch: 'full'
      }
    ]
  }
];
