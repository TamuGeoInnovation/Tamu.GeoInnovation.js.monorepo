import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';

import { GeocodingComponent } from './geocoding.component';

const routes: Routes = [
  {
    path: '',
    component: GeocodingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HighlightPlusModule, UILayoutModule, UILayoutCodeModule],
  declarations: [GeocodingComponent]
})
export class GeocodingModule {}
