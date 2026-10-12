import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, ReplaySubject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadModules } from 'esri-loader';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { MapServiceInstance, MapConfig, EsriMapService, LayerSourcesService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { LegendService } from '@tamu-gisc/maps/feature/legend';
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { aggiemapBasemap, AGGIEMAP_BASEMAP_MAX_SCALE, BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { eventHasPassed } from '@tamu-gisc/common/utils/date';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventService } from '../../services/event/event.service';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { EventPassedWarningComponent, MapNoticeComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { ReveilleConsoleLogComponent } from '@tamu-gisc/ui-kits/ngx/branding';

import { NgClass, AsyncPipe } from '@angular/common';

import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { ClickCoordinatesComponent } from '@tamu-gisc/maps/feature/coordinates';
import { EsriMapComponent } from '@tamu-gisc/maps/esri';
import { PerspectiveToggleComponent } from '@tamu-gisc/maps/feature/perspective';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';
import { PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { MapViewfinderComponent } from '@tamu-gisc/maps/feature/accessibility';

import esri = __esri;

/** Full days after an event's last date before its map says the event has passed (#1298). */
const EVENT_PASSED_GRACE_DAYS = 1;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  // `LayerSourcesService` holds this map's `defaultLayerOverrides`. Provided here, so they live and die
  // with this map; from the application's shared instance they reached every map opened after it in
  // the same tab, the main map included (#1397).
  providers: [
    EventService,
    EsriMapService,
    LayerSourcesService,
    LayerListService,
    LegendService,
    TripPlannerService,
    BasemapGalleryService
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReveilleConsoleLogComponent,
    RouterLink,
    ClickCoordinatesComponent,
    EsriMapComponent,
    NgClass,
    PerspectiveToggleComponent,
    ClipboardCopyDirective,
    RouterOutlet,
    PopupComponent,
    PopupMobileComponent,
    MapViewfinderComponent,
    AsyncPipe
  ]
})
export class MapComponent implements OnInit, OnDestroy {
  private readonly responsiveService = inject(ResponsiveService);
  private readonly env = inject(EnvironmentService);
  private readonly ns = inject(NotificationService);
  private readonly ts = inject(TestingService);
  private readonly rt = inject(Router);
  private readonly ar = inject(ActivatedRoute);
  private readonly store = inject(LocalStoreService);
  private readonly eventsSettingsService = inject(EventSettingsService);
  private readonly eventService = inject(EventService);
  private readonly ms = inject(ModalService);

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
   * Describes if the current has any options available to it.
   */
  public hasOptions: boolean;

  /**
   * When `true` (see `EventConfiguration.hideSidebar`), the map hides its sidebar entirely (already
   * enforced by `SidebarRedirectGuard`) as well as every overlay control tied to it — settings,
   * share URL, legend, layers, and basemap gallery — leaving only the bare map.
   */
  public hideSidebar: boolean;

  /**
   * Text content for the share button (mobile)
   */
  public shareUrl: string;

  private _destroy$: Subject<boolean> = new Subject();
  private _connections: { [key: string]: string };

  public ngOnInit() {
    // Settings can come from either local storage or from the url query parameters

    this.hasSettings = this.eventsSettingsService.hasSettings;
    this.hasOptions = this.eventsSettingsService.hasOptions;
    const root = this.eventsSettingsService.eventConfiguration();
    this.hideSidebar = root?.configuration?.hideSidebar === true;

    // If the current event has options but none are set, redirect to the builder
    if (
      this.hasOptions === true &&
      this.hasSettings === false &&
      !this.eventsSettingsService.hasFeatureSelectionQueryParams(this.ar.snapshot.queryParams)
    ) {
      this.rt.navigate(['builder'], { relativeTo: this.ar.parent?.parent });
      return;
    }

    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventsSettingsService.queryParamsFromSettings}`;

    this._connections = this.env.value?.('Connections') ?? {};
    this.isDev = this.ts.get?.('isTesting') ?? of(false);

    // Whether this map's event is over: every one of its dates has fully ended, in local time. Shared
    // with the rest of AggieMap through `eventHasPassed`; reading `'2026-10-02'` as UTC midnight here
    // called the 150th Opening Ceremony over on the evening of 1 October (#1298).
    // The popup waits one full day after the last date, so an event is never called over while people
    // may still be using its map on the day, or the morning after.
    const passed = eventHasPassed(root?.configuration?.eventDates, Date.now(), EVENT_PASSED_GRACE_DAYS);

    // Either the passed-event warning or this map's one-off notice (a venue change, a closure), never
    // both. A map whose event is over should say so rather than announce a change to something that
    // has already happened - and two modals opened together left the second one as an empty box with
    // only its close button. This no longer relies on a notice being removed before its event ends.
    try {
      if (passed) {
        this.ms.open<boolean>(EventPassedWarningComponent, { data: root?.configuration?.eventPassedWarning });
      } else {
        const notice = root?.configuration?.notice;

        if (notice && !MapNoticeComponent.isDismissed(notice.sessionKey)) {
          this.ms.open<boolean>(MapNoticeComponent, { data: notice });
        }
      }
    } catch (err) {
      console.warn('Failed to show the event-passed warning or the map notice.', err);
    }

    // TODO: This needs to be updated when settings service is updated to support settings branch get without feature component/module being loaded.
    // https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/274
    const settings = this.store.getStorageObjectKeyValue<{ basemap: string }>({
      primaryKey: 'user-preferences',
      subKey: 'settings'
    });

    const basemapIdFromUrl = this.ar.snapshot.queryParams['basemap'];

    // Determine basemap to use
    //
    // 1. If a basemap is provided in the URL, use that.
    // 2. If a basemap is provided in the settings, use that.
    // 3. If the basemap provided in settings is the default Aggiemap basemap, resolve the Aggiemap basemap from the id
    // 4. If no basemap is provided in the URL or settings, use the default 'topo-vector' basemap.
    // A satellite campus map brings its own basemap, as a vector tile source layer in Web Mercator,
    // and must not adopt AggieMap's saved basemap preference.
    //
    // On development that preference resolves to the Aggieland vector tile cache in EPSG:32139. The
    // view then takes its projection from the basemap - it no longer pins itself to Web Mercator -
    // so the campus's own tiled basemap cannot be reprojected into the view and simply disappears,
    // while the buildings feature layer reprojects and draws. Grey outlines on a white page, with
    // every layer reporting itself loaded, visible and drawable.
    //
    // Three things have to coincide for it: the vector basemap, which is development-only; a visitor
    // who has chosen a basemap at some point; and the view no longer being pinned. That is why
    // production is unaffected and why a browser with no saved preference looks fine. See #1259.
    //
    // An explicit `?basemap=` still wins, so a shared link that names one is honoured.
    const isSatelliteCampus = root?.discover?.type === 'satellite-campus';

    const basemap: MapConfig['basemap'] = {
      basemap: basemapIdFromUrl
        ? basemapIdFromUrl
        : isSatelliteCampus
          ? 'topo-vector'
          : settings && settings.basemap
            ? settings.basemap && settings.basemap !== 'aggie_basemap'
              ? settings.basemap
              : aggiemapBasemap(this.ts.isTesting)
            : 'topo-vector'
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
            center: root?.configuration?.mapCenter !== null ? root?.configuration?.mapCenter : [-96.34442, 30.60665],
            // No explicit spatialReference: the view takes it from the basemap. On dev the campus
            // basemap is a vector tile cache in EPSG:32139, and Esri does not reproject vector tiles -
            // pinning the view to Web Mercator here left the basemap loading correctly and drawing
            // nothing. `center` stays lon/lat and is projected into whichever reference the view adopts.
            constraints: {
              minScale: 100000, // minZoom is the max you can zoom OUT into space
              maxScale: AGGIEMAP_BASEMAP_MAX_SCALE // the deepest level the basemap has tiles for (#1577)
            },
            zoom: root?.configuration?.zoom !== undefined ? root.configuration.zoom : 16,
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
    const phraseEl = document.querySelector('.phrase') as HTMLElement | null;

    if (phraseEl) {
      phraseEl.innerText = phrases[Math.floor(Math.random() * phrases.length)];
    }
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
