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
 * The Code Maroon tile is a development-only entry point to an unfinished proof of concept (#1289).
 *
 * Production must not show it. An emergency feature that a visitor can reach before it is ready is a
 * worse failure than most - the subject makes a half-built thing actively misleading rather than
 * merely unpolished. The gate is one `*ngIf` in a template, which is exactly the kind of thing a
 * later edit removes without anyone noticing, so it is pinned here.
 */
describe('the Code Maroon tile on All Maps', () => {
  let fixture: ComponentFixture<AllMapsComponent>;

  const discoveryStub = {
    getInternalDiscoverApplications: () => [],
    getVisibleInternalDiscoverApplications: () => [],
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => [],
    getKioskDiscoverApplications: () => [],
    getQuickLinkApplications: () => [],
    getUpcomingApplications: () => [],
    getEarliestUpcomingDate: () => undefined,
    getParkingApplicationsByCategory: () => []
  };
  const build = async (isDevelopment: boolean): Promise<void> => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
    providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(isDevelopment) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
    ],
    schemas: [NO_ERRORS_SCHEMA]
}).compileComponents();

    fixture = TestBed.createComponent(AllMapsComponent);
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  const tile = (): Element | undefined =>
    [...fixture.nativeElement.querySelectorAll('.visit-maps-tile')].find((element: Element) =>
      element.textContent?.includes('Code Maroon')
    );

  it('is not on the page on production', async () => {
    await build(false);

    expect(tile()).toBeUndefined();
  });

  it('is on the page in development', async () => {
    await build(true);

    expect(tile()).toBeDefined();
  });

  it('opens the Code Maroon route', async () => {
    await build(true);

    expect(tile()?.getAttribute('href')).toBe('/code-maroon');
  });

  it('is named for someone who cannot see the icon', async () => {
    await build(true);

    expect(tile()?.getAttribute('aria-label')).toBe('Code Maroon');
  });

  it('is built like every other tile, so it behaves like them on a phone', async () => {
    // The row wraps on a phone and the tiles share their sizing through this class. A tile built
    // differently would sit oddly in that wrap rather than looking like one of the set.
    await build(true);

    const element = tile();

    expect(element?.classList.contains('visit-maps-tile')).toBe(true);
    expect(element?.querySelector('.visit-maps-icon svg')).not.toBeNull();
    expect(element?.querySelector('.visit-maps-label')?.textContent?.trim()).toBe('Code Maroon');
  });
});
