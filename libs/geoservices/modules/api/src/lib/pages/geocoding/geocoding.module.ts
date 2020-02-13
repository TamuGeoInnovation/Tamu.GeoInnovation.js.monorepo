import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { GeocodingComponent } from './geocoding.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: GeocodingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HighlightPlusModule, UIClipboardModule],
  declarations: [GeocodingComponent],
  exports: [RouterModule]
})
export class GeocodingModule {}
