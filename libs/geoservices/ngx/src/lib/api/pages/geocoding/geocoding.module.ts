import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

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
    HighlightPlusModule,
    UIClipboardModule,
    UILayoutModule,
    GeocodingComponent
],
  exports: [RouterModule]
})
export class GeocodingModule {}
