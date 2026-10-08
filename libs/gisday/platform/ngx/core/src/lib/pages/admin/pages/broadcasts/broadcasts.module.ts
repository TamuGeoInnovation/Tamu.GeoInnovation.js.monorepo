import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

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
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UIFormsModule,
    PipesModule,
    BroadcastsComponent,
    BroadcastListComponent,
    BroadcastAddComponent,
    BroadcastEditComponent
  ]
})
export class BroadcastsModule {}
