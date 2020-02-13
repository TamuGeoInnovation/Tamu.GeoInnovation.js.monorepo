import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { GeocodingComponent } from './geocoding.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: GeocodingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HighlightPlusModule],
  declarations: [GeocodingComponent],
  exports: [RouterModule]
})
export class GeocodingModule {}
