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

    expect(aggielandSaturday?.mapType).toBe('campus');
  });

  it('keeps general parking maps in the parking tab', () => {
    const applications = service.getInternalDiscoverApplications();
    const accessibleParking = applications.find((app) => app.id === 'accessible-parking');

    expect(accessibleParking?.mapType).toBe('parking');
  });

  it('supports explicit discover tab overrides for athletics and campus parking maps', () => {
    const applications = service.getInternalDiscoverApplications();
    // The football event's discover id is 'gameday-parking' (FootballParkingConfiguration.id),
    // not 'football-parking'. The old id made `find` return undefined, so the assertion
    // below compared undefined against 'athletics' rather than checking the override.
    const football = applications.find((app) => app.id === 'gameday-parking');
    const moveIn = applications.find((app) => app.id === 'move-in');

    expect(football?.mapType).toBe('athletics');
    expect(moveIn?.mapType).toBe('campus');
  });

  it('supports explicit discover tab overrides for operations maps', () => {
    const applications = service.getInternalDiscoverApplications();
    const constructionMap = applications.find((app) => app.id === 'construction-map');

    expect(constructionMap?.mapType).toBe('operations');
  });

  it('treats visible maps as public by default', () => {
    const applications = service.getInternalDiscoverApplications();
    const aggielandSaturday = applications.find((app) => app.id === 'aggieland-saturday');

    expect(aggielandSaturday?.visible).toBe(true);
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
