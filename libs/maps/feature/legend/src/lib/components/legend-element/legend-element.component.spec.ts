import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LegendElementComponent } from './legend-element.component';
import { getDefaultGisHosts } from '@tamu-gisc/aggiemap/ngx/common';

const tsgisHost = getDefaultGisHosts().tsgisHost;

describe('LegendElementComponent', () => {
  let component: LegendElementComponent;
  let fixture: ComponentFixture<LegendElementComponent>;

  beforeEach(async () => {
    const spy = {
      require: jest.fn()
    };

    // Ensure tsgisHost is available in tests that reference TS URLs

    await TestBed.configureTestingModule({
      declarations: [LegendElementComponent],
        providers: [
          { provide: EsriModuleProviderService, useValue: spy },
          // LegendElementComponent pulls in LayerSourcesService, which injects
          // EnvironmentService. Mocked directly rather than importing EnvironmentModule,
          // matching the pattern already used in layer-sources.service.spec.ts.
          { provide: EnvironmentService, useValue: { value: jest.fn().mockReturnValue([]) } }
        ]
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
      url: `https://${tsgisHost}/arcgis/rest/services/TS/BaseballParking/MapServer/0`
    } as unknown as __esri.Layer;
    component.element = {
      infos: [{ label: 'Reserved', src: 'baseball-icon', value: 'reserved' }]
    } as unknown as __esri.LegendElement;

    await component.ngOnInit();

    expect(component.showGroupHeader).toBe(false);
    expect(component.useGroupTitleLabel).toBe(true);
    expect(component.displayGroupTitle).toBe('Baseball Symbols');
  });

  it('lists the classes of a unique value group, as ArcGIS Pro publishes them', async () => {
    // A unique value renderer published from ArcGIS Pro carries `uniqueValueGroups`, headed by the
    // field name. The legend view model nests its classes one level down, under that heading.
    component.groupTitle = 'West Campus Tailgating';
    component.element = {
      type: 'symbol-table',
      infos: [
        {
          type: 'symbol-table',
          title: 'type',
          infos: [
            { label: 'Lot E Tailgating', src: 'lot-e', value: 'Lot E Tailgating' },
            { label: 'Open Access', src: 'open-access', value: 'Open Access' }
          ]
        }
      ]
    } as unknown as __esri.LegendElement;

    await component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;

    expect(text).not.toContain('Unsupported legend element type');
    expect(text).toContain('Lot E Tailgating');
    expect(text).toContain('Open Access');
    // The layer's title belongs to the collection header above; it is not a class of its own.
    expect(text).not.toContain('West Campus Tailgating');
  });
});
