import { DCBushSchoolTs } from './dc-bush-school.definitions';
import { GalvestonTs } from './galveston.definitions';
import { McAllenTs } from './mcallen.definitions';

/**
 * The Washington DC, Galveston and McAllen maps under Texas A&M's new naming for its remote campuses (#3161), in the
 * issue's own words.
 *
 * The sidebar's heading is the configuration's `applicationName` (`sidebar-reference.component.html`), and the Campus
 * Maps page's line under each map is its `discover.description`. Nothing else is renamed: the ids are in every shared
 * link and saved setting, so they stay exactly as they were.
 */
describe('the remote campus maps are named as Texas A&M now names them (#3161)', () => {
  it.each([
    ['Washington DC Campus', DCBushSchoolTs],
    ['Galveston Campus', GalvestonTs],
    ['McAllen Campus', McAllenTs]
  ])('heads the map with "%s" in its sidebar', (title, map) => {
    expect(map.configuration.applicationName).toBe(title);
  });

  it('describes each on the Campus Maps page as the issue gives it, Galveston unchanged', () => {
    expect(DCBushSchoolTs.discover?.description).toBe('Map of the Texas A&M University at Washington, DC campus.');
    expect(McAllenTs.discover?.description).toBe('Map of the Texas A&M University at McAllen campus.');
    expect(GalvestonTs.discover?.description).toBe('Map of the Texas A&M University at Galveston campus.');
  });

  it('keeps every id, so shared links and saved settings still open the same maps', () => {
    expect([DCBushSchoolTs, GalvestonTs, McAllenTs].map((map) => map.configuration.id)).toEqual([
      'dc-bush-school',
      'galveston',
      'mcallen'
    ]);
    expect([DCBushSchoolTs, GalvestonTs, McAllenTs].map((map) => map.discover?.id)).toEqual([
      'dc-bush-school',
      'galveston',
      'mcallen'
    ]);
  });
});
