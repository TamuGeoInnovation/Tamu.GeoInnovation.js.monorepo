import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { GeocodingComponent } from './geocoding.component';

const routes: Routes = [
  {
    path: '',
    component: GeocodingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HighlightPlusModule,
    GeoservicesCoreNgxModule,
    UILayoutModule,
    UILayoutCodeModule,
    UIFormsModule
  ],
  declarations: [GeocodingComponent]
})
export class GeocodingModule {}
