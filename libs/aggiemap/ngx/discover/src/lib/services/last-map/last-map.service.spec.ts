import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LastMapService } from './last-map.service';

@Component({ selector: 'tamu-gisc-test-page', template: 'page' })
class TestPageComponent {}

/**
 * Covers the split of the remembered URL into the parts `routerLink` needs.
 *
 * `MapsPageHeaderComponent`'s spec stubs this service, so without these the real parsing would go
 * unexercised -- which is how the percent-encoded back link reached production in the first place.
 */
describe('LastMapService', () => {
  let service: LastMapService;
  let router: Router;

  beforeEach(async () => {
    // Shared across tests in a browser environment, so a URL remembered by one test would otherwise
    // become the starting state of the next.
    window.sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'map', component: TestPageComponent },
          { path: 'map/d/bus', component: TestPageComponent },
          { path: 'all-maps', component: TestPageComponent }
        ])
      ],
      declarations: [TestPageComponent]
    }).compileComponents();

    router = TestBed.inject(Router);
    service = TestBed.inject(LastMapService);
  });

  afterEach(() => {
    window.sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('defaults to the main campus map', () => {
    expect(service.url).toBe('/map');
    expect(service.path).toBe('/map');
    expect(service.queryParams).toEqual({});
    expect(service.fragment).toBeUndefined();
  });

  it('splits a remembered query string away from the path', async () => {
    await router.navigateByUrl('/map/d/bus?busstop=4718');

    expect(service.url).toBe('/map/d/bus?busstop=4718');
    expect(service.path).toBe('/map/d/bus');
    expect(service.queryParams).toEqual({ busstop: '4718' });
  });

  it('keeps a fragment out of the path', async () => {
    await router.navigateByUrl('/map#north');

    expect(service.path).toBe('/map');
    expect(service.fragment).toBe('north');
  });

  it('does not remember pages that are not maps', async () => {
    await router.navigateByUrl('/map/d/bus?busstop=4718');
    await router.navigateByUrl('/all-maps');

    // All Maps is a page about the maps, so the back link must still point at the bus map.
    expect(service.path).toBe('/map/d/bus');
    expect(service.queryParams).toEqual({ busstop: '4718' });
  });,
  standalone: false
});
