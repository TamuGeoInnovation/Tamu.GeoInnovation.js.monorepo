import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LegendElementComponent } from './legend-element.component';

describe('LegendElementComponent', () => {
  let component: LegendElementComponent;
  let fixture: ComponentFixture<LegendElementComponent>;

  beforeEach(async () => {
    const spy = {
      require: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [LegendElementComponent],
      providers: [{ provide: EsriModuleProviderService, useValue: spy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendElementComponent);
    component = fixture.componentInstance;
    component.element = { type: 'symbol-table', infos: [] } as unknown as __esri.LegendElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles expanded state when legend element is grouped', () => {
    component.element = {
      infos: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }]
    } as unknown as __esri.LegendElement;

    expect(component.showGroupHeader).toBe(true);
    expect(component.expanded).toBe(true);

    component.toggleExpanded();
    expect(component.expanded).toBe(false);
  });

  it('uses the group title label for non-bike single-entry legend elements', async () => {
    component.groupTitle = 'Baseball Symbols';
    component.layer = {
      id: 'baseball-event-symbols',
      url: 'https://gis.tamu.edu/arcgis/rest/services/TS/BaseballParking/MapServer/0'
    } as unknown as __esri.Layer;
    component.element = {
      infos: [{ label: 'Reserved', src: 'baseball-icon', value: 'reserved' }]
    } as unknown as __esri.LegendElement;

    await component.ngOnInit();

    expect(component.showGroupHeader).toBe(false);
    expect(component.useGroupTitleLabel).toBe(true);
    expect(component.displayGroupTitle).toBe('Baseball Symbols');
  });
});
