import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

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

  it('keeps shared mobility entries separate while combining regular bike racks', async () => {
    component.groupTitle = 'Bike Racks';
    component.layer = {
      id: 'bike-racks-map-layer',
      url: 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BikeMap/MapServer/0'
    } as unknown as __esri.Layer;
    component.element = {
      type: 'symbol-table',
      infos: [
        {
          type: 'symbol-table',
          title: 'Shared Mobility',
          infos: [
            { label: 'Hub Corral', src: 'red-icon', value: 'hub' },
            { label: 'Shared Mobility Racks', src: 'teal-icon', value: 'shared' }
          ]
        },
        {
          type: 'symbol-table',
          title: 'Regular Bike Racks',
          infos: [
            { label: 'Coat Hanger', src: 'blue-icon', value: 'coat' },
            { label: 'DP', src: 'blue-icon', value: 'dp' }
          ]
        }
      ]
    } as unknown as __esri.LegendElement;

    await component.ngOnInit();

    const infos = await firstValueFrom(component.infos);

    expect(component.showGroupHeader).toBe(false);
    expect(component.useGroupTitleLabel).toBe(false);
    expect(infos).toHaveLength(3);
    expect(infos.map((info) => (info as { label?: string }).label)).toEqual([
      'Hub Corral',
      'Shared Mobility Racks',
      'Bike Racks'
    ]);
    expect((infos[0] as { src?: string }).src).toBe('red-icon');
    expect((infos[1] as { src?: string }).src).toBe('teal-icon');
    expect((infos[2] as { src?: string }).src).toBe('blue-icon');
  });
});
