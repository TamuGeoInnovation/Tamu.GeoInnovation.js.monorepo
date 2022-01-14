import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { EventComponent } from './event.component';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/event-view/event-view.module').then((m) => m.EventViewModule)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/event-detail/event-detail.module').then((m) => m.EventDetailModule)
      }
    ]
  }
];

@NgModule({
  declarations: [EventComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventModule {}
