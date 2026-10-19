import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { env } from '@tamu-gisc/common/ngx/environment';

import { EsriMapService } from '../../services/map/map.service';
import { EsriMapComponent } from './esri-map.component';

// Esri's elements are stood in for below; their definitions are not loaded.
vi.mock('@arcgis/map-components/components/arcgis-map', () => ({}));
vi.mock('@arcgis/map-components/components/arcgis-zoom', () => ({}));
vi.mock('@arcgis/map-components/components/arcgis-track', () => ({}));
vi.mock('@arcgis/map-components/components/arcgis-scene', () => ({}));
vi.mock('@arcgis/map-components/components/arcgis-navigation-toggle', () => ({}));
vi.mock('@arcgis/map-components/components/arcgis-compass', () => ({}));

/**
 * Stands in for `<arcgis-map>` and `<arcgis-scene>`: a view made with the element, and what was set on it
 * by the time the element finished loading.
 */
class FakeViewElement extends HTMLElement {
  public view: Record<string, unknown> = {
    type: this.localName === 'arcgis-scene' ? '3d' : '2d',
    set(properties: Record<string, unknown>) {
      Object.assign(this, properties);
    }
  };
  public setWhenReady: Record<string, unknown> | undefined;

  public componentOnReady(): Promise<void> {
    this.setWhenReady = {
      center: this.view['center'],
      zoom: this.view['zoom'],
      map: this['map'],
      viewingMode: this.view['viewingMode']
    };

    return Promise.resolve();
  }
}

if (!customElements.get('arcgis-map')) {
  customElements.define('arcgis-map', class extends FakeViewElement {});
  customElements.define('arcgis-scene', class extends FakeViewElement {});
}

/** Lets the dynamic imports, the render and the elements' loading settle. */
async function settle(fixture: { whenStable(): Promise<unknown> }) {
  for (let i = 0; i < 5; i++) {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

/** A map hosted by Esri's elements (#1949). */
describe('EsriMapComponent', () => {
  const map = { id: 'the map' };
  let service: EsriMapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: env, useValue: { SearchSources: [], LayerSources: [] } }],
      imports: [EsriMapComponent, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents();

    service = TestBed.inject(EsriMapService);
    vi.spyOn(service, 'makeMap').mockResolvedValue(map as unknown as __esri.Map);
    vi.spyOn(service, 'useView').mockResolvedValue(undefined);
  });

  function create(zoom = true) {
    const fixture = TestBed.createComponent(EsriMapComponent);

    fixture.componentRef.setInput('config', {
      basemap: { basemap: 'the basemap' },
      view: { properties: { center: [-96.34, 30.61], zoom: 16, map: undefined } }
    });
    fixture.componentRef.setInput('zoom', zoom);
    fixture.detectChanges();

    return fixture;
  }

  const element = (host: HTMLElement, tag: string) => host.querySelector(tag) as FakeViewElement | null;

  it('should error on missing config', () => {
    const fixture = TestBed.createComponent(EsriMapComponent);

    expect(() => fixture.componentInstance.ngOnInit()).toThrow(new Error('Incorrectly formed configuration provided.'));
  });

  it("makes the page's map and draws <arcgis-map> with it, its view starting where the page asked", async () => {
    const fixture = create();

    await settle(fixture);

    const flat = element(fixture.nativeElement, 'arcgis-map');

    expect(service.makeMap).toHaveBeenCalledWith({ basemap: 'the basemap' });
    // Set before the element finished loading, so its view is made with them.
    expect(flat.setWhenReady).toEqual({ center: [-96.34, 30.61], zoom: 16, map, viewingMode: undefined });
    expect(service.useView).toHaveBeenCalledWith(flat.view, fixture.componentInstance);
  });

  it('puts zoom buttons at the top left unless the page turns them off', async () => {
    const withZoom = create();

    await settle(withZoom);

    expect(withZoom.nativeElement.querySelector('arcgis-map > arcgis-zoom[slot="top-left"]')).not.toBeNull();

    const without = create(false);

    await settle(without);

    expect(without.nativeElement.querySelector('arcgis-map > arcgis-zoom')).toBeNull();
  });

  it('draws the scene only when asked for, and shows one view at a time', async () => {
    const fixture = create();

    await settle(fixture);

    expect(element(fixture.nativeElement, 'arcgis-scene')).toBeNull();

    const asked = fixture.componentInstance.sceneView({ viewingMode: 'global' });

    await settle(fixture);

    const scene = await asked;
    const globe = element(fixture.nativeElement, 'arcgis-scene');
    const flat = element(fixture.nativeElement, 'arcgis-map');

    expect(scene).toBe(globe.view);
    expect(globe.setWhenReady.viewingMode).toBe('global');
    expect(globe.querySelectorAll('[slot="top-left"]').length).toBe(3);

    fixture.componentInstance.show(scene);
    await settle(fixture);

    expect(globe.classList.contains('inactive')).toBe(false);
    expect(flat.classList.contains('inactive')).toBe(true);

    fixture.componentInstance.show(flat.view as unknown as __esri.MapView);
    await settle(fixture);

    expect(globe.classList.contains('inactive')).toBe(true);
    expect(flat.classList.contains('inactive')).toBe(false);
  });
});
