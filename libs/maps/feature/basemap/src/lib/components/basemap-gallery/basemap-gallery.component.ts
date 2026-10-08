import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { BasemapGalleryService } from '../../services/basemap-gallery/basemap-gallery.service';
import { NgClass, AsyncPipe } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-basemap-gallery',
  templateUrl: './basemap-gallery.component.html',
  styleUrls: ['./basemap-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, AsyncPipe]
})
export class BasemapGalleryComponent implements OnInit {
  public gallery: Observable<esri.BasemapGalleryViewModel>;
  public isMobile: Observable<boolean>;

  /**
   * Id of the basemap currently being switched to, or undefined when none is.
   *
   * Aerial Imagery is a WMS and takes noticeably longer than the rest, so without this the map looks
   * unchanged and reads as broken rather than busy.
   */
  public loadingBasemapId: string;

  constructor(
    private readonly bs: BasemapGalleryService,
    private readonly rs: ResponsiveService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly anl: Angulartics2,
    private readonly store: LocalStoreService
  ) {}

  public ngOnInit(): void {
    this.gallery = this.bs.gallery();
    this.isMobile = this.rs.isMobile;
  }

  public async selectBasemap(event: esri.BasemapGalleryItem) {
    this.loadingBasemapId = event.basemap.id;

    this.store.setStorageObjectKeyValue({
      primaryKey: 'user-preferences',
      subKey: 'settings',
      value: {
        basemap: event.basemap.id
      }
    });

    this.anl.eventTrack.next({
      action: 'basemap_select',
      properties: {
        category: 'ui_interaction',
        gstCustom: event.basemap.id
      }
    });

    try {
      await this.bs.setBasemap(event.basemap);
    } finally {
      this.loadingBasemapId = undefined;
    }
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
