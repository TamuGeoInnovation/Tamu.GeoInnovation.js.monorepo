import { Connections, Definitions, LayerSources, SearchSources } from './definitions';

/**
 * UES Operations' search (#2420). Seven of its searches still asked `ues-arc.tamu.edu`, a host that accepts no
 * connection, after the map itself had moved to the operations service on `pgis-arc-p1.apogee.tamu.edu`. The search
 * shows nothing until every source has answered, so each search waited for those seven to time out: about five minutes
 * on UES's network, 43 seconds from the lab.
 */
describe('UES Operations search sources (#2420)', () => {
  /** A host that never answers a search, so asking it holds every search until its requests time out. */
  const RETIRED_HOSTS = ['ues-arc.tamu.edu'];
  const active = SearchSources.filter((s) => s.searchActive);

  const uesLayers = [
    Definitions.DOMESTIC_COLD_WATER,
    Definitions.WELL_SITES,
    Definitions.FIRE_HYDRANTS,
    Definitions.UES_NATURAL_GAS_METERS,
    Definitions.GENERATORS,
    Definitions.TRANSFORMER,
    Definitions.ELECTRICAL_MANHOLES
  ];

  it('asks no host that never answers', () => {
    const asked = active.map((s) => ({ source: s.source, host: new URL(s.url).host }));

    expect(asked.filter((a) => RETIRED_HOSTS.includes(a.host))).toEqual([]);
  });

  it("searches UES's layers on the operations service the map draws", () => {
    const map = LayerSources.find((l) => l.id === 'ues-map-server') as { url?: string } | undefined;

    expect(map?.url).toBe(Connections.uesOperationsUrl);

    for (const layer of uesLayers) {
      expect(layer.url, layer.name).toMatch(new RegExp(`^${Connections.uesOperationsUrl}/\\d+$`));
    }
  });

  it('does not search transformers until UES says which field holds what UESID held', () => {
    const transformers = SearchSources.filter((s) => s.source === Definitions.TRANSFORMER.id);

    expect(transformers.length).toBeGreaterThan(0);
    expect(transformers.every((s) => !s.searchActive)).toBe(true);
  });
});
