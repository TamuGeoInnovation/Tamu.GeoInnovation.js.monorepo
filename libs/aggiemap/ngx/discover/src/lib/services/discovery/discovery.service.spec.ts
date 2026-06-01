import { TestBed } from '@angular/core/testing';

import { DiscoveryService } from './discovery.service';

describe('DiscoveryService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscoveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
    const football = applications.find((app) => app.id === 'football-parking');
    const moveIn = applications.find((app) => app.id === 'move-in');

    expect(football?.mapType).toBe('athletics');
    expect(moveIn?.mapType).toBe('campus');
  });

  it('supports explicit discover tab overrides for operations maps', () => {
    const applications = service.getInternalDiscoverApplications();
    const constructionMap = applications.find((app) => app.id === 'construction-map');

    expect(constructionMap?.mapType).toBe('operations');
  });
});
