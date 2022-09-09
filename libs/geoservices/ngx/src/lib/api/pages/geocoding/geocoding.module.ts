import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeocodingComponent } from './geocoding.component';
import { ApiComponentsModule } from '../../components/components.module';
import { GeoservicesCoreInteractiveModule } from '../../../core/modules/interactive/interactive.module';

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
    ApiComponentsModule,
    GeoservicesCoreInteractiveModule
  ],
  declarations: [GeocodingComponent],
  exports: [RouterModule]
})
export class GeocodingModule {}
