import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { EventLocationsComponent } from './event-locations.component';
import { EventLocationAddComponent } from './pages/event-location-add/event-location-add.component';
import { EventLocationEditComponent } from './pages/event-location-edit/event-location-edit.component';
import { EventLocationListComponent } from './pages/event-location-list/event-location-list.component';

const routes: Routes = [
  {
    path: '',
    component: EventLocationsComponent,
    children: [
      {
        path: 'edit/:guid',
        component: EventLocationEditComponent
      },
      {
        path: 'add',
        component: EventLocationAddComponent
      },
      {
        path: '',
        component: EventLocationListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule, UIFormsModule, PipesModule],
  declarations: [EventLocationsComponent, EventLocationAddComponent, EventLocationEditComponent, EventLocationListComponent]
})
export class EventLocationsModule {}
