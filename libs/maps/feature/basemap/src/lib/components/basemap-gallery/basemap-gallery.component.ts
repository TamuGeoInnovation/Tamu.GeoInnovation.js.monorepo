import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { arcgisSignal } from '@tamu-gisc/maps/esri';

import { BasemapGalleryService } from '../../services/basemap-gallery/basemap-gallery.service';
import { NgClass, AsyncPipe } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-basemap-gallery',
  templateUrl: './basemap-gallery.component.html',
  styleUrls: ['./basemap-gallery.component.scss'],
  imports: [NgClass, AsyncPipe]
})
export class BasemapGalleryComponent {
  private readonly bs = inject(BasemapGalleryService);
  private readonly rs = inject(ResponsiveService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly anl = inject(Angulartics2);
  private readonly store = inject(LocalStoreService);

  public readonly isMobile: Observable<boolean> = this.rs.isMobile;

  private readonly model = toSignal(this.bs.gallery());

  /**
   * The gallery as the template shows it. Its view model fills its items in as its source loads, and
   * changes its active basemap in place whenever the map's basemap changes, from here or elsewhere, so
   * both are read through `arcgisSignal` (#1673). A basemap named by id gets its title and thumbnail
   * when it loads, so those are read too.
   */
  public readonly gallery = arcgisSignal(() => {
    const model = this.model();

    if (!model) {
      return undefined;
    }

    const items = model.items.toArray();

    return {
      items,
      activeId: model.activeBasemap?.id,
      labels: items.map((item) => `${item.basemap.title} ${item.basemap.thumbnailUrl}`)
    };
  });

  /**
   * Id of the basemap currently being switched to, or undefined when none is.
   *
   * Aerial Imagery is a WMS and takes noticeably longer than the rest, so without this the map looks
   * unchanged and reads as broken rather than busy.
   */
  public readonly loadingBasemapId = signal<string>(undefined);

  /** Whether a basemap cannot be shown as the map is now: one a 3D scene cannot draw, in 3D (#1740). */
  public unavailable(item: esri.BasemapGalleryItem): boolean {
    return this.bs.unavailable(item.basemap);
  }

  public async selectBasemap(event: esri.BasemapGalleryItem) {
    if (this.unavailable(event)) {
      return;
    }

    this.loadingBasemapId.set(event.basemap.id);

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
      this.loadingBasemapId.set(undefined);
    }
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
