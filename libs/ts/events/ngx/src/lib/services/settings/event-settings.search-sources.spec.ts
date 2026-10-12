import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import { EventSettingsService } from './event-settings.service';

/**
 * A map's own search sources are part of how its deep links resolve (#1481).
 *
 * The campus copy link was changed to emit `?bldg=1234` instead of the unreadable
 * `?feature=<layerId>:<objectId>`, and the link did not open anything. The resolver read only the
 * environment's search sources - College Station's - and a satellite campus declares its own on its
 * configuration, where nothing was looking. The link was emitted and never resolved: a dead link
 * that looked right.
 *
 * Exercised against the prototype rather than through the injector, because the method reads exactly
 * two things and standing up the service's dependencies would test the injector instead.
 */
const source = (name: string, param?: string): SearchSource =>
  ({ source: name, name, url: `https://example.test/${name}`, urlQueryParam: param }) as SearchSource;

const subjectWith = (own: SearchSource[] | undefined, environment: unknown) => {
  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService & {
    env: { value: (key: string) => unknown };
  };

  subject.env = { value: () => environment };
  (subject as unknown as { eventConfiguration: () => unknown }).eventConfiguration = () => ({
    configuration: own === undefined ? {} : { searchSources: own }
  });

  return subject;
};

describe('the search sources a deep link may be addressed by', () => {
  const campus = source('galveston-building', 'bldg');
  const appBuilding = source('building-exact', 'bldg');
  const appLot = source('parking-lot', 'lot');

  it("puts the map's own first, so a shared parameter matches the map that is open", () => {
    // `bldg` is declared by both. On a campus map it must be matched against that campus's fields,
    // not against College Station's, or it resolves to nothing.
    const sources = subjectWith([campus], [appBuilding, appLot]).configuredSearchSources();

    expect(sources.map((s) => s.source)).toEqual(['galveston-building', 'building-exact', 'parking-lot']);
  });

  it("keeps the application's sources for a map that declares none", () => {
    expect(subjectWith(undefined, [appBuilding, appLot]).configuredSearchSources().map((s) => s.source)).toEqual([
      'building-exact',
      'parking-lot'
    ]);
  });

  it('survives an environment that supplies no sources at all', () => {
    expect(subjectWith([campus], undefined).configuredSearchSources().map((s) => s.source)).toEqual([
      'galveston-building'
    ]);
    expect(subjectWith([campus], 'not an array').configuredSearchSources().map((s) => s.source)).toEqual([
      'galveston-building'
    ]);
    expect(subjectWith(undefined, undefined).configuredSearchSources()).toEqual([]);
  });
});
