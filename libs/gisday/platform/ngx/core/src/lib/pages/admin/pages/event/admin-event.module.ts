import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule, GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { AdminEventComponent } from './admin-event.component';
import { EventAddComponent } from './pages/event-add/event-add.component';
import { EventEditComponent } from './pages/event-edit/event-edit.component';
import { EventListComponent } from './pages/event-list/event-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEventComponent,
    children: [
      {
        path: 'edit/:guid',
        component: EventEditComponent
      },
      {
        path: 'add',
        component: EventAddComponent
      },
      {
        path: '',
        component: EventListComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GisdayFormsModule,
    GisdayPlatformNgxCommonModule,
    UIFormsModule,
    PipesModule
  ],
  declarations: [AdminEventComponent, EventAddComponent, EventEditComponent, EventListComponent],
  exports: [RouterModule]
})
export class AdminEventModule {}
