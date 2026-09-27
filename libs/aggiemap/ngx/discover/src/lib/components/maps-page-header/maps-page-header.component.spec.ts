import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LastMapService } from '../../services/last-map/last-map.service';
import { MapsPageHeaderComponent } from './maps-page-header.component';

/** Host page the back link points at, standing in for whichever map the visitor came from. */
@Component({ selector: 'tamu-gisc-test-map', template: 'map' })
class TestMapComponent {}

/**
 * Regression cover for the "Aggie Map" back link.
 *
 * The link is built from the last map the visitor was on, and that URL can carry a query string --
 * a shared bus stop deep link (`/map/d/bus?busstop=4718`) being the case that exposed this. Binding
 * such a string straight to `[routerLink]` makes Angular treat the whole thing as a path and
 * percent-encode the `?` and `=` into it, producing `/map/d/bus%3Fbusstop%3D4718`, which routes
 * nowhere.
 */
describe('MapsPageHeaderComponent', () => {
  let fixture: ComponentFixture<MapsPageHeaderComponent>;

  const backLinkHref = (): string =>
    fixture.nativeElement.querySelector('.breadcrumbs p:first-child a').getAttribute('href');

  const withLastMap = async (url: string): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'map/d/bus', component: TestMapComponent },
          { path: 'map', component: TestMapComponent },
          { path: 'all-maps', component: TestMapComponent }
        ])
      ],
      declarations: [MapsPageHeaderComponent, TestMapComponent],
      // Stubbed rather than real: the service derives its value from router history, and this test
      // is about how the header renders that value, not about how it is captured.
      providers: [{ provide: LastMapService, useValue: lastMapStub(url) }]
    }).compileComponents();

    fixture = TestBed.createComponent(MapsPageHeaderComponent);
    fixture.componentInstance.title = 'Campus Events';
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('links back to a plain map url', async () => {
    await withLastMap('/map');

    expect(backLinkHref()).toBe('/map');
  });

  it('keeps a query string as a query string', async () => {
    await withLastMap('/map/d/bus?busstop=4718');

    const href = backLinkHref();

    // The defect: `%3F` in the path instead of a real query separator.
    expect(href).not.toContain('%3F');
    expect(href).toBe('/map/d/bus?busstop=4718');
  });

  it('preserves a fragment', async () => {
    await withLastMap('/map?foo=bar#section');

    expect(backLinkHref()).toBe('/map?foo=bar#section');
  });
});

/**
 * What the header actually reads off the service.
 *
 * Declared here rather than as `Partial<LastMapService>` so the stub is checked against the surface
 * the template consumes, and does not have to be revisited every time the service grows a member
 * unrelated to this component.
 */
interface LastMapLike {
  url: string;
  path: string;
  queryParams: Record<string, string>;
  fragment: string | undefined;
}

function lastMapStub(url: string): LastMapLike {
  return {
    get url(): string {
      return url;
    },
    get path(): string {
      return url.split(/[?#]/)[0];
    },
    get queryParams(): Record<string, string> {
      const query = url.split('#')[0].split('?')[1];

      return query ? Object.fromEntries(new URLSearchParams(query).entries()) : {};
    },
    get fragment(): string | undefined {
      return url.split('#')[1];
    }
  };
}
