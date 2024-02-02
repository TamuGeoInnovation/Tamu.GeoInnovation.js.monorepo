import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisDayPeopleModule, GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AboutComponent } from './about.component';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayPlatformNgxCommonModule, GisDayPeopleModule],
  declarations: [AboutComponent],
  exports: [RouterModule]
})
export class AboutModule {}
