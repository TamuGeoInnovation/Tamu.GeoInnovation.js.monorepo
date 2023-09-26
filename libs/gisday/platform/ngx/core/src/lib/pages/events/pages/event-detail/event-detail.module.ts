import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GisDayPeopleModule, GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { EventDetailComponent } from './event-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EventDetailComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    GisdayPlatformNgxCommonModule,
    GisDayPeopleModule,
    PipesModule
  ],
  declarations: [EventDetailComponent],
  exports: [RouterModule]
})
export class EventDetailModule {}
