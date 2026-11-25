import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { SidebarTripPlannerComponent } from './sidebar-trip-planner.component';

/**
 * The trip planner is offered on every environment (#2804).
 *
 * It was development-only, with a maintenance message elsewhere, while the routing network was published on the
 * development GIS server only (#683, #1003). With the network on production it is offered everywhere, and the message
 * is gone; whether development-only features are on must make no difference to it.
 */
describe('SidebarTripPlannerComponent', () => {
  async function render(isTesting: boolean): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        { provide: TestingService, useValue: { get: () => of(isTesting) } },
        // A trip has at least two points, so the planner starts with two empty stops.
        { provide: TripPlannerService, useValue: { Stops: of([{ index: 0 }, { index: 1 }]) } }
      ]
    });

    // The planner's own components are left as elements: what is asked here is which of the two this renders.
    TestBed.overrideComponent(SidebarTripPlannerComponent, {
      set: { imports: [RouterLink, AsyncPipe], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    });

    const fixture = TestBed.createComponent(SidebarTripPlannerComponent);
    fixture.detectChanges();

    // The planner is deferred out of the map's first download; load it as the browser would.
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }

    return fixture.nativeElement;
  }

  afterEach(() => TestBed.resetTestingModule());

  it.each([true, false])(
    'offers the from and to boxes and the travel modes, with development-only features on: %s',
    async (isTesting) => {
      const element = await render(isTesting);

      expect(element.querySelectorAll('tamu-gisc-search').length).toBe(2);
      expect(element.querySelector('tamu-gisc-trip-planner-mode-picker')).not.toBeNull();
      expect(element.querySelector('tamu-gisc-trip-planner-directions')).not.toBeNull();
      expect(element.querySelector('.maintenance-message')).toBeNull();
    }
  );

  // A tool for comparing routing networks, with nothing to choose where the application names one (#2804).
  it.each([
    [true, 1],
    [false, 0]
  ])('offers the network picker only where development-only features are on: %s', async (isTesting, pickers) => {
    const element = await render(isTesting);

    expect(element.querySelectorAll('tamu-gisc-trip-planner-connection-select').length).toBe(pickers);
  });
});
