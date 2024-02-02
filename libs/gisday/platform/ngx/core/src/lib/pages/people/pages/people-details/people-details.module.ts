import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisDayPeopleModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { PeopleDetailsComponent } from './people-details.component';

const routes: Routes = [
  {
    path: '',
    component: PeopleDetailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisDayPeopleModule, PipesModule],
  declarations: [PeopleDetailsComponent],
  exports: [RouterModule]
})
export class PeopleDetailsModule {}
