import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GisDayEventsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { EventViewComponent } from './event-view.component';

const routes: Routes = [
  {
    path: '',
    component: EventViewComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    GisDayEventsModule
  ],
  declarations: [EventViewComponent],
  exports: [RouterModule]
})
export class EventViewModule {}
