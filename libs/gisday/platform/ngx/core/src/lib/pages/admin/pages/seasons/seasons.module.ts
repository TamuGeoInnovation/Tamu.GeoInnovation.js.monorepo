import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SeasonsListComponent } from './seasons-list/seasons-list.component';
import { SeasonsEditComponent } from './seasons-edit/seasons-edit.component';
import { SeasonsDayTileComponent } from './seasons-day-tile/seasons-day-tile.component';

const routes: Routes = [
  {
    path: 'edit/:guid',
    component: SeasonsEditComponent
  },
  {
    path: '',
    component: SeasonsListComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule, PipesModule],
  declarations: [SeasonsListComponent, SeasonsEditComponent, SeasonsDayTileComponent],
  exports: [RouterModule]
})
export class SeasonsModule {}
