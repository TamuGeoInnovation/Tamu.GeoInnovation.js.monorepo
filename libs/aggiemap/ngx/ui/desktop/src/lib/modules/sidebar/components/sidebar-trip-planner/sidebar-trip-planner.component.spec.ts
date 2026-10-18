import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { SidebarTripPlannerComponent } from './sidebar-trip-planner.component';

/**
 * The trip planner is offered on a development host and the maintenance message everywhere else.
 *
 * Routing has no production service, so since #683 the planner had been commented out on every host. It is
 * back where `TestingService` says this is a development host, so its components can be tested, and production
 * (or a development host with `?as=production`, #1722) still shows the message.
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

  it('offers the from and to boxes and the travel modes on a development host', async () => {
    const element = await render(true);

    expect(element.querySelectorAll('tamu-gisc-search').length).toBe(2);
    expect(element.querySelector('tamu-gisc-trip-planner-mode-picker')).not.toBeNull();
    expect(element.querySelector('tamu-gisc-trip-planner-directions')).not.toBeNull();
    expect(element.querySelector('.maintenance-message')).toBeNull();
  });

  it('shows the maintenance message, and none of the planner, elsewhere', async () => {
    const element = await render(false);

    expect(element.querySelector('.maintenance-message')?.textContent).toContain('undergoing maintenance');
    expect(element.querySelector('tamu-gisc-search')).toBeNull();
    expect(element.querySelector('tamu-gisc-trip-planner-mode-picker')).toBeNull();
  });
});
