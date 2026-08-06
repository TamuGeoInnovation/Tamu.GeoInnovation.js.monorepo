import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
