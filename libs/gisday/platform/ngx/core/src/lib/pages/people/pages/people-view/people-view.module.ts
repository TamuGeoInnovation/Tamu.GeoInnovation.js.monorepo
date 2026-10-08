import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisDayPeopleModule, GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { PeopleViewComponent } from './people-view.component';

const routes: Routes = [
  {
    path: '',
    component: PeopleViewComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), GisdayPlatformNgxCommonModule, GisDayPeopleModule, PeopleViewComponent],
    exports: [RouterModule]
})
export class PeopleViewModule {}
