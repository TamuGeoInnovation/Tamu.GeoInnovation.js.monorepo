import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { BasemapGalleryService, aggiemapBasemap, aggiemapRasterBasemap } from '@tamu-gisc/maps/feature/basemap';
import { MapConfig } from '@tamu-gisc/maps/esri';

import { TailgatingConfiguration } from '../../definitions/tailgating.definitions';
import { EventService } from '../../services/event/event.service';
import { EventSettingsService } from '../../services/settings/event-settings.service';
import { MapComponent } from './map.component';

// The generated `describe('MapComponent')` block that used to sit here declared the component in a
// TestBed with no providers. MapComponent injects roughly a dozen services -- EnvironmentService,
// EsriMapService, TripPlannerService, LegendService, LayerListService and more -- so it could never
// construct. It asserted only `toBeTruthy()`, which the build already guarantees. The
// event-passed-flow block below is the real coverage: it builds the component with mocks and
// exercises actual behaviour.
// Additional unit test for event-passed modal behavior using mocked services
describe('MapComponent (event-passed flow)', () => {
  let componentInstance: MapComponent;
  let mockModalService: Partial<any>;
  let mockSettingsService: Partial<any>;
  let mockEventSettingsService: Partial<any>;

  beforeEach(() => {
    mockModalService = {
      open: vi.fn(() => ({ subscribe: (cb: any) => cb(true) }))
    };

    mockSettingsService = {
      updateSettings: vi.fn(),
      getStorageObjectKeyValue: vi.fn(() => null)
    };

    mockEventSettingsService = {
      hasSettings: false,
      hasOptions: false,
      eventConfiguration: vi.fn(() => ({ configuration: { id: 'test-event', eventDates: ['2020-01-01'] } })),
      queryParamsFromSettings: ''
    };

    componentInstance = TestBed.configureTestingModule({
      providers: [
        { provide: ResponsiveService, useValue: { isMobile: of(false) } },
        { provide: EnvironmentService, useValue: { value: vi.fn(() => ({})) } },
        { provide: NotificationService, useValue: {} },
        { provide: TestingService, useValue: { get: vi.fn(() => of(false)) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, parent: null } },
        { provide: LocalStoreService, useValue: { getStorageObjectKeyValue: vi.fn(() => null) } },
        { provide: EventSettingsService, useValue: mockEventSettingsService },
        { provide: EventService, useValue: {} },
        { provide: ModalService, useValue: mockModalService },
        { provide: BasemapGalleryService, useValue: { applyNearmapCaptureFromUrl: vi.fn() } }
      ]
    }).runInInjectionContext(() => new MapComponent());
  });

  it('opens event-passed modal when dates are past', () => {
    componentInstance.ngOnInit();

    expect((mockModalService as any).open.mock.calls.length).toBe(1);
  });
});

// The basemap a map opens on. A visitor's last choice is saved by id, and Aerial Imagery's id cannot be
// turned back into a basemap on load (#1692): the Football Tailgating map opened with no basemap and no
// zoom levels. A map read against campus can say to open on the campus basemap instead.
describe('MapComponent (opening basemap)', () => {
  function openingBasemap(options: { configuration?: object; saved?: string; urlBasemap?: string }) {
    // Set by the subscription below, which the ReplaySubject runs during ngOnInit.
    let basemap: MapConfig['basemap']['basemap'] | undefined;

    const component = TestBed.configureTestingModule({
      providers: [
        { provide: ResponsiveService, useValue: { isMobile: of(false) } },
        { provide: EnvironmentService, useValue: { value: vi.fn(() => ({})) } },
        { provide: NotificationService, useValue: {} },
        { provide: TestingService, useValue: { isTesting: true, get: vi.fn(() => of(true)) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: options.urlBasemap ? { basemap: options.urlBasemap } : {} }, parent: null }
        },
        {
          provide: LocalStoreService,
          useValue: { getStorageObjectKeyValue: vi.fn(() => (options.saved ? { basemap: options.saved } : null)) }
        },
        {
          provide: EventSettingsService,
          useValue: {
            hasSettings: false,
            hasOptions: false,
            eventConfiguration: vi.fn(() => ({ configuration: { id: 'test-event', ...options.configuration } })),
            queryParamsFromSettings: ''
          }
        },
        { provide: EventService, useValue: {} },
        { provide: ModalService, useValue: { open: vi.fn() } },
        { provide: BasemapGalleryService, useValue: { applyNearmapCaptureFromUrl: vi.fn() } }
      ]
    }).runInInjectionContext(() => new MapComponent());

    component.config.subscribe((config) => (basemap = config.basemap.basemap));
    component.ngOnInit();
    component.ngOnDestroy();
    TestBed.resetTestingModule();

    return basemap;
  }

  it('opens a campus map on the campus basemap, even after Aerial Imagery was last chosen', () => {
    expect(openingBasemap({ configuration: { basemap: 'campus' }, saved: 'nearmap_cs_basemap' })).toEqual(
      aggiemapBasemap()
    );
  });

  it('opens a campus map on the campus basemap when nothing was saved', () => {
    expect(openingBasemap({ configuration: { basemap: 'campus' } })).toEqual(aggiemapBasemap());
  });

  it('still opens a campus map on a basemap named in its link', () => {
    expect(openingBasemap({ configuration: { basemap: 'campus' }, urlBasemap: 'streets-vector' })).toBe('streets-vector');
  });

  it('leaves other maps on the basemap the visitor last chose', () => {
    expect(openingBasemap({ saved: 'gray-vector' })).toBe('gray-vector');
  });

  it('opens a raster-campus map on Aggieland raster, October 2026, even after Aerial Imagery was last chosen', () => {
    const basemap = openingBasemap({ configuration: { basemap: 'campus-raster' }, saved: 'nearmap_cs_basemap' });

    expect(basemap).toEqual(aggiemapRasterBasemap(true));
    expect((basemap as { title: string }).title).toBe('Aggieland raster, October 2026');
  });

  it('still opens a raster-campus map on a basemap named in its link', () => {
    expect(openingBasemap({ configuration: { basemap: 'campus-raster' }, urlBasemap: 'gray-vector' })).toBe('gray-vector');
  });

  it('opens Football Tailgating on Aggieland raster, October 2026', () => {
    expect(TailgatingConfiguration.basemap).toBe('campus-raster');
  });
});
