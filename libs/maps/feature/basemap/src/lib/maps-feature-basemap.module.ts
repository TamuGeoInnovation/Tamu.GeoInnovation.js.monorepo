import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasemapGalleryComponent } from './components/basemap-gallery/basemap-gallery.component';
import { BasemapGalleryService } from './services/basemap-gallery/basemap-gallery.service';

@NgModule({
  imports: [CommonModule],
  declarations: [BasemapGalleryComponent],
  providers: [BasemapGalleryService],
  exports: [BasemapGalleryComponent]
})
export class MapsFeatureBasemapModule {}
