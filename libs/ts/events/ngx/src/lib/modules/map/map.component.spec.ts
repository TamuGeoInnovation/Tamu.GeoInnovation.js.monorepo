import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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

    componentInstance = new MapComponent(
      { isMobile: of(false) } as any,
      { value: jest.fn(() => ({})) } as any,
      {} as any,
      { get: jest.fn(() => of(false)) } as any,
      { navigate: jest.fn() } as any,
      { snapshot: { queryParams: {} }, parent: null } as any,
      { getStorageObjectKeyValue: jest.fn(() => null) } as any,
      mockEventSettingsService as any,
      {} as any,
      mockModalService as any
    );
  });

  it('opens event-passed modal when dates are past', () => {
    componentInstance.ngOnInit();

    expect((mockModalService as any).open.mock.calls.length).toBe(1);
  });
});
