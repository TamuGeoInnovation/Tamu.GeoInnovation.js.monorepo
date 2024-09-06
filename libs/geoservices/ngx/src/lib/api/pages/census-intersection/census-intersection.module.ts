import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CensusIntersectionComponent } from './census-intersection.component';
import { ApiComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CensusIntersectionComponent
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
  declarations: [CensusIntersectionComponent]
})
export class CensusIntersectionModule {}
