import { TemplateRenderer } from '@tamu-gisc/common/utils/string';
import { containsSearch } from '@tamu-gisc/ui-kits/ngx/search';

import { TailgatingColdLayerSources, TailgatingConfiguration } from './tailgating.definitions';

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

  it('matches what is typed anywhere in a field, ignoring case, as every contains search does', () => {
    for (const source of active) {
      expect(source.queryParams).toEqual(containsSearch(keysOf(source)));
    }
  });

  it('keeps exact matching for the ?zone= and ?tent= links, which are not searched themselves', () => {
    const links = (TailgatingConfiguration.searchSources ?? []).filter((source) => source.urlQueryParam);

    expect(links.map((source) => source.urlQueryParam)).toEqual(['zone', 'tent']);
    expect(links.every((source) => !source.searchActive)).toBe(true);
  });

  it('searches only layers the map draws, so a picked result opens on the map', () => {
    const drawn = TailgatingColdLayerSources.map((source) => (source as { url?: string }).url);

    expect(active.filter((source) => !drawn.includes(source.url)).map((source) => source.source)).toEqual([]);
  });

  it('lists a tent by its id', () => {
    const [tents] = active;

    expect(new TemplateRenderer({ lookup: { attributes: { tent_id: 'O12' } }, template: tents.displayTemplate }).render()).toBe(
      'Tent O12'
    );
  });

  it('lists a named area by its name, or by its zone id while it has none', () => {
    const areas = active.filter((source) => keysOf(source).includes('zone_ID'));
    const listed = (attributes: Record<string, unknown>) =>
      areas.map((source) => new TemplateRenderer({ lookup: { attributes }, template: source.displayTemplate }).render());

    expect(listed({ name: 'Ortega Lawn', zone_ID: 'AP-7' })).toEqual(['Ortega Lawn', 'Ortega Lawn']);
    expect(listed({ name: null, zone_ID: 'AP-7' })).toEqual(['AP-7', 'AP-7']);
    expect(listed({ name: '', zone_ID: 'AP-7' })).toEqual(['AP-7', 'AP-7']);
  });
});
