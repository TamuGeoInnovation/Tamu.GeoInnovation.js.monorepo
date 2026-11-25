// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import * as AprilRingDay from './april-ring-day.definitions';
import * as GraduationFall from './graduation-fall.definitions';
import * as GraduationSpring from './graduation-spring.definitions';
import * as NovemberRingDay from './november-ring-day.definitions';
import * as OctoberRingDay from './october-ring-day.definitions';

/**
 * The three Ring Day maps and the fall and spring commencement maps, exactly as they resolve (#2599).
 *
 * Each is built from one factory per family, so a new filter rule or popup change is made once. The snapshot was
 * taken from the five hand-written files on `development` before they were refactored, and every export the
 * library publishes is compared with it: the configuration, the builder's options and their date filters, the
 * layers and their popups, and what the Campus Maps page lists. A change here is a change to a map, not a tidy-up.
 */
describe.each([
  ['October Ring Day', OctoberRingDay],
  ['November Ring Day', NovemberRingDay],
  ['April Ring Day', AprilRingDay],
  ['Fall Commencement', GraduationFall],
  ['Spring Commencement', GraduationSpring]
])('%s', (_name, exports) => {
  it.each(Object.keys(exports).sort())('exports %s as it always has', (key) => {
    expect((exports as Record<string, unknown>)[key]).toMatchSnapshot();
  });
});
