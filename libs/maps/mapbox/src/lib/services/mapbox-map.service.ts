import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Map, MapboxOptions } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MapboxMapService {
  public map: Map;

  public loaded: ReplaySubject<Map> = new ReplaySubject(1);

  constructor() {}

  public createMap(properties?: MapboxOptions) {
    const defaultsUnlessProvided: Partial<MapboxOptions> = {
      ...properties,
      accessToken: properties.accessToken ? properties.accessToken : 'demo',
      style: properties.style ? properties.style : 'mapbox://styles/mapbox/light-v10',
      center: properties.center ? properties.center : [0, 0],
      minZoom: properties.minZoom ? properties.minZoom : 3,
      maxZoom: properties.maxZoom ? properties.maxZoom : 10
    };

    this.map = new Map(defaultsUnlessProvided as MapboxOptions);

    this.map.on('load', () => {
      this.loaded.next(this.map);
    });
  }
}
