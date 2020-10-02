import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { EventDetailComponent } from './event-detail.component';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

const routes: Routes = [
  {
    path: '',
    component: EventDetailComponent
  }
];

@NgModule({
  declarations: [EventDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  exports: [RouterModule]
})
export class EventDetailModule {}
