import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlSegment, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ENDED_PATH, RetiredEventGuard } from './retired-event.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';

describe('RetiredEventGuard', () => {
  let guard: RetiredEventGuard;
  let router: Router;
  let eventSettingsService: { getEventDefinitionById: jest.Mock };

  beforeEach(() => {
    eventSettingsService = { getEventDefinitionById: jest.fn() };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RetiredEventGuard, { provide: EventSettingsService, useValue: eventSettingsService }]
    });

    guard = TestBed.inject(RetiredEventGuard);
    router = TestBed.inject(Router);
  });

  /** A child route of /events/<eventId>, such as `map` or `ended`. */
  function childOf(eventId: string, childPath: string): ActivatedRouteSnapshot {
    const eventRoute = {
      params: { eventId },
      url: [new UrlSegment(eventId, {})],
      pathFromRoot: [] as unknown[]
    };
    const root = { params: {}, url: [] };
    const section = { params: {}, url: [new UrlSegment('events', {})] };

    eventRoute.pathFromRoot = [root, section, eventRoute];

    return {
      routeConfig: { path: childPath },
      pathFromRoot: [root, section, eventRoute, { params: {}, url: [new UrlSegment(childPath, {})] }]
    } as unknown as ActivatedRouteSnapshot;
  }

  function whenEventIs(status: 'retired' | undefined): void {
    eventSettingsService.getEventDefinitionById.mockReturnValue({ discover: { status } });
  }

  it('sends a retired event to its ended page instead of its map', () => {
    whenEventIs('retired');

    const result = guard.canActivateChild(childOf('troubadour-festival-2025', 'map')) as UrlTree;

    expect(router.serializeUrl(result)).toBe(`/events/troubadour-festival-2025/${ENDED_PATH}`);
  });

  it('sends a retired event to its ended page instead of its builder', () => {
    whenEventIs('retired');

    const result = guard.canActivateChild(childOf('troubadour-festival-2025', 'builder')) as UrlTree;

    expect(router.serializeUrl(result)).toBe(`/events/troubadour-festival-2025/${ENDED_PATH}`);
  });

  it("lets a retired event's ended page through", () => {
    whenEventIs('retired');

    expect(guard.canActivateChild(childOf('troubadour-festival-2025', ENDED_PATH))).toBe(true);
  });

  it('lets a current event open its map', () => {
    whenEventIs(undefined);

    expect(guard.canActivateChild(childOf('kickoff-at-kyle', 'map'))).toBe(true);
  });

  it("sends a current event's ended page back to the event", () => {
    whenEventIs(undefined);

    const result = guard.canActivateChild(childOf('kickoff-at-kyle', ENDED_PATH)) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/events/kickoff-at-kyle');
  });
});
