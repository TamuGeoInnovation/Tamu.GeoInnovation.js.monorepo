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
        loadChildren: () => import('./landing/admin-landing.module').then((m) => m.AdminLandingModule)
      },
      {
        path: 'checkins',
        loadChildren: () => import('./checkin/admin-checkins.module').then((m) => m.AdminCheckinsModule)
      },
      {
        path: 'classes',
        loadChildren: () => import('./class/admin-class.module').then((m) => m.AdminClassModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./event/admin-event.module').then((m) => m.AdminEventModule)
      },
      {
        path: 'rsvp-types',
        loadChildren: () => import('./rsvp-type/admin-rsvp-type.module').then((m) => m.AdminRsvpTypeModule)
      },
      {
        path: 'speakers',
        loadChildren: () => import('./speaker/admin-speaker.module').then((m) => m.AdminSpeakerModule)
      },
      {
        path: 'sponsors',
        loadChildren: () => import('./sponsor/admin-sponsor.module').then((m) => m.AdminSponsorModule)
      }
      // {
      //   path: 'submission-types',
      //   loadChildren: () => import('./event/admin-event.module').then((m) => m.AdminEventModule)
      // },
      // {
      //   path: 'tags',
      //   loadChildren: () => import('./rsvp-type/admin-rsvp-type.module').then((m) => m.AdminRsvpTypeModule)
      // }
    ]
  }
];

@NgModule({
  declarations: [AdminComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminModule {}
