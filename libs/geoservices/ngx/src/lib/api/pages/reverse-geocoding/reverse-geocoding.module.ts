import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ApiComponentsModule } from '../../components/components.module';
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
    HighlightPlusModule,
    UIClipboardModule,
    UIScrollToModule,
    UILayoutModule,
    ApiComponentsModule
  ],
  declarations: [ReverseGeocodingComponent]
})
export class ReverseGeocodingModule {}
