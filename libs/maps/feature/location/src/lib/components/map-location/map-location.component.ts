import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { geolocationPermission } from '@tamu-gisc/common/utils/geometry';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import esri = __esri;

/**
 * The id of the layer holding the dot, so it can be told apart from the map's own layers.
 */
export const MAP_LOCATION_LAYER_ID = 'map-location-layer';

/**
 * The zoom the map comes to, at least, when centred on the location.
 */
export const MAP_LOCATION_ZOOM = 18;

/**
 * Where the dot is: not shown yet, waiting for the first position, following the location, or blocked
 * in the browser.
 */
export type MapLocationState = 'off' | 'finding' | 'on' | 'blocked';

/**
 * A "you are here" dot on the map, as Google and Apple Maps draw it (#2625): blue, inside a circle as wide
 * as the phone says its location may be off, following the location as it moves, with a button that
 * centres the map on it.
 *
 * It never asks for the location on its own. A browser remembers for each site whether it may use the
 * location, so this checks first (#2559): where it is already allowed, the dot follows at once; where the
 * browser would ask, or cannot say, it waits for the button, so the question comes from a tap and only once;
 * where it is blocked, it does nothing until it is allowed again.
 */
@Component({
  selector: 'tamu-gisc-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss']
})
export class MapLocationComponent implements OnInit, OnDestroy {
  private readonly mp = inject(EsriModuleProviderService);
  private readonly mapService = inject(EsriMapService);

  public readonly state = signal<MapLocationState>('off');

  public readonly label: Record<MapLocationState, string> = {
    off: 'Show my location',
    finding: 'Finding your location',
    on: 'Centre on my location',
    blocked: 'Location is blocked for this site'
  };

  public readonly icon: Record<MapLocationState, string> = {
    off: 'location_searching',
    finding: 'location_searching',
    on: 'my_location',
    blocked: 'location_disabled'
  };

  private _track: TrackLocation;
  private _position: GeolocationPosition;
  private _centreOnNextPosition = false;
  private _layer: Promise<{ layer: esri.GraphicsLayer; dot: esri.Graphic; accuracy: esri.Graphic }>;
  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit(): void {
    geolocationPermission()
      .pipe(takeUntil(this._destroy$))
      .subscribe((permission) => {
        if (permission === 'denied') {
          this._stop();
          this.state.set('blocked');
        } else if (permission === 'granted' && this._track === undefined) {
          this._start();
        } else if (this.state() === 'blocked') {
          this.state.set('off');
        }
      });
  }

  public ngOnDestroy(): void {
    this._stop();
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Centres the map on the location, starting to follow it first if it is not yet.
   */
  public locate(): void {
    if (this.state() === 'blocked') {
      return;
    }

    if (this._position) {
      this._centre(this._position);
    } else {
      this._centreOnNextPosition = true;
    }

    if (this._track === undefined) {
      this._start();
    }
  }

  private _start() {
    this.state.set('finding');

    // A timeout or a position not yet available is common on a first fix or beside buildings, so the watch
    // carries on through them; only a refusal ends it.
    this._track = new TrackLocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 10000, keepWatching: true });
    this._track
      .track()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (position) => {
          this._position = position;
          this.state.set('on');
          this._draw(position);

          if (this._centreOnNextPosition) {
            this._centreOnNextPosition = false;
            this._centre(position);
          }
        },
        error: () => {
          this._track = undefined;
          this._stop();
          this.state.set('blocked');
        }
      });
  }

  private _stop() {
    this._track?.dispose();
    this._track = undefined;
    this._position = undefined;
    this._centreOnNextPosition = false;

    const layer = this._layer;

    this._layer = undefined;
    layer?.then(({ layer }) => layer.parent && (layer.parent as esri.Map).remove(layer));
  }

  private async _draw(position: GeolocationPosition) {
    const { latitude, longitude, accuracy } = position.coords;
    const { dot, accuracy: circle } = await this._graphics();
    const [Circle] = await this.mp.require(['Circle']);

    dot.geometry = { type: 'point', latitude, longitude } as esri.Point;
    circle.geometry = new Circle({
      center: { type: 'point', latitude, longitude } as esri.Point,
      radius: Math.max(accuracy, 1),
      radiusUnit: 'meters',
      geodesic: true
    });
  }

  private _centre(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;

    this.mapService.store.pipe(take(1)).subscribe(async ({ view }) => {
      // A Point, not a plain object: goTo takes a plain one as no place, and only zooms (#2625).
      const [Point] = await this.mp.require(['Point']);

      view.goTo({ target: new Point({ latitude, longitude }), zoom: Math.max(view.zoom, MAP_LOCATION_ZOOM) }).catch(() => {
        // A newer goTo, from a pan or another tap, interrupts this one, which is fine.
      });
    });
  }

  /**
   * The layer and its two graphics, made and added on top of the map's layers the first time there is a
   * position to draw.
   */
  private _graphics() {
    if (this._layer === undefined) {
      this._layer = new Promise((resolve) => {
        this.mapService.store.pipe(take(1)).subscribe(async ({ map }) => {
          const [GraphicsLayer, Graphic] = await this.mp.require(['GraphicsLayer', 'Graphic']);

          const accuracy: esri.Graphic = new Graphic({
            symbol: {
              type: 'simple-fill',
              color: [66, 133, 244, 0.15],
              outline: { color: [66, 133, 244, 0.5], width: 1 }
            }
          });
          const dot: esri.Graphic = new Graphic({
            symbol: {
              type: 'simple-marker',
              style: 'circle',
              size: 14,
              color: '#4285f4',
              outline: { color: '#ffffff', width: 2 }
            }
          });
          const layer: esri.GraphicsLayer = new GraphicsLayer({
            id: MAP_LOCATION_LAYER_ID,
            title: 'Your location',
            listMode: 'hide',
            graphics: [accuracy, dot]
          });

          map.add(layer);
          resolve({ layer, dot, accuracy });
        });
      });
    }

    return this._layer;
  }
}
