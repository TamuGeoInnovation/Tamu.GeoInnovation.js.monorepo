import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BasemapGalleryService } from '../../services/basemap-gallery/basemap-gallery.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-basemap-gallery',
  templateUrl: './basemap-gallery.component.html',
  styleUrls: ['./basemap-gallery.component.scss']
})
export class BasemapGalleryComponent implements OnInit {
  public gallery: Observable<esri.BasemapGalleryViewModel>;

  constructor(private readonly bs: BasemapGalleryService) {}

  ngOnInit(): void {
    this.gallery = this.bs.gallery();
  }

  public selectBasemap(event: esri.BasemapGalleryItem) {
    this.bs.setBasemap(event.basemap);
  }
}
