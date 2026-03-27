import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { BasemapGalleryService } from '../../services/basemap-gallery/basemap-gallery.service';


@Component({
  selector: 'tamu-gisc-basemap-gallery',
  templateUrl: './basemap-gallery.component.html',
  styleUrls: ['./basemap-gallery.component.scss']
})
export class BasemapGalleryComponent implements OnInit {
  public gallery: Observable<__esri.BasemapGalleryViewModel>;
  public isMobile: Observable<boolean>;

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

  public selectBasemap(event: __esri.BasemapGalleryItem) {
    this.bs.setBasemap(event.basemap);

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
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
