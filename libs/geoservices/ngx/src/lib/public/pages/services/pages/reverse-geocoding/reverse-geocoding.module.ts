import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

const routes: Routes = [
  {
    path: '',
    component: ReverseGeocodingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    HighlightPlusModule,
    UILayoutModule,
    UILayoutCodeModule
  ],
  declarations: [ReverseGeocodingComponent]
})
export class ReverseGeocodingModule {}
