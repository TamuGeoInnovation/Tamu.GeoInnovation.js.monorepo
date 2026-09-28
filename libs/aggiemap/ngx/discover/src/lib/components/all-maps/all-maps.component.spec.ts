import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { LastMapService } from '../../services/last-map/last-map.service';
import { AllMapsComponent } from './all-maps.component';

/**
 * Covers the two breadcrumb destinations on All Maps, which are different on purpose and were the
 * same by accident until #1066.
 *
 * - **"Aggie Map"** names a place, so it goes to the main map. It is what a desktop visitor sees.
 * - **The back crumb** returns to whichever map the visitor came from. It is hidden until the phone
 *   breakpoint, where the layout relabels it "< Back" and hides the rest of the trail.
 *
 * The query-string assertions were previously in `maps-page-header.component.spec.ts`, guarding the
 * fix in #1035. That header no longer carries a last-map link, so the cover moves here rather than
 * disappearing - the encoding trap it guards against is real and easy to reintroduce.
 *
 * `NO_ERRORS_SCHEMA` because this page renders several child components that are irrelevant to the
 * breadcrumb. It hides unknown-element errors, which is a real cost, accepted to keep this test
 * focused on the one thing it is about.
 */
describe('AllMapsComponent breadcrumbs', () => {
  let fixture: ComponentFixture<AllMapsComponent>;

  /**
   * Every method the component reaches for, returning nothing. The page's content is irrelevant here
   * -- this is about the breadcrumb -- but a missing method throws during `ngOnInit` and the
   * component never renders, which reads as a breadcrumb failure rather than a stub gap.
   */
  const discoveryStub = {
    getInternalDiscoverApplications: () => [],
    getVisibleInternalDiscoverApplications: () => [],
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => [],
    getKioskDiscoverApplications: () => [],
    getQuickLinkApplications: () => [],
    getParkingApplicationsByCategory: () => []
  };

  /** Only the members the template reads; typed loosely so unrelated additions do not break this. */
  const lastMapStub = (url: string) => ({
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
  });

  const build = async (lastMapUrl: string): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [AllMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(false) } },
        { provide: LastMapService, useValue: lastMapStub(lastMapUrl) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AllMapsComponent);
    fixture.detectChanges();
  };

  const backHref = (): string | null =>
    fixture.nativeElement.querySelector('.breadcrumbs p.breadcrumb-back a')?.getAttribute('href') ?? null;

  const namedCrumbHref = (): string | null => {
    const crumbs = [...fixture.nativeElement.querySelectorAll('.breadcrumbs > p:not(.breadcrumb-back) a')];

    return crumbs.find((a: Element) => a.textContent?.trim() === 'Aggie Map')?.getAttribute('href') ?? null;
  };

  afterEach(() => TestBed.resetTestingModule());

  it('sends the "Aggie Map" crumb to the main map, not to the last map', async () => {
    await build('/map/d/bus?busstop=4718');

    expect(namedCrumbHref()).toBe('/map');
  });

  it('sends the back crumb to the map the visitor came from', async () => {
    await build('/events/kickoff-at-kyle');

    expect(backHref()).toBe('/events/kickoff-at-kyle');
  });

  /**
   * Guards #1035. Binding a whole URL to `[routerLink]` makes Angular treat it as a path and
   * percent-encode the `?` and `=` into it, producing a link that routes nowhere.
   */
  it('keeps a query string on the back crumb rather than encoding it into the path', async () => {
    await build('/map/d/bus?busstop=4718');

    const href = backHref();

    expect(href).not.toContain('%3F');
    expect(href).toBe('/map/d/bus?busstop=4718');
  });

  it('preserves a fragment on the back crumb', async () => {
    await build('/map?foo=bar#section');

    expect(backHref()).toBe('/map?foo=bar#section');
  });
});
