import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LegendCollectionComponent } from './legend-collection.component';

describe('LegendCollectionComponent', () => {
  let component: LegendCollectionComponent;
  let fixture: ComponentFixture<LegendCollectionComponent>;

  /** The watches the fake reactiveUtils holds. `changed` runs them, as ArcGIS does after a change. */
  let watches: Array<() => void>;

  const changed = () => watches.forEach((watch) => watch());

  beforeEach(async () => {
    watches = [];

    const reactiveUtils = {
      watch: (getter: () => unknown, callback: () => void) => {
        const watch = () => {
          getter();
          callback();
        };

        watches.push(watch);

        return { remove: () => (watches = watches.filter((w) => w !== watch)) };
      }
    };

    await TestBed.configureTestingModule({
      imports: [LegendCollectionComponent],
      providers: [{ provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([reactiveUtils]) } }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles expanded state for groups with children', () => {
    fixture.componentRef.setInput('group', {
      title: 'Parent Group',
      children: [{ title: 'Child Group' }]
    } as unknown as __esri.ActiveLayerInfo);

    expect(component.hasChildren).toBe(true);
    expect(component.expanded).toBe(true);

    component.toggleExpanded();
    expect(component.expanded).toBe(false);

    component.toggleExpanded();
    expect(component.expanded).toBe(true);
  });

  it('toggles layer visibility', async () => {
    fixture.componentRef.setInput('group', {
      title: 'Parent Group',
      children: [{ title: 'Child Group' }],
      layer: { visible: true }
    } as unknown as __esri.ActiveLayerInfo);
    fixture.componentRef.setInput('allowVisibilityToggle', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isLayerVisible).toBe(true);
    expect(component.isExpanded).toBe(true);

    component.toggleExpanded();
    changed();
    expect(component.isLayerVisible).toBe(false);
    expect(component.isExpanded).toBe(false);
  });

  it('collapses when the layer is turned off elsewhere, such as in the layer list (#1673)', async () => {
    const layer = { visible: true };

    fixture.componentRef.setInput('group', {
      title: 'Parent Group',
      children: [],
      layer
    } as unknown as __esri.ActiveLayerInfo);
    fixture.componentRef.setInput('allowVisibilityToggle', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const content = () => (fixture.nativeElement as HTMLElement).querySelector('.collection-group-content');

    expect(content()).not.toBeNull();

    layer.visible = false;
    changed();
    fixture.detectChanges();

    expect(content()).toBeNull();
  });

  it('shows legend elements ArcGIS adds once the layer has drawn (#1673)', async () => {
    const group = { title: 'Buildings', children: [], legendElements: [] as unknown[], layer: { visible: true } };

    fixture.componentRef.setInput('group', group as unknown as __esri.ActiveLayerInfo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.legendElements).toHaveLength(0);

    group.legendElements = [{ type: 'symbol-table', infos: [] }];
    changed();

    expect(component.legendElements).toHaveLength(1);
  });

  it('hides duplicate sports safety-first child groups when parent legend elements already exist', () => {
    fixture.componentRef.setInput('group', {
      title: 'Safety First',
      children: [{ title: 'Safety First Child' }],
      legendElements: [
        { infos: [{ label: 'Please use marked crosswalks. No mid-street crossing.', value: 'safety-first' }] }
      ],
      layer: { id: 'volleyball-parking-safety-first' }
    } as unknown as __esri.ActiveLayerInfo);

    expect(component.visibleChildGroups).toEqual([]);
    expect(component.hasChildren).toBe(false);
  });

  it('keeps sports safety-first child groups when the parent has no legend elements', () => {
    fixture.componentRef.setInput('group', {
      title: 'Safety First',
      children: [{ title: 'Safety First Child' }],
      legendElements: [],
      layer: { id: 'volleyball-parking-safety-first' }
    } as unknown as __esri.ActiveLayerInfo);

    expect(component.visibleChildGroups).toHaveLength(1);
    expect(component.hasChildren).toBe(true);
  });

  /**
   * #2421: UES Operations' legend listed every layer, drawn or not. A legend without visibility toggles lists what the map
   * draws (#1871), but only its top-level layers were held to that; a group listed every child, switched on or off.
   */
  describe('the children of a group (#2421)', () => {
    const group = () =>
      ({
        title: 'Domestic Cold Water',
        layer: { id: 'domestic-cold-water', visible: true },
        children: [
          { title: 'Fire Hydrants', layer: { id: 'fire-hydrants', visible: true } },
          { title: 'Well Sites', layer: { id: 'well-sites', visible: false } }
        ]
      }) as unknown as __esri.ActiveLayerInfo;

    it('leaves out a child switched off, in a legend without visibility toggles', () => {
      fixture.componentRef.setInput('group', group());

      expect(component.visibleChildGroups.map((child) => child.title)).toEqual(['Fire Hydrants']);
    });

    it('keeps every child where the legend toggles them, so one switched off collapses rather than goes', () => {
      fixture.componentRef.setInput('group', group());
      fixture.componentRef.setInput('allowVisibilityToggle', true);

      expect(component.visibleChildGroups.map((child) => child.title)).toEqual(['Fire Hydrants', 'Well Sites']);
    });

    it('has nothing to list when every child is off', () => {
      const off = group();
      (off.children as unknown as Array<{ layer: { visible: boolean } }>).forEach((child) => (child.layer.visible = false));
      fixture.componentRef.setInput('group', off);

      expect(component.hasChildren).toBe(false);
    });
  });
});
