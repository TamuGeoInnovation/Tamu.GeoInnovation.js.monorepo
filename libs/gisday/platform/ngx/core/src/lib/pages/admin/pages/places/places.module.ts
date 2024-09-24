import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { PlacesComponent } from './places.component';
import { PlaceAddComponent } from './pages/place-add/place-add.component';
import { PlaceEditComponent } from './pages/place-edit/place-edit.component';
import { PlaceListComponent } from './pages/place-list/place-list.component';

const routes: Routes = [
  {
    path: '',
    component: PlacesComponent,
    children: [
      {
        path: 'edit/:guid',
        component: PlaceEditComponent
      },
      {
        path: 'add',
        component: PlaceAddComponent
      },
      {
        path: '',
        component: PlaceListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule, UIFormsModule, PipesModule],
  declarations: [PlacesComponent, PlaceAddComponent, PlaceEditComponent, PlaceListComponent]
})
export class PlacesModule {}
