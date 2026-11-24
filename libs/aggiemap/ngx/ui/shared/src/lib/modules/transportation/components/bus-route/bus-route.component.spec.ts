import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, PRIMARY_OUTLET, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';

import { BusRouteComponent } from './bus-route.component';

/**
 * Tapping a bus route in the list opens its timetable (#3150).
 *
 * On a phone the list is drawn in the secondary `outlet-2`, under `bus`. A route's timetable is `bus/:route` in the
 * primary outlet, so the route's name has to be resolved from `bus` itself. Resolved from the list's own place inside
 * `outlet-2`, it matched nothing, and Angular said nothing: the tap did nothing at all (the trap of #2641). On a desktop
 * the list is in the primary outlet already, and the same navigation is unchanged.
 */
describe('BusRouteComponent', () => {
  const ROUTE = { ShortName: '01', Name: 'Made-up loop' } as unknown as TSRoute;

  let navigate: ReturnType<typeof vi.fn>;

  function tap(activatedRoute: Partial<ActivatedRoute>) {
    navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: BusService, useValue: { toggleMapRoute: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: new Subject() } }
      ]
    }).overrideTemplate(BusRouteComponent, '');

    const fixture = TestBed.createComponent(BusRouteComponent);
    fixture.componentRef.setInput('route', ROUTE);
    fixture.componentRef.setInput('selection', 'route');
    fixture.componentInstance.toggleRoute();
  }

  it("opens the route's timetable from a phone, where the list is in outlet-2 under bus", () => {
    const bus = { outlet: PRIMARY_OUTLET, parent: null } as unknown as ActivatedRoute;

    tap({ outlet: 'outlet-2', parent: bus });

    expect(navigate).toHaveBeenCalledWith(['01'], { relativeTo: bus });
  });

  it('opens it as before on a desktop, where the list is in the primary outlet', () => {
    const list = { outlet: PRIMARY_OUTLET, parent: null } as unknown as ActivatedRoute;

    tap(list);

    expect(navigate).toHaveBeenCalledWith(['01'], { relativeTo: list });
  });
});
