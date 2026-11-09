import { InternalDiscoverApplication } from '../interfaces/discover-application.interface';

/**
 * Maps that are the main campus map opened on one of its own panels, listed like any other map (#2743).
 *
 * The main map's panels are routes already - `/map/d` is Features, `/map/d/trip` directions - so a map that is "the
 * main map with the bus panel open" is the route `/map/d/bus` and an entry here, not a definition. A definition would
 * restate the main map's whole layer set and drift from it.
 */
export const MainMapDiscoverApplications: InternalDiscoverApplication[] = [
  {
    id: 'bus-routes',
    name: 'Bus Routes',
    description: 'Every AggieSpirit route and its stops, on the campus map.',
    source: 'internal',
    type: 'main-map',
    route: ['/map', 'd', 'bus'],
    mapTypes: ['transportation'],
    // Development-only, as the Bus Routes panel is (`DEVELOPMENT_ONLY_SECTIONS`). Its service is public on production
    // since #2636, but moving bus routes there is the maintainer's decision (#1229). `visible: false` lists it where
    // development-only features are on, as for the development-only campuses.
    visible: false,
    keywords: ['bus', 'buses', 'aggiespirit', 'shuttle', 'transit', 'routes', 'stops']
  }
];
