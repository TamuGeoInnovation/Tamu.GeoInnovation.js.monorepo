import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

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
      open: jest.fn(() => ({ subscribe: (cb: any) => cb(true) }))
    };

    mockSettingsService = {
      updateSettings: jest.fn(),
      getStorageObjectKeyValue: jest.fn(() => null)
    };

    mockEventSettingsService = {
      hasSettings: false,
      hasOptions: false,
      eventConfiguration: jest.fn(() => ({ configuration: { id: 'test-event', eventDates: ['2020-01-01'] } })),
      queryParamsFromSettings: ''
    };

    componentInstance = TestBed.configureTestingModule({
      providers: [
        { provide: ResponsiveService, useValue: { isMobile: of(false) } },
        { provide: EnvironmentService, useValue: { value: jest.fn(() => ({})) } },
        { provide: NotificationService, useValue: {} },
        { provide: TestingService, useValue: { get: jest.fn(() => of(false)) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, parent: null } },
        { provide: LocalStoreService, useValue: { getStorageObjectKeyValue: jest.fn(() => null) } },
        { provide: EventSettingsService, useValue: mockEventSettingsService },
        { provide: EventService, useValue: {} },
        { provide: ModalService, useValue: mockModalService }
      ]
    }).runInInjectionContext(() => new MapComponent());
  });

  it('opens event-passed modal when dates are past', () => {
    componentInstance.ngOnInit();

    expect((mockModalService as any).open.mock.calls.length).toBe(1);
  });
});
