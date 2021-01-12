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
        path: '',
        loadChildren: () => import('./pages/checkin/admin-checkins.module').then((m) => m.AdminCheckinsModule)
      },
      {
        path: 'checkins',
        loadChildren: () => import('./pages/checkin/admin-checkins.module').then((m) => m.AdminCheckinsModule)
      },
      {
        path: 'classes',
        loadChildren: () => import('./pages/class/admin-class.module').then((m) => m.AdminClassModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./pages/event/admin-event.module').then((m) => m.AdminEventModule)
      },
      {
        path: 'rsvp-types',
        loadChildren: () => import('./pages/rsvp-type/admin-rsvp-type.module').then((m) => m.AdminRsvpTypeModule)
      },
      {
        path: 'sessions',
        loadChildren: () => import('./pages/session/admin-session.module').then((m) => m.AdminSessionModule)
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
        path: 'submission-types',
        loadChildren: () =>
          import('./pages/submission-type/admin-submission-type.module').then((m) => m.AdminSubmissionTypeModule)
      },
      {
        path: 'tags',
        loadChildren: () => import('./pages/tag/admin-tag.module').then((m) => m.AdminTagModule)
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
