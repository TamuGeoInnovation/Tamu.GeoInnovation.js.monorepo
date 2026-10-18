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
      imports: [LegendElementComponent],
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
    fixture.componentRef.setInput('element', { type: 'symbol-table', infos: [] } as unknown as __esri.LegendElement);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles expanded state when legend element is grouped', () => {
    fixture.componentRef.setInput('element', {
      infos: [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' }
      ]
    } as unknown as __esri.LegendElement);

    expect(component.showGroupHeader).toBe(true);
    expect(component.expanded).toBe(true);

    component.toggleExpanded();
    expect(component.expanded).toBe(false);
  });

  it('uses the group title label for non-bike single-entry legend elements', async () => {
    fixture.componentRef.setInput('groupTitle', 'Baseball Symbols');
    fixture.componentRef.setInput('layer', {
      id: 'baseball-event-symbols',
      url: `https://${tsgisHost}/arcgis/rest/services/TS/BaseballParking/MapServer/0`
    } as unknown as __esri.Layer);
    fixture.componentRef.setInput('element', {
      infos: [{ label: 'Reserved', src: 'baseball-icon', value: 'reserved' }]
    } as unknown as __esri.LegendElement);

    // Setting the element is enough: the component reads it whenever it is replaced (#1721).
    fixture.detectChanges();

    expect(component.showGroupHeader).toBe(false);
    expect(component.useGroupTitleLabel).toBe(true);
    expect(component.displayGroupTitle).toBe('Baseball Symbols');
  });

  it('lists the classes of a unique value group, as ArcGIS Pro publishes them', async () => {
    // A unique value renderer published from ArcGIS Pro carries `uniqueValueGroups`, headed by the
    // field name. The legend view model nests its classes one level down, under that heading.
    fixture.componentRef.setInput('groupTitle', 'West Campus Tailgating');
    fixture.componentRef.setInput('element', {
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
    } as unknown as __esri.LegendElement);

    // Setting the element is enough: the component reads it whenever it is replaced (#1721).
    fixture.detectChanges();
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

  it('redraws its symbol when the layer is given a new legend element (#1721)', async () => {
    // A hosted layer loads with the symbol its service publishes and is then given the one its portal
    // item publishes (#1497), and ArcGIS replaces the layer's legend element when that happens. The two
    // elements carry the same label and value, so the list keeps this component and hands it the new
    // element. It used to read its element once, on creation, and went on showing the first symbol:
    // the Football micromobility legend showed Entry Routes as a 15-point bar, the service's flattened
    // symbol, beside a map drawing a thin line with an arrowhead.
    const entry = (src: string) =>
      ({ type: 'symbol-table', infos: [{ label: 'Entry Routes', src }] }) as unknown as __esri.LegendElement;

    fixture.componentRef.setInput('element', entry('service-symbol.png'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const shown = () => (fixture.nativeElement as HTMLElement).querySelector('img')?.getAttribute('src');

    expect(shown()).toBe('service-symbol.png');

    fixture.componentRef.setInput('element', entry('portal-symbol.png'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(shown()).toBe('portal-symbol.png');
  });

  it('marks a symbol as a swatch that keeps its size, and a nested group as free to shrink (#1804)', async () => {
    // The stylesheet stops a .swatch from shrinking, so a long label wraps instead of squeezing its
    // symbol to a sliver. A row of nested elements must still shrink, or its labels could not wrap.
    fixture.componentRef.setInput('element', {
      type: 'symbol-table',
      infos: [
        { label: '$5 Event Parking, Any Valid Texas A&M Permit, Baseball Season Permit', src: 'lot.png' },
        { type: 'symbol-table', title: 'type', infos: [{ label: 'Open Access', src: 'open.png' }] }
      ]
    } as unknown as __esri.LegendElement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // The first group in document order is this element's own; the nested group's rows sit inside it.
    const group = (fixture.nativeElement as HTMLElement).querySelector('.element-group') as HTMLElement;
    const rows = Array.from(group.children).filter((child) => child.classList.contains('legend-info'));
    const wrapper = (row: Element) => row.firstElementChild as HTMLElement;

    expect(rows).toHaveLength(2);
    expect(wrapper(rows[0]).classList).toContain('swatch');
    expect(wrapper(rows[1]).classList).not.toContain('swatch');
  });
});
