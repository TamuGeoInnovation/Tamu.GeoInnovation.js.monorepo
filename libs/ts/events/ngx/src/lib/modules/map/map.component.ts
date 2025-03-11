import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadModules } from 'esri-loader';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { MapServiceInstance, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { AggiemapBasemap } from '@tamu-gisc/maps/feature/basemap';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventService } from '../../services/event/event.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: ReplaySubject<MapConfig> = new ReplaySubject(undefined);

  public threeDLayers: Array<LayerSource>;

  public isDev: Observable<boolean>;
  public urlBasemap: string;

  /**
   * Used to whether store application settings are set or not, for the purposes of displaying/hiding the url share button (mobile)
   */
  public hasSettings: boolean;

  /**
   * Text content for the share button (mobile)
   */
  public shareUrl: string;

  private _destroy$: Subject<boolean> = new Subject();
  private _connections: { [key: string]: string };

  constructor(
    private readonly responsiveService: ResponsiveService,
    private readonly env: EnvironmentService,
    private readonly ns: NotificationService,
    private readonly ts: TestingService,
    private readonly rt: Router,
    private readonly ar: ActivatedRoute,
    private readonly eventsSettingsService: EventSettingsService,
    private readonly eventService: EventService // While not called, needs to be injected to initialize event layers  loading
  ) {}

  public ngOnInit() {
    // Settings can come from either local storage or from the url query parameters

    this.hasSettings = this.eventsSettingsService.queryParamsFromSettings !== null;
    if (this.hasSettings === false) {
      this.rt.navigate(['/builder']);
      return;
    }

    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventsSettingsService.queryParamsFromSettings}`;

    this._connections = this.env.value('Connections');
    this.isDev = this.ts.get('isTesting');

    // TODO: This needs to be updated when settings service is updated to support settings branch get without feature component/module being loaded.
    // https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/274
    const preferencesString = localStorage.getItem('user-preferences');
    const preferencesSettings = preferencesString !== null ? JSON.parse(preferencesString) : { experiments: null };
    const experimentSettings = preferencesSettings.experiments || {};
    const basemapIdFromUrl = this.ar.snapshot.queryParams['basemap'];

    const basemap: MapConfig['basemap'] = {
      basemap: basemapIdFromUrl ? basemapIdFromUrl : AggiemapBasemap
    };

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile = value;

      this.config.next({
        basemap,
        view: {
          mode: '2d',
          properties: {
            // container: this.mapViewEl.nativeElement,
            map: undefined, // Reference to the map object created before the scene
            center: [-96.34442, 30.60665],
            spatialReference: {
              wkid: 102100
            },
            constraints: {
              minScale: 100000, // minZoom is the max you can zoom OUT into space
              maxScale: 0 // maxZoom is the max you can zoom INTO the ground
            },
            zoom: 16,
            ui: {
              components: this.isMobile ? ['attribution'] : ['attribution', 'zoom']
            },
            popup: {
              dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
                position: 'bottom-right'
              }
            },
            highlightOptions: {
              haloOpacity: 0,
              fillOpacity: 0
            }
          }
        }
      });

      this.threeDLayers = this.env.value('ThreeDLayers', true);
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
  }

  public ngOnDestroy() {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public continue(instances: MapServiceInstance) {
    loadModules(['esri/widgets/Track', 'esri/widgets/Compass'])
      .then(([Track, Compass]) => {
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

        const track: esri.Track = new Track({
          view: instances.view,
          useHeadingEnabled: true,
          goToLocationEnabled: false
        });

        const compass = new Compass({
          view: instances.view
        });

        if (this.isMobile) {
          instances.view.ui.add(track, 'bottom-right');
        } else {
          instances.view.ui.add(track, 'top-left');
          instances.view.ui.add(compass, 'top-left');
        }
      })
      .catch((err) => {
        throw new Error(err);
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

  public notifyUrlCopy() {
    this.ns.toast({
      id: 'url-copied',
      title: 'URL Copied',
      message:
        'Your personalized event URL has been copied to your clipboard. Share it with your friends and family to load the map you have configured!'
    });
  }
}
