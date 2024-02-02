import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SeasonsListComponent } from './pages/seasons-list/seasons-list.component';
import { SeasonEditComponent } from './pages/season-edit/season-edit.component';

const routes: Routes = [
  {
    path: 'edit/:guid',
    component: SeasonEditComponent
  },
  {
    path: '',
    component: SeasonsListComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule, PipesModule, GisdayFormsModule],
  declarations: [SeasonsListComponent, SeasonEditComponent],
  exports: [RouterModule]
})
export class SeasonsModule {}
