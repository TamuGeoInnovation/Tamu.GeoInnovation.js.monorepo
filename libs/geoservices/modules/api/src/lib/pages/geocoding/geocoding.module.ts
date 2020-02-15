import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeocodingComponent } from './geocoding.component';
import { Routes, RouterModule } from '@angular/router';
import { ApiComponentsModule } from '../../components/components.module';

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
    UIScrollToModule,
    UILayoutModule,
    ApiComponentsModule
  ],
  declarations: [GeocodingComponent],
  exports: [RouterModule]
})
export class GeocodingModule {}
