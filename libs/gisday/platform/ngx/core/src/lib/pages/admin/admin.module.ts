import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'broadcasts',
        loadChildren: () => import('./pages/broadcasts/broadcasts.module').then((m) => m.BroadcastsModule)
      },
      {
        path: 'classes',
        loadChildren: () => import('./pages/class/admin-class.module').then((m) => m.AdminClassModule)
      },
      {
        path: 'competitions',
        children: [
          {
            path: 'designer',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.DesignerModule)
          },
          {
            path: 'leaderboard',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.LeaderboardModule)
          },
          {
            path: 'map',
            loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.MapModule)
          },
          {
            path: '',
            redirectTo: 'designer'
          }
        ]
      },
      {
        path: 'events',
        loadChildren: () => import('./pages/event/admin-event.module').then((m) => m.AdminEventModule)
      },
      {
        path: 'event-locations',
        loadChildren: () => import('./pages/event-locations/event-locations.module').then((m) => m.EventLocationsModule)
      },
      {
        path: 'organizations',
        loadChildren: () => import('./pages/organizations/organizations.module').then((m) => m.OrganizationsModule)
      },
      {
        path: 'rsvp-types',
        loadChildren: () => import('./pages/rsvp-type/admin-rsvp-type.module').then((m) => m.AdminRsvpTypeModule)
      },
      {
        path: 'places',
        loadChildren: () => import('./pages/places/places.module').then((m) => m.PlacesModule)
      },
      {
        path: 'speakers',
        loadChildren: () => import('./pages/speaker/admin-speaker.module').then((m) => m.AdminSpeakerModule)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('./pages/sponsor/admin-sponsor.module').then((m) => m.AdminSponsorModule)
      },
      {
        path: 'seasons',
        loadChildren: () => import('./pages/seasons/seasons.module').then((m) => m.SeasonsModule)
      },
      {
        path: 'submission-types',
        loadChildren: () =>
          import('./pages/submission-type/admin-submission-type.module').then((m) => m.AdminSubmissionTypeModule)
      },
      {
        path: 'tags',
        loadChildren: () => import('./pages/tag/admin-tag.module').then((m) => m.AdminTagModule)
      },
      {
        path: 'universities',
        loadChildren: () => import('./pages/university/admin-university.module').then((m) => m.AdminUniversityModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then((u) => u.UsersModule)
      },
      {
        path: '',
        redirectTo: 'seasons'
      }
    ]
  }
];

@NgModule({
  declarations: [AdminComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminModule {}
