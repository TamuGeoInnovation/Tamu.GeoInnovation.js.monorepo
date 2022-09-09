import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestViewerComponent } from './components/request-viewer/request-viewer.component';
import { GeocodingRequestComponent } from './components/geocoding-request/geocoding-request.component';
import { RequestBaseComponent } from './components/request-base/request-base.component';

@NgModule({
  declarations: [RequestViewerComponent, GeocodingRequestComponent, RequestBaseComponent],
  imports: [CommonModule],
  exports: [RequestViewerComponent, GeocodingRequestComponent]
})
export class GeoservicesCoreInteractiveModule {}
