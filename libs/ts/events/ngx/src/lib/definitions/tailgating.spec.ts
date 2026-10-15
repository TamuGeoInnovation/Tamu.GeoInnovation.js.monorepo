import { TailgatingConfiguration } from './tailgating.definitions';

/**
 * What the Football Tailgating map's sidebar search finds: its tents and named areas, alongside the
 * usual buildings and parking rather than instead of them.
 */
describe('Football Tailgating search', () => {
  const active = (TailgatingConfiguration.searchSources ?? []).filter((source) => source.searchActive);
  const keysOf = (source: (typeof active)[number]) => source.queryParams?.where?.keys ?? [];

  it('keeps the campus search sources', () => {
    expect(TailgatingConfiguration.searchSourcesWithCampus).toBe(true);
  });

  it('finds tents by their id, on both tent layers', () => {
    const tents = active.filter((source) => keysOf(source).includes('tent_id'));

    expect(tents.map((source) => source.url.split('/').pop())).toEqual(['1', '2']);
  });

  it('finds the named areas by name or zone id, in Aggie Park and on West Campus', () => {
    const areas = active.filter((source) => keysOf(source).includes('name') && keysOf(source).includes('zone_ID'));

    expect(areas.map((source) => source.url.split('/').pop()).sort()).toEqual(['3', '4']);
  });

  it('matches what is typed anywhere in a field, ignoring case', () => {
    for (const source of active) {
      const where = source.queryParams?.where;

      expect(where?.operators?.every((operator) => operator === 'LIKE')).toBe(true);
      expect(where?.wildcards?.every((wildcard) => wildcard === 'includes')).toBe(true);
      expect(where?.transformations?.every((transformation) => transformation === 'UPPER')).toBe(true);
    }
  });

  it('keeps exact matching for the ?zone= and ?tent= links, which are not searched themselves', () => {
    const links = (TailgatingConfiguration.searchSources ?? []).filter((source) => source.urlQueryParam);

    expect(links.map((source) => source.urlQueryParam)).toEqual(['zone', 'tent']);
    expect(links.every((source) => !source.searchActive)).toBe(true);
  });
});
