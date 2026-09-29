import { TestBed } from '@angular/core/testing';

import { EventConfiguration } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService } from './discovery.service';

describe('DiscoveryService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    // DiscoveryService takes no constructor dependencies, so an empty testing module is all
    // `inject` needs. Anything added to the service later has to be provided here.
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscoveryService);
  });

  it('defaults standard event maps to the campus tab', () => {
    const applications = service.getInternalDiscoverApplications();
    const aggielandSaturday = applications.find((app) => app.id === 'aggieland-saturday');

    expect(aggielandSaturday?.mapTypes).toEqual(['campus']);
  });

  it('keeps general parking maps in the parking tab', () => {
    const applications = service.getInternalDiscoverApplications();
    const accessibleParking = applications.find((app) => app.id === 'accessible-parking');

    expect(accessibleParking?.mapTypes).toEqual(['parking']);
  });

  it('supports explicit discover tab overrides for athletics and campus parking maps', () => {
    const applications = service.getInternalDiscoverApplications();
    // The football event's discover id is 'gameday-parking' (FootballParkingConfiguration.id),
    // not 'football-parking'. The old id made `find` return undefined, so the assertion
    // below compared undefined against 'athletics' rather than checking the override.
    const football = applications.find((app) => app.id === 'gameday-parking');
    const moveIn = applications.find((app) => app.id === 'move-in');

    expect(football?.mapTypes).toEqual(['athletics']);
    expect(moveIn?.mapTypes).toEqual(['campus']);
  });

  it('lists a map on every page named in mapTypes', () => {
    const applications = service.getInternalDiscoverApplications();
    const kickoffAtKyle = applications.find((app) => app.id === 'kickoff-at-kyle');

    // The 150th maps belong on Campus Events and on the anniversary page. Declaring the second
    // must not cost them the first, which is what a single `mapType` would have done.
    expect(kickoffAtKyle?.mapTypes).toEqual(['campus', '150']);
  });

  it('supports explicit discover tab overrides for operations maps', () => {
    const applications = service.getInternalDiscoverApplications();
    const constructionMap = applications.find((app) => app.id === 'construction-map');

    expect(constructionMap?.mapTypes).toEqual(['operations']);
  });

  it('treats visible maps as public by default', () => {
    const applications = service.getInternalDiscoverApplications();
    const aggielandSaturday = applications.find((app) => app.id === 'aggieland-saturday');

    expect(aggielandSaturday?.visible).toBe(true);
  });

  it('does not list retired maps anywhere, including the development-only lists', () => {
    // Events that are over are marked `status: 'retired'` (#1098). Their definitions stay so old
    // links still resolve, but no list offers them, on any environment: `visible: false` only hid
    // them from production, so dev kept listing and testing them every night.
    const retired = [
      'savannah-bananas-parking',
      'softball-regionals-2025',
      'troubadour-festival-2025',
      'argentina-vs-honduras-2026'
    ];
    const listed = service.getAllDiscoverApplications().map((app) => app.id);

    expect(listed.filter((id) => retired.includes(id))).toEqual([]);
  });

  it('filters hidden maps from the public discover lists', () => {
    const visibleApp = createDiscoverApplication({ id: 'visible', showInQuickLinks: true });
    const hiddenApp = createDiscoverApplication({ id: 'hidden', visible: false, showInQuickLinks: true });

    jest.spyOn(service, 'getInternalDiscoverApplications').mockReturnValue([visibleApp, hiddenApp]);

    expect(service.getVisibleInternalDiscoverApplications()).toEqual([visibleApp]);
    expect(service.getQuickLinkApplications()).toEqual([visibleApp]);
  });
});

function createDiscoverApplication(overrides: Partial<InternalDiscoverApplication> = {}): InternalDiscoverApplication {
  const configuration: EventConfiguration = {
    id: overrides.id ?? 'test-map',
    name: overrides.name ?? 'Test Map',
    applicationName: 'Test Application',
    shortApplicationName: 'Test App',
    eventDates: []
  };

  return {
    id: 'test-map',
    name: 'Test Map',
    description: '',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    configuration,
    ...overrides
  };
}
