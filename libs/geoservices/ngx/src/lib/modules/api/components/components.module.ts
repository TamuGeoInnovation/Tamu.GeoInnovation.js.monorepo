import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { ResponseViewerComponent } from './response-viewer/response-viewer.component';

@NgModule({
  imports: [CommonModule, HighlightPlusModule],
  declarations: [ResponseViewerComponent],
  exports: [ResponseViewerComponent]
})
export class ApiComponentsModule {}
