import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { BroadcastsComponent } from './broadcasts.component';
import { BroadcastListComponent } from './pages/broadcast-list/broadcast-list.component';
import { BroadcastAddComponent } from './pages/broadcast-add/broadcast-add.component';
import { BroadcastEditComponent } from './pages/broadcast-edit/broadcast-edit.component';

const routes: Routes = [
  {
    path: '',
    component: BroadcastsComponent,
    children: [
      {
        path: 'edit/:guid',
        component: BroadcastEditComponent
      },
      {
        path: 'add',
        component: BroadcastAddComponent
      },
      {
        path: '',
        component: BroadcastListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule],
  declarations: [BroadcastsComponent, BroadcastListComponent, BroadcastAddComponent, BroadcastEditComponent]
})
export class BroadcastsModule {}
