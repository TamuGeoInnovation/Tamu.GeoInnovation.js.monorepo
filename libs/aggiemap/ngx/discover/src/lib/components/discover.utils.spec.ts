import { InternalDiscoverApplication } from '../interfaces/discover-application.interface';
import { buildApplicationColumns, buildNamedApplicationColumns, getApplicationRoute } from './discover.utils';
import { DiscoveryService } from '../services/discovery/discovery.service';

describe('discover utils', () => {
  it('balances columns when no named columns are configured', () => {
    const applications = createApps(['a', 'b', 'c', 'd', 'e']);

    const columns = buildApplicationColumns(applications, 3);

    expect(columns.map((column) => column.length)).toEqual([2, 2, 1]);
  });

  it('falls back to the first named column when a map has no matching column key', () => {
    const applications = createApps(['a', 'b', 'c']);

    applications[0].columnKey = 'general';
    applications[1].columnKey = 'unknown';

    const columns = buildNamedApplicationColumns(applications, [
      { id: 'general', heading: 'General Parking' },
      { id: 'permit', heading: 'Permit Parking' }
    ]);

    expect(columns[0].applications.map((app) => app.id)).toEqual(['a', 'b', 'c']);
    expect(columns[1].applications).toEqual([]);
  });
});

function createApps(ids: string[]): InternalDiscoverApplication[] {
  return ids.map((id) => ({
    id,
    name: id.toUpperCase(),
    description: '',
    source: 'internal' as const,
    type: 'event' as const,
    mapTypes: ['campus'],
    configuration: {
      id,
      name: id.toUpperCase(),
      applicationName: id.toUpperCase(),
      shortApplicationName: id.toUpperCase(),
      eventDates: []
    },
    labels: [],
    keywords: [],
    visible: true
  }));
}

/** A link in All Maps goes where the map's own route would send it, so a listing and its address agree (#2767). */
describe('getApplicationRoute', () => {
  const listings = new DiscoveryService().getInternalDiscoverApplications();
  const routeOf = (id: string) => getApplicationRoute(listings.find((app) => app.id === id) as InternalDiscoverApplication);

  it('links a map listed under Transportation at /transportation', () => {
    expect(routeOf('micromobility')).toEqual(['/transportation', 'micromobility']);
    expect(routeOf('sustainable-transportation')).toEqual(['/transportation', 'sustainable-transportation']);
  });

  it('leaves a parking map at /parking', () => {
    expect(routeOf('visitor-parking')).toEqual(['/parking', 'visitor-parking']);
  });
});
