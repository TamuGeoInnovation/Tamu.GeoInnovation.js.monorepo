import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  constructor(private readonly mp: EsriModuleProviderService, private readonly ms: EsriMapService) {}

  public gallery() {
    return combineLatest([this.mp.require(['BasemapGalleryViewModel']), this.ms.store]).pipe(
      map(([[BasemapGalleryViewModel], instances]: [[esri.BasemapGalleryViewModelConstructor], MapServiceInstance]) => {
        const model = new BasemapGalleryViewModel({
          view: instances.view
        });

        return model;
      })
    );
  }
}
