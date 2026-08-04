import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

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
      init: jest.fn(() => ({ pipe: () => ({ subscribe: (cb: any) => cb({}) }) })),
      updateSettings: jest.fn()
    };

    mockEventSettingsService = {
      hasSettings: false,
      hasOptions: false,
      eventConfiguration: jest.fn(() => ({ configuration: { id: 'test-event', eventDates: ['2020-01-01'] } })),
      queryParamsFromSettings: ''
    };

    componentInstance = new MapComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { snapshot: { queryParams: {} } } as any,
      {} as any,
      mockSettingsService as any,
      mockEventSettingsService as any,
      {} as any,
      mockModalService as any
    );
  });

  it('opens event-passed modal when dates are past', () => {
    (mockSettingsService.init as jest.Mock).mockImplementation(() => ({ pipe: () => ({ subscribe: (cb: any) => cb({ ['event_passed_ack_test-event']: false }) }) }));

    componentInstance.ngOnInit();

    expect((mockModalService.open as jest.Mock).mock.calls.length).toBe(1);
  });
});
