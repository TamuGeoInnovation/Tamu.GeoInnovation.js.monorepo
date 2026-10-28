import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';

import {
  aggiemapBasemap,
  AGGIEMAP_BASEMAP_MAX_SCALE,
  BasemapGalleryService,
  NearmapDateSliderComponent
} from '@tamu-gisc/maps/feature/basemap';
import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { MapServiceInstance, MapConfig, HIDDEN_DEFAULT_HIGHLIGHT } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { BetaPromptComponent, AlertModalComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { ReveilleConsoleLogComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterLink, RouterOutlet } from '@angular/router';

import { NgClass, AsyncPipe } from '@angular/common';

import { ClickCoordinatesComponent } from '@tamu-gisc/maps/feature/coordinates';
import { EsriMapComponent, MapCompassComponent } from '@tamu-gisc/maps/esri';
import { PerspectiveToggleComponent } from '@tamu-gisc/maps/feature/perspective';
import { MapViewfinderComponent } from '@tamu-gisc/maps/feature/accessibility';

import esri = __esri;
@Component({
  selector: 'tamu-gisc-aggiemap-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  // Esri's locate button, `<arcgis-track>`, sits in the map's slots (#1949).
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ReveilleConsoleLogComponent,
    RouterLink,
    ClickCoordinatesComponent,
    EsriMapComponent,
    MapCompassComponent,
    NgClass,
    PerspectiveToggleComponent,
    RouterOutlet,
    MapViewfinderComponent,
    NearmapDateSliderComponent,
    AsyncPipe
  ]
})
export class MapComponent implements OnInit, OnDestroy {
  private responsiveService = inject(ResponsiveService);
  private env = inject(EnvironmentService);
  private readonly ms = inject(ModalService);
  private readonly ss = inject(SettingsService);
  private readonly ts = inject(TestingService);
  private readonly basemaps = inject(BasemapGalleryService);

  public map: esri.Map;
  public view: esri.MapView;
  public readonly isMobile = signal<boolean | undefined>(undefined);
  public config: ReplaySubject<MapConfig> = new ReplaySubject(undefined);

  public readonly threeDLayers = signal<Array<LayerSource> | undefined>(undefined);

  public isDev: Observable<boolean>;
  public urlBasemap: string;

  private _destroy$: Subject<boolean> = new Subject();
  private _connections: { [key: string]: string };

  public ngOnInit() {
    this._connections = this.env.value('Connections');
    this.isDev = this.ts.get('isTesting');

    // TODO: This needs to be updated when settings service is updated to support settings branch get without feature component/module being loaded.
    // https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/274
    const preferencesString = localStorage.getItem('user-preferences');
    const preferencesSettings = preferencesString !== null ? JSON.parse(preferencesString) : { experiments: null };
    const experimentSettings = preferencesSettings.experiments || {};

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile.set(value);

      this.config.next({
        basemap: {
          basemap: aggiemapBasemap()
        },
        view: {
          properties: {
            // container: this.mapViewEl.nativeElement,
            map: undefined, // Reference to the map object created before the scene
            center: [-96.344672, 30.61306],
            // No explicit spatialReference: the view takes it from the basemap. The campus basemap is
            // a vector tile cache in EPSG:32139, and Esri does not reproject vector tiles - pinning the
            // view to Web Mercator here left the basemap loading correctly and drawing nothing.
            // `center` stays lon/lat, which is projected into whichever spatial reference the view adopts.
            constraints: {
              minScale: 100000, // minZoom is the max you can zoom OUT into space
              maxScale: AGGIEMAP_BASEMAP_MAX_SCALE // the deepest level the basemap has tiles for (#1577)
            },
            zoom: 16,
            // Hidden, as it was by this application's stylesheet until the view moved into `<arcgis-map>`'s
            // shadow root, where the stylesheet does not reach (#1949).
            attributionVisible: false,
            popup: {
              dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
                position: 'bottom-right'
              }
            },
            highlights: HIDDEN_DEFAULT_HIGHLIGHT
          }
        }
      });

      this.threeDLayers.set(this.env.value('ThreeDLayers', true));
    });

    // Set loader phrases and display a random one.
    const phrases = [
      'An Aggie does not lie, cheat or steal or tolerate those who do.',
      'Home of the 12th Man',
      'Whoop!',
      "Gig 'Em!",
      'Howdy Ags!'
    ];
    (<HTMLInputElement>document.querySelector('.phrase')).innerText = phrases[Math.floor(Math.random() * phrases.length)];

    /*
     * Old beta popup flow.
     * Kept here for now in case we need to restore it later, but the dev-only
     * AGGIEMAP BETA popup already covers this behavior.
     *
     * this.ss
     *   .init({
     *     storage: {
     *       subKey: 'modals'
     *     },
     *     settings: {
     *       beta_acknowledge: {
     *         value: false,
     *         persistent: true
     *       }
     *     }
     *   })
     *   .pipe(
     *     filter((settings) => {
     *       return settings['beta_acknowledge'] === false;
     *     }),
     *     withLatestFrom(this.isDev)
     *   )
     *   .subscribe(([, isDev]) => {
     *     this.openBetaModal(isDev);
     *   });
     */
  }

  public ngOnDestroy() {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public continue(instances: MapServiceInstance) {
    // A link naming an Aerial Imagery capture, `?imagery=2025-11-22`, opens on it (#1541).
    this.basemaps.applyNearmapCaptureFromUrl();

    instances.view.when(() => {
      //
      // Loader disable
      //
      document.querySelector('.loader .progress-bar')?.classList.remove('anim');

      setTimeout(() => {
        document.querySelector('.loader')?.classList.add('fade-out');

        setTimeout(() => {
          (<HTMLElement>document.querySelector('.loader')).style.display = 'none';
        }, 300);
      }, 300);
    });
  }

  /**
   * Toggles a class on a DOM Element. While the .toggle() method can be used in code,
   * it cannot be used in HTML templates
   */
  public toggleClass = (event: Event, className: string) => {
    if ((<HTMLElement>event.currentTarget).classList) {
      if ((<HTMLElement>event.currentTarget).classList.contains(className)) {
        (<HTMLElement>event.currentTarget).classList.remove(className);
      } else {
        (<HTMLElement>event.currentTarget).classList.add(className);
      }
    } else {
      throw new Error('No event provided.');
    }
  };

  public openBetaModal(shouldOpen: boolean) {
    if (shouldOpen) {
      this.ms
        .open<boolean>(AlertModalComponent, {
          data: {
            title: 'Beta Feature',
            message:
              'You are viewing a beta feature. Functionality and content may change. Please provide feedback if you find issues.',
            primaryText: 'Acknowledge',
            persistKey: 'beta_acknowledge'
          }
        })
        .pipe(
          filter((acknowledged) => {
            return acknowledged;
          })
        )
        .subscribe(() => {
          // Keep existing update for compatibility; AlertModal also persists using the provided persistKey.
          this.updateModalSettings();
        });
    }
  }

  private updateModalSettings() {
    this.ss.updateSettings({
      beta_acknowledge: true
    });
  }
}
